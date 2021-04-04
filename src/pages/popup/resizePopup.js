/**
 * This class allows AMR to resize correctly the popup when DOM is changed
 */
class PopupResizer {
    constructor() {
        this.maxHeight = 500;
        this.oldHeight = 0;
        this.bottomel;
        this.starttime = 0;
        this.boundListener;
        this.clicked = false;
        this.workingTime = 3000;
        this.stop = false;
        this.blocked = false;
    }

    /**
     * This method is using requestAnimationFrame to watch for the bottom of the app to move. It resizes
     * the popup consequently. It runs for two seconds and then stops after registering a click listener.
     * On click, it is restarted for workingTime milliseconds. Perhaps we will need to add other events
     * listeners which action could affect the popup's height
     */
    checkHeight() {
        if (!this.bottomel) this.bottomel = document.getElementById("__bottom_app__");
        if (this.stop || this.starttime > 0 && Date.now() - this.starttime > this.workingTime) {
            this.boundListener = this.clickWindow.bind(this);
            window.addEventListener("click", this.boundListener);
            //console.log("stop checking");
            this.starttime = 0;
            this.clicked = false;
            this.stop = false;
            return;
        }
        if (this.bottomel) {
            if (this.starttime == 0) this.starttime = Date.now();
            let cur = this.bottomel.getBoundingClientRect().bottom;
            if (cur !== this.oldHeight && !this.blocked) {
                this.oldHeight = cur;
                document.getElementsByTagName("body")[0].style["height"] = cur + "px";
                document.documentElement.style["height"] = cur + "px";
            }
        }
        requestAnimationFrame(this.checkHeight.bind(this));
    }

    /**
     * We restart the height watcher when a click in the popup occurs
     */
    clickWindow() {
        if (this.clicked) return; // just to be sure we can't enter this function two times
        this.clicked = true;
        //console.log("check again");
        window.removeEventListener("click", this.boundListener);
        this.checkHeight();
    }

    /**
     * Sets the current height of the popup to the height of content
     */
    setHeightToCurrent() {
        //console.log("set height to current");
        this.blocked = false;
        if (!this.bottomel) this.bottomel = document.getElementById("__bottom_app__");
        let cur = this.bottomel.getBoundingClientRect().bottom
        document.getElementsByTagName("body")[0].style["height"] = cur + "px";
        document.documentElement.style["height"] = cur + "px";
        this.clickWindow();
    }

    /**
     * Set height to max (when options is opened for example)
     */
    setHeightToMax() {
        //console.log("set max height");
        this.stop = true;
        this.blocked = true;
        document.getElementsByTagName("body")[0].style["height"] = this.maxHeight + "px";
        document.documentElement.style["height"] = this.maxHeight + "px";
    }
}
export default (new PopupResizer)
