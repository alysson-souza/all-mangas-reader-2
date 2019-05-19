import { getSyncSchedule } from '../amr/sync/sync-schedule'

class HandleSync {
    handle(message) {
        switch (message.action) {
            case "sync_update":
                getSyncSchedule().updateSync(message.value)
                return Promise.resolve(true);
        }
    }
}
export default (new HandleSync)
