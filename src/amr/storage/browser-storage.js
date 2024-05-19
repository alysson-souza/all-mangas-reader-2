import browser from "webextension-polyfill"
import { arrayToObject, batchProps, objectMapToArray } from "../../shared/utils"
import { ThrottleError } from "./error/ToManyRequests"
import Storage from "./model-storage"

const LIMITS = {
    MAX_ITEMS: 512,
    MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: 1000000,
    MAX_WRITE_OPERATIONS_PER_HOUR: 1800,
    MAX_WRITE_OPERATIONS_PER_MINUTE: 120,
    QUOTA_BYTES: 102400,
    QUOTA_BYTES_PER_ITEM: 8192
}

const ThrottleErrorMessages = Object.keys(LIMITS).filter(k => k.includes("OPERATIONS"))

/**
 * The sync object implements the methods defined on the storage.StorageArea type
 * @link https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/sync
 */
export default class BrowserStorage extends Storage {
    name = "Browser"

    /**
     * @param {number} interval
     */
    constructor(config) {
        super(true)
        this.storageSync = browser.storage.sync
        this.batchSize = 10
    }

    async remove(keys) {
        await this.wait()
        this.storageSync.remove(keys)
    }

    async getAll() {
        await this.wait()
        return this.storageSync
            .get()
            .then(result => objectMapToArray(result))
            .then(data => data.filter(i => typeof i === "object"))
    }

    async save(key, value) {
        await this.wait()
        return this.storageSync.set({ [key]: value }).catch(this.handleSyncError)
    }

    async delete(key, value) {
        return this.save(key, value)
    }
    /**
     * @param {{}} data
     */
    async set(data) {
        if (typeof data === "object") {
            if (Object.keys(data).length > this.batchSize) {
                return this.setInBatches(data)
            }
        }

        try {
            await this.wait()
            return this.storageSync.set(data)
        } catch (e) {
            return this.handleSyncError(e)
        }
    }

    async get(key) {
        await this.wait()
        return this.storageSync.get(key).catch(this.handleSyncError)
    }

    saveAll(data) {
        if (Array.isArray(data)) {
            data = arrayToObject(data, "key")
        }

        return this.set(data)
    }

    clear() {
        this.storageSync.clear()
    }

    getBytesInUse() {
        this.storageSync.getBytesInUse()
    }

    setInBatches(data) {
        const batchedKeys = batchProps(data, this.batchSize)
        const promises = batchedKeys.map(async batch => {
            await this.wait()
            return this.storageSync.set(batch)
        })

        return Promise.all(promises).catch(this.handleSyncError)
    }

    /**
     * @private
     * @param e Error
     */
    handleSyncError(e) {
        if (ThrottleErrorMessages.some(msg => e.message.includes(msg))) {
            // Delay by 30min
            const timestamp = Date.now() + 1800 * 1000
            throw new ThrottleError(e.message, new Date(timestamp))
        }

        throw e
    }
}
