import { ThrottleError } from '../storage/error/ToManyRequests';
import GistStorage from '../storage/gist-storage'
import BrowserStorage from '../storage/browser-storage';
import { createLocalStorage } from '../storage/local-storage';
import * as syncUtils from './utils'
import * as utils from "../../amr/utils";
import { debug } from '../utils'
import Storage from '../storage/model-storage';
import mutations from './mutation';

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

   init(config, vuexStore) {
        this.config = { ...defaultConfig, ...config };
        this.localStorage = createLocalStorage(vuexStore)
        this.start()
        return this
    }

    start() {
        for(const storage of this.getStorageConf()) {
            if(storage.config.enabled) {
                if(!this.remoteStorages.find(s => s.constructor.name === storage.name)) {
                    const store = new remoteStorages[storage.name](storage.config)
                    store.syncInterval = setInterval(this.triggerSync.bind(this, store.constructor.name), store.interval)
                    this.remoteStorages.push(store)
                    this.triggerSync(store.name)
                }
            }
        }
    }

    stop() {
        for(const storage of this.getStorageConf()) {
            if(!storage.config.enabled) {
                let store = this.remoteStorages.find(s=> s.constructor.name === storage.name)
                if(store) {
                    clearInterval(store.syncInterval)
                    this.remoteStorages = this.remoteStorages.filter(s => s.constructor.name !== storage.name)
                }
            }
        }
        // unset watcher
        this.localStorage.vuexStore.dispatch("setOption", {key: 'isSyncing', value: 0})
    }

    updateSync(key, value) {
        this.config[key] = value;
        this.config[key] ? this.start() : this.stop();
    }

    updateStorageConf(key, value) {
        const provider = key.replace(/Sync.*|sync.*/, '')
        for(const storage of this.remoteStorages) {
            if(storage.constructor.name.toLowerCase().includes(provider)) {
                storage.reconfig(key, value)
            }
        }
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
     *
     * @param {String} storageName
     */
    async triggerSync(storageName) {
        const storage = this.remoteStorages.find((store) => store.constructor.name === storageName)
        if(storage) {
            // Get update chapter and convert watchers
            const isUpdating = this.localStorage.vuexStore.state.options.isUpdatingChapterLists
            const isConverting = this.localStorage.vuexStore.state.options.isConverting

            // skip if one of these is running (sync-manager will retry by itself)
            if(isUpdating || isConverting) {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Skipping sync due to chapter lists being updated`)
                return;
            }

            if(storage.retryDate && storage.retryDate.getTime() > Date.now()) {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Skipping sync due to present retry date until ${storage.retryDate.toISOString()}`)
            } else {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Starting sync`)
                this.localStorage.vuexStore.dispatch("setOption", {key: 'isSyncing', value: 1}) // Set watcher
                this.checkData(storage)
                .then(res => {
                    this.localStorage.vuexStore.dispatch("setOption", {key: 'isSyncing', value: 0}) // Unset watcher when done
                    debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Done`)
                    debug(res)
                })
                .catch(e => {
                    this.localStorage.vuexStore.dispatch("setOption", {key: 'isSyncing', value: 0}) // Unset watcher on errors
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
     * @returns
     */
    async checkData(storage) {
        const storageName = storage.constructor.name.replace('Storage', '')
        debug(`[SYNC-${storageName}] Checking sync data`);
        const localList = await this.localStorage.loadMangaList();
        const remoteList = await storage.getAll()
        debug(`[SYNC-${storageName}] Comparing local and remote list`);
        this.processOptionsUpdatesToLocal(localList, remoteList)
        const remote = await this.processUpdatesToRemote(localList, storage, remoteList)
        const local = await this.processUpdatesToLocal(localList, remoteList)
        debug(`[SYNC-${storageName}] Completed sync data check`);
        return { local, remote };
    }


    shouldSkipSync(manga) {
        return manga.deleted === syncUtils.DELETED || manga.key === syncUtils.FAIL_KEY
    }
    /**
     * @param {[]} localList
     * @param {Storage} remoteStorage
     * @param {[]} remoteList
     */
    async processUpdatesToRemote(localList, remoteStorage, remoteList) {
        const remoteUpdates = [];
        for (const local of localList) {
            if(!this.shouldSkipSync(local)) {
                const remoteManga = remoteList.find(m => m.key === local.key);
                if (!remoteManga || remoteManga.ts < local.ts) {
                    remoteUpdates.push({ ...local, listChaps: [] });
                }
            }
        }

        if (remoteUpdates.length === 0) {
            debug(`[SYNC-${remoteStorage.constructor.name.replace('Storage', '')}] nothing to update`)
            return remoteUpdates;
        }

        debug(`[SYNC-${remoteStorage.constructor.name.replace('Storage', '')}] Syncing ${remoteUpdates.length} keys to remote storage`)
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
    processOptionsUpdatesToLocal(localList, remoteList) {
        for(const remoteManga of remoteList) {
            const localManga = localList.find(m => m.key === remoteManga.key)
            if(localManga && !this.shouldSkipSync(localManga)) {
                if(localManga.read !== remoteManga.read) this.localStorage.commit('setMangaReadTop', localManga)
                if(localManga.update !== remoteManga.update) this.localStorage.commit('setMangaUpdateTop', localManga)
                if(localManga.display !== remoteManga.display) this.localStorage.commit('setMangaDisplayMode', localManga)
                if(localManga.layout !== remoteManga.layout) this.localStorage.commit('setMangaLayoutMode', localManga)
                if(localManga.webtoon !== remoteManga.webtoon) this.localStorage.commit('setMangaWebtoonMode', localManga)
                if(localManga.displayName !== remoteManga.displayName) this.localStorage.commit('setMangaDisplayName', localManga)
            }
        }
    }
    async processUpdatesToLocal(localList, remoteList) {
        const localUpdates = [];
        for (const remoteManga of remoteList) {
            const localManga = localList.find(m => m.key === remoteManga.key);
            if (this.shouldSyncToLocal({ localManga, remoteManga })) {
                // force update local entry before mergin it with remote data.
                if(localManga) await dispatch("refreshLastChapters", localManga)
                localUpdates.push({ ...remoteManga });
            }
        }

        if (localUpdates.length === 0) {
            debug('[SYNC-LocalStorage] nothing to update')
            return localUpdates;
        }

        debug(`[SYNC-LocalStorage] Syncing ${localUpdates.length} keys to storage`)
        await this.localStorage.syncLocal(localUpdates);
        return localUpdates;
    }


    /**
     * Don't have local copy and remote manga is not skipped
     * or remote manga have newer timestamp
     *
     * @param localManga
     * @param remoteManga
     * @return {boolean}
     */
    shouldSyncToLocal({ localManga, remoteManga }) {
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
    async setToRemote(mutation) {
        let { url, mirror, language, key } = mutation.payload
        if(!key) key = utils.mangaKey(url, mirror, language)
        for(const storage of this.remoteStorages) {
            const remoteList = await storage.getAll()
            let mg = remoteList.find(m => m.key === key)
            if(!mg) return
            const mutationActions = mutations.find(m => m.type === mutation.type)
            if(!mutationActions) return
            mg = mutationActions.setToRemote(mg, mutation.payload)

            if(storage.isdb) {
                storage.set(mg)
            } else {
                await storage.saveAll(remoteList).catch(e => {
                    if(e instanceof ThrottleError) {
                        storage.retryDate = e.getRetryAfterDate()
                        const later = storage.retryDate.getTime() - Date.now() + 2000
                        setTimeout(() => {
                            this.set(mutation)
                        }, later)
                    } else if(e instanceof Error) {
                        debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] ${e.message}`)
                    }
                })
            }
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
export const getSyncManager = (config, vuexStore) => {
    if (!instance) {
        instance = new SyncManager();
    }
    if(config && vuexStore) {
        return instance.init(config, vuexStore)
    } else {
        return instance
    }
}
