import { getSyncManager } from '../amr/sync/sync-manager'

class HandleSync {
    handle(message) {
        switch (message.action) {
            case "sync_update":
                getSyncManager().updateSync(message.key, message.value)
                return Promise.resolve(true);
            case "sync_config_update":
                getSyncManager().updateStorageConf(message.key, message.value)
                return Promise.resolve(true);
        }
    }
}
export default (new HandleSync)
