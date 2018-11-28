class HandleNavigation {
    handle(message, sender) {
        switch (message.action) {
            // Set bar state
            case "setBarState":
                localStorage.isBarVisible = message.barstate;
                return Promise.resolve({});
            // hide navigation bar --> keeps its state
            case "hideBar":
                localStorage.isBarVisible = (localStorage.isBarVisible + 1) % 2
                return Promise.resolve({
                    res: localStorage.isBarVisible
                });
            // show navigation bar
            case "showBar":
                localStorage.isBarVisible = 1;
                return Promise.resolve({});
            // get current state of navigation bar
            case "barState":
                return Promise.resolve({
                    barVis: localStorage.isBarVisible === undefined ? 1 : localStorage.isBarVisible
                });
        }
    }
}
export default (new HandleNavigation)