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

    start() {
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
                this.dispatch("setOption", {key: 'isSyncing', value: 1}) // Set watcher
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
        const local = []
        const remote = []
        for(const remoteManga of remoteList) {
            const localManga = localList.find(m => m.key === remoteManga.key)
            if(localManga && !this.shouldSkipSync(localManga)) {
                if(remoteManga.deleted === syncUtils.DELETED && remoteManga.ts > localManga.ts) {
                    this.localStorage.dispatch('deleteManga', localManga, true)
                    local.push(localManga)
                    remote.push(remoteManga)
                    continue
                }
                if(remoteManga.tsOpts > localManga.tsOpts) {
                    if(localManga.read !== remoteManga.read) this.localStorage.dispatch('setMangaReadTop', remoteManga, true)
                    if(localManga.update !== remoteManga.update) this.localStorage.dispatch('setMangaUpdateTop', remoteManga, true)
                    if(localManga.display !== remoteManga.display) this.localStorage.dispatch('setMangaDisplayMode', remoteManga, true)
                    if(localManga.layout !== remoteManga.layout) this.localStorage.dispatch('setMangaLayoutMode', remoteManga, true)
                    if(localManga.webtoon !== remoteManga.webtoon) this.localStorage.dispatch('setMangaWebtoonMode', remoteManga, true)
                    if(localManga.displayName !== remoteManga.displayName) this.localStorage.dispatch('setMangaDisplayName', remoteManga, true)
                }
            }
            if(this.shouldSyncToLocal(localManga, remoteManga)) {
                if(localManga) await this.localStorage.dispatch("refreshLastChapters", localManga)
                this.localStorage.syncLocal(remoteManga)
            }
        }
        return {local, remote}
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
                if(typeof(local.tsOpts) === 'undefined') {
                    await this.dispatch('setMangaTsOpts', local)
                }
                if(typeof(remoteManga.tsOpts) === 'undefined') {
                    await this.setToRemote(local, 'tsOpts', remoteStorage)
                }
                if (!remoteManga || remoteManga.ts < local.ts) {
                    await this.setToRemote(local, 'ts', remoteStorage)
                }
                if(remoteManga && remoteManga.tsOpts < local.tsOpts) {
                    if(local.read !== remoteManga.read) await this.setToRemote(local, 'read', remoteStorage)
                    if(local.update !== remoteManga.update) await this.setToRemote(local, 'update', remoteStorage)
                    if(local.display !== remoteManga.display) await this.setToRemote(local, 'display', remoteStorage)
                    if(local.layout !== remoteManga.layout) await this.setToRemote(local, 'layout', remoteStorage)
                    if(local.webtoon !== remoteManga.webtoon) await this.setToRemote(local, 'webtoon', remoteStorage)
                    if(local.displayName !== remoteManga.displayName) await this.setToRemote(local, 'displayName', remoteStorage)
                }
            }
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
            let remoteManga = remoteList.find(m => m.key === localManga.key)
            if(mutatedKey === 'ts') {
                // No remote manga (new manga to add)
                if(!remoteManga) remoteManga = localManga 
                else if(remoteManga.ts < localManga.ts) {
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

            if(remoteManga.deleted = syncUtils.DELETED) {
                delete remoteManga.deleted
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
