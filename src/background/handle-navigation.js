class HandleNavigation {
    handle(message, sender) {
        switch (message.action) {
            // hide navigation bar --> keeps its state
            case "hideBar":
                if (localStorage.isBarVisible == 1) {
                    localStorage.isBarVisible = 0;
                } else {
                    localStorage.isBarVisible = 1;
                }
                return Promise.resolve({
                    res: localStorage.isBarVisible
                });
            // show navigation bar
            case "showBar":
                localStorage.isBarVisible = 1;
                return Promise.resolve({});
            // get current state of navigation bar
            case "barState":
                if (localStorage.isBarVisible === undefined) {
                    return Promise.resolve({
                        barVis: 1
                    });
                } else {
                    return Promise.resolve({
                        barVis: localStorage.isBarVisible
                    });
                }
        }
    }
}
export default (new HandleNavigation)