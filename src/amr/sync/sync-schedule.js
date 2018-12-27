import { createSync, SyncManager } from './sync-manager'
import { debug } from '../utils';

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

    start() {
        if (this.config.syncEnabled && !this.syncInterval) {
            debug("Starting sync process");
            this.triggerSync();
            this.syncInterval = setInterval(this.triggerSync.bind(this), this.config.syncInterval);
        }
    }

    stop() {
        clearInterval(this.syncInterval)
    }

    triggerSync() {
        this.syncManager.checkData().then(debug).catch(debug)
    }
}

let instance;
export const getSyncSchedule = (config) => {
    if (!instance) {
        instance = new SyncSchedule(createSync(config), config);
    }
    return instance
}
