class HandleNavigation {
    handle(message, sender) {
        switch (message.action) {
            // Set bar state
            case "setBarState":
                localStorage.isBarVisible = message.barstate
                return Promise.resolve({})
            // hide navigation bar --> keeps its state
            case "hideBar":
                localStorage.isBarVisible = (localStorage.isBarVisible + 1) % 2
                return Promise.resolve({
                    res: localStorage.isBarVisible
                })
            // show navigation bar
            case "showBar":
                localStorage.isBarVisible = 1
                return Promise.resolve({})
            // get current state of navigation bar
            case "barState":
                return Promise.resolve({
                    barVis: localStorage.isBarVisible === undefined ? 1 : localStorage.isBarVisible
                })
            // get a value from localStorage
            case "get_storage":
                return Promise.resolve(localStorage[message.key])
            // set a Value in localStorage
            case "set_storage":
                localStorage[message.key] = message.value
                return Promise.resolve()
            // set a Value in localStorage
            case "save_option":
                window["AMR_STORE"].dispatch("setOption", { key: message.key, value: message.value })
                return Promise.resolve()
        }
    }
}
export default new HandleNavigation()
