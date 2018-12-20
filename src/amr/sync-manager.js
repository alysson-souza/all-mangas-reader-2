import { arrayToObject, debug, objectMapToArray } from './utils'
import BrowserStorage from './storage/browser-storage'

/**
 * TODO: Merge list when enabled on multiple devices
 */
export class SyncManager {

    /**
     * @param {BrowserStorage} storage
     */
    constructor(storage) {
        this.storage = storage;
        this.lastUpdated = 0;
    }

    async save(key, value) {
        return this.storage.save(key, value)
    }

    async saveAll(data) {
        if (Array.isArray(data)) {
            data = arrayToObject(data, 'key');
        }

        return this.storage.set(data).then(() => {
            debug(`Synchronized ${Object.keys(data).length} items to storage`)
        });
    }

    async loadMangaList() {
        return this.storage.getAll().then(result => {
            debug(result);
            return objectMapToArray(result).filter(i => typeof i === 'object');
        });
    }
}

export const createSync = () => new SyncManager(new BrowserStorage());
