import { createSync, SyncManager } from './sync-manager'
import { debug } from '../utils';
import { ThrottleError } from '../storage/error/ToManyRequests';

const defaultConfig = {
    syncInterval: 30 * 1000,
    syncEnabled: 0,
}

class SyncSchedule {

    /**
     *
     * @param {SyncManager} syncManager
     * @param config
     */
    constructor(syncManager, config) {
        this.config = { ...defaultConfig, ...config };
        this.syncManager = syncManager;
        this.triggerSync.bind(this);
    }

    async start() {
        if (this.config.syncEnabled && !this.syncInterval) {
            debug("[SYNC] Starting sync process");
            const result = this.triggerSync();
            this.syncInterval = setInterval(this.triggerSync.bind(this), this.config.syncInterval);
            return result;
        }
    }

    stop() {
        clearInterval(this.syncInterval)
    }

    async triggerSync() {
        if (this.retryDate && this.retryDate.getTime() > Date.now()) {
            debug(`[SYNC] Skipping sync due to present retry date until ${this.retryDate.toISOString()}`)
            return
        }

        return this.syncManager.checkData()
        .then(debug)
        .catch((e) => {
            if (e instanceof ThrottleError) {
                this.retryDate = e.getRetryAfterDate();
            }
        })
    }

    updateSync(value) {
        this.config.syncEnabled = value;
        this.config.syncEnabled ? this.start() : this.stop();
    }
}

let instance;
export const getSyncSchedule = (config) => {
    if (!instance) {
        instance = new SyncSchedule(createSync(config), config);
    }
    return instance
}
