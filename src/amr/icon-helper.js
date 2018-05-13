
import browser from "webextension-polyfill";
import * as utils from "./utils";
import store from "../store";
import amrUpdater from "./amr-updater";

/**
 * Class used to change AMR icon
 */
class IconHelper {
    /**
     * Initialize canvas to draw icon on chrome which does not support animated svg as icon
     */
    constructor() {
        // We spin the sharingan programmatically even in Firefox (which supports animated svg) because this way, we can pass from grey to colored sharingan smoothly and stop the spinning properly
        //if (!utils.isFirefox()) {
            this.doEase = true;
            this.canvas = document.createElement('canvas');
            this.canvas.width = '32';
            this.canvas.height = '32';
            this.canvasContext = this.canvas.getContext('2d');
            this.animationFrames = 20;
            this.animationSpeed = 50;
            this.rotation = 0;
            this.icon = document.createElement('img');
            this.icon.src = '/icons/icon_32.png';
            this.icon_bw = document.createElement('img');
            this.icon_bw.src = '/icons/icon_32_bw.png';
        //}
        this.requireStop = false;
        this.spinning = false;
    }
    updateBadge(nb) {
        browser.browserAction.setBadgeText({text: ""+nb});
        if (nb === 0) {
            //set grey background
            browser.browserAction.setBadgeBackgroundColor({color:"#aaaaaa"});
        } else {
            //set red background
            browser.browserAction.setBadgeBackgroundColor({color:"red"});
        }
    }
    resetBadge() {
        browser.browserAction.setBadgeText({text: ""});
    }
    /**
     * Set AMR icon to blue sharingan
     */
    setBlueIcon() {
        if (this.spinning) return;
        browser.browserAction.setIcon({ path: "/icons/icon_32_blue.png" });
    }
    /**
     * Set AMR icon to grayscale sharingan
     */
    setBWIcon() {
        if (this.spinning) return;
        browser.browserAction.setIcon({ path: "/icons/icon_32_bw.png" });
    }
    /**
     * Set AMR icon to default sharingan
     */
    resetIcon() {
        if (this.spinning) return;
        browser.browserAction.setIcon({ path: "/icons/icon_32.png" });
    }
    /**
     * Set AMR icon to spinning sharingan (normal or grayscale depending on options)
     */
    spinIcon() {
        // Let's do it the chrome way, it's smoother.
        //if (!utils.isFirefox()) {
            // chrome does not support animated svg as icon
            this.waitSpinning();
            this.spinning = true;
        /*} else {
            if (store.state.options.nocount == 1 && !store.getters.hasNewMangas) {
                browser.browserAction.setIcon({ path: "/icons/icon_32_bw.svg" });
            } else {
                browser.browserAction.setIcon({ path: "/icons/icon_32.svg" });
            }
        }*/
    }
    /**
     * Stop the spinning
     */
    stopSpinning() {
        this.requireStop = true;
    }
    /**
     * Draw spinning sharingan on chrome
     * @param {*} doEase 
     */
    drawIconAtRotation(doEase) {
        if (doEase == undefined) {
            doEase = false;
        }
        this.canvasContext.save();
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasContext.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.canvasContext.rotate(2 * Math.PI * (doEase ? this.ease(this.rotation) : this.rotation));
        if (store.state.options.nocount == 1 && !store.getters.hasNewMangas) {
            this.canvasContext.drawImage(this.icon_bw, -this.canvas.width / 2, -this.canvas.height / 2);
        } else {
            this.canvasContext.drawImage(this.icon, -this.canvas.width / 2, -this.canvas.height / 2);
        }
        this.canvasContext.restore();
        browser.browserAction.setIcon({
            imageData: this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height)
        });
    }
    /**
     * Animation loop
     */
    waitSpinning() {
        this.rotation += 1 / this.animationFrames;
        if (this.rotation > 1) {
            // stop the rotation once the turn is over
            if (this.requireStop) {
                this.requireStop = false;
                this.spinning = false;
                // update the badge and icon one last time
                amrUpdater.refreshBadgeAndIcon();
                return;
            }
            this.rotation = this.rotation - 1;
            this.doEase = false;
        }
        this.drawIconAtRotation(false);
        setTimeout(this.waitSpinning.bind(this), this.animationSpeed);
    }
    /**
     * Ease for rotation
     * @param {*} x 
     */
    ease(x) {
        return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
    }
}
export default (new IconHelper)