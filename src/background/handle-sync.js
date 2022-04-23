class HandleSync {
    handle(message) {
        switch (message.action) {
            case "sync_update":
                return window["AMR_STORE"].dispatch("updateSync", true)
        }
    }
}
export default new HandleSync()
