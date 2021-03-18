import { debug } from '../utils';
import BrowserStorage from '../storage/browser-storage';
import { createLocalStorage } from '../storage/local-storage';
import * as syncUtils from './utils'

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
     * @param {LocalStorage} localStorage
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
        const localList = await this.localStorage.loadMangaList();
        const remoteList = await this.storage.getAll();

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

            if (this.shouldSkipSync(manga)) {
                return;
            }

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
        try {
           await this.storage.saveAll(remoteUpdates);
        } catch (e) {
            this.log(`Failed to sync keys to remote storage: ${e.message}`, e);
            throw e;
        }

        return remoteUpdates;
    }

    async processUpdatesToLocal(localList, remoteList) {
        const localUpdates = [];

        remoteList.forEach(manga => {

            if (this.shouldSkipSync(manga)) {
                return;
            }

            // Check if need to be sync to remote
            const localManga = localList.find(m => m.key === manga.key);
            if (!localManga || localManga.ts < manga.ts) {
                localUpdates.push({ ...manga });
            }
        })

        if (localUpdates.length === 0) {
            this.log('Local storage - nothing to update')
            return localUpdates;
        }

        this.log(`Syncing ${localUpdates.length} keys to local storage`)
        await this.localStorage.syncLocal(localUpdates);
        return localUpdates;
    }

    shouldSkipSync(manga) {
        return manga.deleted === syncUtils.DELETED || manga.key === syncUtils.FAIL_KEY
    }

    /**
     * Cant actually delete it due to sync, need to mark it as deleted
     * @param {string} key
     * @return {Promise<*>}
     */
    async deleteManga(key) {
        return this.storage.save(key, {
            key,
            ts: Math.round(Date.now() / 1000),
            deleted: syncUtils.DELETED,
        }).then(this.log)
    }
}

export const createSync = () => new SyncManager(createLocalStorage(), new BrowserStorage());
