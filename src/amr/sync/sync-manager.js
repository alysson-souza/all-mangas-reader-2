import { ThrottleError } from '../storage/error/ToManyRequests';
import GistStorage from '../storage/gist-storage'
import BrowserStorage from '../storage/browser-storage';
import { createLocalStorage } from '../storage/local-storage';
import * as syncUtils from './utils'
import { debug } from '../utils'
import Storage from '../storage/model-storage';

const remoteStorages = {
    GistStorage,
    BrowserStorage
}

const defaultConfig = {
    syncInterval: 30 * 1000,
    syncEnabled: 0,
    gistSyncEnabled: 0,
    gistSyncSecret: undefined,
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
            if(storage.retryDate && storage.retryDate.getTime() > Date.now()) {
                debug(`[SYNC-${storage.constructor.name.replace('Storage', '')}] Skipping sync due to present retry date until ${storage.retryDate.toISOString()}`)
            } else {
                this.checkData(storage)
                .then(debug)
                .catch(e => {
                    if(e instanceof ThrottleError) {
                        storage.retryDate = e.getRetryAfterDate()
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

    async processUpdatesToLocal(localList, remoteList) {
        const localUpdates = [];
        for(const manga of remoteList) {
            if(!this.shouldSkipSync(manga)) {
                // Check if need to be sync to remote
                const localManga = localList.find(m => m.key === manga.key);
                if (!localManga || localManga.ts < manga.ts) {
                    localUpdates.push({ ...manga });
                }
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
     * Cant actually delete it due to sync, need to mark it as deleted
     * @param {string} key
     * @return {Promise<*>}
     */
    async deleteManga(key) {
        for (const storage of this.remoteStorages) {
            await storage.delete(key, {
                key,
                ts: Math.round(Date.now() / 1000),
                deleted: syncUtils.DELETED,
            })
        }
    }
}

let instance;
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
