import { arrayToObject, debug, objectMapToArray } from '../utils'
import BrowserStorage from '../storage/browser-storage'
import StoreDB from '../storedb'

/**
 *
 * TODO: Merge list when enabled on multiple devices
 * Fetch all manga lists for keys that were updated,
 * Reconcile what changed
 *  - Based on last updated time? ({mangaKey:  timestamp})
 *  - Send newer version of chapters to the server
 */
export class SyncManager {

    /**
     * @param {StoreDB} localStorage
     * @param {BrowserStorage} storage
     */
    constructor(localStorage, storage) {
        this.storage = storage;
        this.localStorage = localStorage;
    }

    log(msg) {
        debug(typeof msg === 'string' ? `[SYNC] ${msg}` : msg);
    }

    async checkData() {
        this.log('Checking sync data');
        const localList = await this.localStorage.getMangaList();
        const remoteList = await this.loadMangaList();

        this.log('Comparing local and remote list');
        this.log({ localList, remoteList });

        const remote = await this.processUpdatesToRemote(localList, remoteList)
        const local = await this.processUpdatesToLocal(localList, remoteList)

        this.log('Completed sync data check');
        return { local, remote };
    }

    async processUpdatesToRemote(localList, remoteList) {
        const remoteUpdates = [];

        localList.forEach(manga => {

            // Check if need to be sync to remote
            const remoteManga = remoteList.find(m => m.key === manga.key);
            if (!remoteManga || remoteManga.ts < manga.ts) {
                remoteUpdates.push({ ...manga, listChaps: [] });
            }
        })

        if (remoteUpdates.length === 0) {
            this.log('Remote storage - nothing to update')
            return remoteUpdates;
        }

        this.log(`Syncing ${remoteUpdates.length} keys to remote storage`)
        await this.saveAll(remoteUpdates);

        return remoteUpdates;
    }

    async processUpdatesToLocal(localList, remoteList) {
        const localUpdates = [];

        remoteList.forEach(manga => {

            // Check if need to be sync to remote
            const localManga = localList.find(m => m.key === manga.key);
            if (!localManga || localManga.ts < manga.ts) {
                localUpdates.push({ ...manga, listChaps: [] });
            }
        })

        if (localUpdates.length === 0) {
            this.log('Local storage - nothing to update')
            return localUpdates;
        }

        this.log(`Syncing ${localUpdates.length} keys to remote storage`)
        // @TODO save to local storage

        return localUpdates;
    }

    async save(key, value) {
        return this.storage.save(key, value)
    }

    async saveAll(data) {
        if (Array.isArray(data)) {
            data = arrayToObject(data, 'key');
        }

        return this.storage.set(data).then(() => {
            this.log(`Synchronized ${Object.keys(data).length} items to storage`)
        });
    }

    async loadMangaList() {
        return this.storage.getAll().then(result => {
            this.log(result);
            return objectMapToArray(result).filter(i => typeof i === 'object');
        });
    }

}

export const createSync = () => new SyncManager(StoreDB, new BrowserStorage());
