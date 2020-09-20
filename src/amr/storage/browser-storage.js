import browser from 'webextension-polyfill'
import { arrayToObject, batchProps, objectMapToArray } from '../utils'
import { ThrottleError } from './error/ToManyRequests';

const LIMITS = {
    MAX_ITEMS: 512,
    MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 1000000,
    MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
    MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
    QUOTA_BYTES: 102400,
    QUOTA_BYTES_PER_ITEM: 8192,
}

const ThrottleErrorMessages = Object.keys(LIMITS).filter(k => k.includes('OPERATIONS'));

/**
 * The sync object implements the methods defined on the storage.StorageArea type
 * @link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync
 */
export default class BrowserStorage {

    constructor() {
        this.storageSync = browser.storage.sync;
        this.batchSize = 10;
    }

    remove(keys) {
        this.storageSync.remove(keys)
    }

    getAll() {
        return this.storageSync.get()
        .then(result => objectMapToArray(result))
        .then(data => data.filter(i => typeof i === 'object'));
    }

    save(key, value) {
        return this.storageSync.set({[key]: value}).catch(this.handleSyncError)
    }

    /**
     * @param {{}} data
     */
    set(data) {

        if (typeof data === 'object') {
            if (Object.keys(data).length > this.batchSize) {
                return this.setInBatches(data)
            }
        }

        return this.storageSync.set(data).catch(this.handleSyncError)
    }

    get(key) {
        return this.storageSync.get(key).catch(this.handleSyncError)
    }

    saveAll(data) {
        if (Array.isArray(data)) {
            data = arrayToObject(data, 'key');
        }

        return this.set(data);
    }

    clear() {
        this.storageSync.clear();
    }

    getBytesInUse() {
        this.storageSync.getBytesInUse();
    }

    setInBatches(data) {
        const batchedKeys = batchProps(data, this.batchSize)
        const promises = batchedKeys.map(batch => this.storageSync.set(batch))

        return Promise.all(promises).catch(this.handleSyncError)
    }

    /**
     * @private
     * @param e Error
     */
    handleSyncError(e) {
      if (ThrottleErrorMessages.some(msg => e.message.includes(msg))) {

          // Delay by 30min
          const timestamp = Date.now() + (1800 * 1000);
          throw new ThrottleError(e.message, new Date(timestamp))
      }

      throw e;
    }
}
