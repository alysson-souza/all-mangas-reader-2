import { ThrottleError } from '../storage/error/ToManyRequests';
import GistStorage from '../storage/gist-storage'
import BrowserStorage from '../storage/browser-storage';
import { createLocalStorage } from '../storage/local-storage';
import * as syncUtils from './utils'
import * as utils from "../../amr/utils";
import { debug } from '../utils'
import Storage from '../storage/model-storage';
import Manga from '../manga';

const remoteStorages = {
    GistStorage,
    BrowserStorage
}

const defaultConfig = {
    syncInterval: 30 * 1000,
    syncEnabled: 0,
    gistSyncEnabled: 0,
}

class SyncManager {
    constructor() {
        /**
         * remoteStorages
         * @type {(Storage)[]}
         */
        this.remoteStorages = []
    }

   init(config, vuexStore, dispatch) {
        this.config = { ...defaultConfig, ...config };
        this.vuexStore = vuexStore
        this.localStorage = createLocalStorage(dispatch)
        this.dispatch = dispatch
        for(const storage of this.getStorageConf()) {
            if(storage.config.enabled) {
                if(!this.remoteStorages.find(s => s.constructor.name === storage.name)) {
                    const store = new remoteStorages[storage.name](storage.config)
                    this.remoteStorages.push(store)
                }
            }
        }
        return this
    }

    async start() {
        await this.tsOpts()
        for(const storage of this.remoteStorages) {
            this.triggerSync(storage.constructor.name)
            storage.syncInterval = setInterval(this.triggerSync.bind(this, storage.constructor.name), storage.interval)
        }
    }

    stop() {
        for(const storage of this.remoteStorages) {
            clearInterval(storage.syncInterval)
            this.remoteStorages = []
        }
        // unset watcher
        this.dispatch("setOption", {key: 'isSyncing', value: 0})
    }

    getStorageConf() {
        const configs = Object.keys(this.config)
        const triggerList = []

        configs
            .filter(conf => conf.toLowerCase().includes('syncenabled'))
            .map(p => p.replace(/syncEnabled|SyncEnabled/, ''))
            .forEach(v => {
                const confObj = {}
               configs
                    .filter(c => {
                        if(v === '') {
                            return c === 'syncEnabled'
                        } else {
                            return c.includes(v)
                        }
                    })
                    .forEach(c => {
                        if(c === v+'syncEnabled' || c === v+'SyncEnabled') {
                            confObj.enabled = this.config[c]
                        } else {
                            confObj[c] = this.config[c]
                        }
                    })

                triggerList.push({
                    name: v === '' ? 'BrowserStorage' : v.charAt(0).toUpperCase() + v.substr(1) + 'Storage',
                    config: confObj
                })
            })
        return triggerList
    }
    /**
     * Start the sync subprocess
     * @param {String} storageName
     */
    async triggerSync(storageName) {
        const storage = this.remoteStorages.find((store) => store.constructor.name === storageName)
        if(storage) {
            // Get update chapter and convert watchers
            const isUpdating = this.vuexStore.options.isUpdatingChapterLists
            const isConverting = this.vuexStore.options.isConverting
            const isSyncing = this.vuexStore.options.isSyncing // in case user triggers a sync-out

            // skip if one of these is running (sync-manager will retry by itself)
            if(isUpdating || isConverting || isSyncing) {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Skipping sync due to chapter lists being updated`)
                return;
            }
            if(storage.retryDate && storage.retryDate.getTime() > Date.now()) {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Skipping sync due to present retry date until ${storage.retryDate.toISOString()}`)
            } else {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Starting sync`)
                await this.dispatch("setOption", {key: 'isSyncing', value: 1}) // Set watcher
                this.checkData(storage)
                .then(res => {
                    this.dispatch("setOption", {key: 'isSyncing', value: 0}) // Unset watcher when done
                    debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Done`)
                    debug(res)
                })
                .catch(e => {
                    this.dispatch("setOption", {key: 'isSyncing', value: 0}) // Unset watcher on errors
                    if(e instanceof ThrottleError) {
                        storage.retryDate = e.getRetryAfterDate()
                    } else if(e instanceof Error) {
                        debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] ${e.message}`)
                    }
                })
            }
        }
    }

    /**
     * @param {Storage} storage
     * @returns {Promise<{local: Manga[], remote: Manga[]}>}
     */
    async checkData(storage) {
        const storageName = storage.constructor.name.replace('Storage', '')
        debug(`[SYNC-${storageName}] Checking sync data`);
        const localList = await this.localStorage.loadMangaList();
        const remoteList = await storage.getAll()
        debug(`[SYNC-${storageName}] Comparing local and remote list`);
        const incoming = await this.processUpdatesToLocal(localList, remoteList)
        const outgoing = await this.processUpdatesToRemote(localList, remoteList, storage)
        debug(`[SYNC-${storageName}] Completed sync data check`);
        return { incoming, outgoing };
    }
    /**
     * 
     * @param {Manga[]} local 
     * @param {Manga[]} remote 
     */
    async tsOpts() {
        const local = await this.localStorage.loadMangaList();
        for(const storage of this.remoteStorages) {
            const remote = await storage.getAll()
            let d = Date.now()
            for(const localManga of local) {
                if(typeof(localManga.tsOpts) === 'undefined') await this.dispatch('setMangaTsOpts', localManga, d)
            }
            const upgradedRemote = remote.map(r => {
                if(typeof(r.tsOpts) === 'undefined') r.tsOpts = d
                return r
            })
            if(storage.isdb) {
                storage.set(upgradedRemote)
            } else {
                await storage.saveAll(upgradedRemote).catch(e => {
                    if(e instanceof ThrottleError) {
                        storage.retryDate = e.getRetryAfterDate()
                        const later = storage.retryDate.getTime() - Date.now() + 2000
                        setTimeout(() => {
                            this.tsOpts()
                        }, later)
                    } else if(e instanceof Error) {
                        debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] ${e.message}`)
                    }
                })
            }
        }
    }
    /**
     * Checks if entry is deleted or corrupted
     * @param {Manga} manga 
     * @returns {boolean}
     */
    shouldSkipSync(manga) {
        return manga.deleted === syncUtils.DELETED || manga.key === syncUtils.FAIL_KEY
    }
    /**
     * Compare remote and local version of manga list
     * updates each entries when it's needed 
     * 
     * @param {Manga[]} localList 
     * @param {Manga[]} remoteList 
     * @returns {Promise<{local: Manga[], remote: Manga[]}>}
     */
    async processUpdatesToLocal(localList, remoteList) {
        const localUpdates = []
        for(const remoteManga of remoteList) {
            const localManga = localList.find(m => m.key === remoteManga.key);
            if(localManga) {
                if(remoteManga.deleted === syncUtils.DELETED) {
                    await this.localStorage.dispatch('deleteManga', localManga, true)
                    continue
                }
                if(remoteManga.tsOpts > localManga.tsOpts) {
                    if(localManga.read !== remoteManga.read) await this.localStorage.dispatch('setMangaReadTop', remoteManga, true)
                    if(localManga.update !== remoteManga.update) await this.localStorage.dispatch('setMangaUpdateTop', remoteManga, true)
                    if(localManga.display !== remoteManga.display) await this.localStorage.dispatch('setMangaDisplayMode', remoteManga, true)
                    if(localManga.layout !== remoteManga.layout) await this.localStorage.dispatch('setMangaLayoutMode', remoteManga, true)
                    if(localManga.webtoon !== remoteManga.webtoon) await this.localStorage.dispatch('setMangaWebtoonMode', remoteManga, true)
                    if(localManga.displayName !== remoteManga.displayName) await this.localStorage.dispatch('setMangaDisplayName', remoteManga, true)
                }
                if(remoteManga.ts > localManga.ts) {
                    this.localStorage.syncLocal(remoteManga)
                }
                localUpdates.push(remoteManga)
            } else {
                if(remoteManga.deleted !== syncUtils.DELETED) {
                    localUpdates.push(remoteManga)
                    this.localStorage.syncLocal(remoteManga)
                }
            }
        }
        return localUpdates
    }
    /**
     * @param {[]} localList
     * @param {[]} remoteList
     * @param {Storage} remoteStorage
     */
    async processUpdatesToRemote(localList, remoteList, remoteStorage) {
        const remoteUpdates = [];
        for (const local of localList) {
            if(!this.shouldSkipSync(local)) {
                const remoteManga = remoteList.find(m => m.key === local.key);
                if(!remoteManga) {
                    remoteUpdates.push({ ...local, listChaps: [] })
                    continue
                }
                let save = false
                if (remoteManga.ts < local.ts) {
                    save = true
                    remoteManga.lastChapterReadURL = local.lastChapterReadURL
                    remoteManga.lastChapterReadName = local.lastChapterReadName
                    remoteManga.ts = local.ts
                }
                if(remoteManga.tsOpts < local.tsOpts) {
                    save = true
                    remoteManga.tsOpts = local.tsOpts
                    if(local.read !== remoteManga.read) remoteManga.read = local.read
                    if(local.update !== remoteManga.update) remoteManga.update = local.update
                    if(local.display !== remoteManga.display) remoteManga.display = local.display
                    if(local.layout !== remoteManga.layout) remoteManga.layout = local.layout
                    if(local.webtoon !== remoteManga.webtoon) remoteManga.webtoon = local.webtoon
                    if(local.displayName !== remoteManga.displayName) remoteManga.displayName = local.displayName
                }
                if(save) remoteUpdates.push({ ...remoteManga, listChaps: [] })
            }
        }
        try {
            if(remoteStorage.isdb) {
                await remoteStorage.saveAll(remoteUpdates)
            } else {
                const updatesMap = new Map(remoteUpdates.map(u => [u.key, u]));
                const updates = remoteList.map(r => {
                  const update = updatesMap.get(r.key);
                  if (update) {
                    updatesMap.delete(r.key);
                    return update
                  }
                  return { ...r, listChaps: [] };
                });
                await remoteStorage.saveAll([...updates, ...Array.from(updatesMap.values())]);
            }
        } catch (e) {
            debug(`[SYNC-${remoteStorage.constructor.name.replace('Storage', '')}] Failed to sync keys to storage: ${e.message}`, e);
            throw e;
        }

        return remoteUpdates;
    }

    /**
     * Don't have local copy and remote manga is not skipped
     * or remote manga have newer timestamp
     *
     * @param {Manga} localManga
     * @param {Manga} remoteManga
     * @return {boolean}
     */
    shouldSyncToLocal(localManga, remoteManga) {
        // Don't have local copy, but remote manga is skipped.
        // Should not sync as there are no reason to added *new* deleted entry,
        // that will try to delete non existing local entry forever.
        if (!localManga && this.shouldSkipSync(remoteManga)) {
            return false;
        }

        // Don't have it or remote manga have newer timestamp
        return !localManga || localManga.ts < remoteManga.ts;
    }

    /**
     * Can't actually delete it due to sync, need to mark it as deleted
     * @param {string} key
     * @return {Promise<void>}
     */
    async deleteManga(key) {
        for (const storage of this.remoteStorages) {
            await storage.delete(key, {
                key,
                ts: Math.round(Date.now() / 1000),
                deleted: syncUtils.DELETED,
            }).catch(e => {
                if(e instanceof ThrottleError) {
                    storage.retryDate = e.getRetryAfterDate()
                    const later = storage.retryDate.getTime() - Date.now() + 2000
                    setTimeout(() => {
                        this.deleteManga(key)
                    }, later)
                } else if(e instanceof Error) {
                    debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] ${e.message}`)
                }
            })
        }
    }
    /**
     * Change the value of a specified key
     * 
     * @param {Manga} localManga
     * @param {string} mutatedKey
     * @return {Promise<void>}
     */
    async setToRemote(localManga, mutatedKey, remoteStorage) {
        if(remoteStorage.retryDate && remoteStorage.retryDate.getTime() > Date.now()) {
            debug(`[SYNC-${remoteStorage.constructor.name.replace('Storage', '')}] Skipping sync due to present retry date until ${remoteStorage.retryDate.toISOString()}`)
            return
        }
        if(this.vuexStore.options.isSyncing && !remoteStorage) {
            // retry in 5s if we are already syncing-in
            setTimeout(() => {
                this.setToRemote(localManga, mutatedKey, remoteStorage)
            }, 1000*5)
            return
        }
        if(remoteStorage) {
            this.setToRemoteInternal(localManga ,mutatedKey, remoteStorage)
        } else {
            for(const storage of this.remoteStorages) {
                this.setToRemoteInternal(localManga ,mutatedKey, storage)
            }
        }
    }
    async setToRemoteInternal(localManga, mutatedKey, storage) {
            // get remote Manga
            const remoteList = await storage.getAll()
            const remoteManga = remoteList.find(m => m.key === localManga.key)
            if(!remoteManga) {
                remoteList.push({...localManga, listChaps: []})
            } else {
                if(mutatedKey === 'ts') {
                    // No remote manga (new manga to add)
                    if(remoteManga.ts < localManga.ts) {
                        // Mutations for:
                        // resetManga, updateMangaLastChapter
                        remoteManga.lastChapterReadURL = localManga.lastChapterReadURL
                        remoteManga.lastChapterReadName = localManga.lastChapterReadName
                        remoteManga.ts = localManga.ts
                    }                
                } else if(remoteManga[mutatedKey] !== localManga[mutatedKey]) {
                    // Mutations for:
                    // setMangaDisplayMode, setMangaLayoutMode, setMangaWebtoonMode
                    // setMangaDisplayName, setMangaReadTop, setMangaUpdateTop
                    remoteManga[mutatedKey] = localManga[mutatedKey]
                    remoteManga.tsOpts = localManga.tsOpts
                } else {
                     // skip if there's nothing to update
                    return
                }
                if(remoteManga.deleted === syncUtils.DELETED) {
                    delete remoteManga.deleted
                }
            }



            // save changes
            if(storage.isdb) {
                storage.set(remoteManga)
            } else {
                await storage.saveAll(remoteList).catch(e => {
                    if(e instanceof ThrottleError) {
                        storage.retryDate = e.getRetryAfterDate()
                        const later = storage.retryDate.getTime() - Date.now() + 2000
                        setTimeout(() => {
                            this.setToRemote(localManga, mutatedKey)
                        }, later)
                    } else if(e instanceof Error) {
                        debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] ${e.message}`)
                    }
                })
            }
    }
}

let instance;
/**
 * 
 * @param {*} config 
 * @param {*} vuexStore 
 * @returns {SyncManager} 
 */
export const getSyncManager = (config, vuexStore, dispatch) => {
    if (!instance) {
        instance = new SyncManager();
    }
    if(config && vuexStore) {
        return instance.init(config, vuexStore, dispatch)
    } else {
        return instance
    }
}
