import browser from "webextension-polyfill";
import options from "./options";

class Util {
    //Used to request background page action
    async sendExtRequest(request, button, callback, backsrc) {
        //Prevent a second request
        if (button.data("currentlyClicked")) return;
        button.data("currentlyClicked", true);

        //Display a loading image
        let _ancSrc;
        if (button.is("img")) {
            _ancSrc = button.attr("src");
            button.attr("src", browser.extension.getURL("icons/load16.gif"));
        } else {
            if (button.is(".button")) {
                _ancSrc = $("<img src='" + browser.extension.getURL("icons/ltload.gif") + "'></img>");
                _ancSrc.appendTo(button);
            }
            if (button.is(".category") || button.is(".mgcategory")) {
                _ancSrc = $("<img src='" + browser.extension.getURL("icons/load10.gif") + "'></img>");
                _ancSrc.appendTo(button);
            }
        }
        //Call the action
        await browser.runtime.sendMessage(request);
        //setTimeout(function() {
        //Do the callback
        callback();
        //Removes the loading image
        if (button.is("img")) {
            if (backsrc) {
                button.attr("src", _ancSrc);
            }
        } else {
            if (button.is(".button") || button.is(".category") || button.is(".mgcategory")) {
                _ancSrc.remove();
            }
        }
        //Restore request
        button.removeData("currentlyClicked");
        //}, 1000);
    }
    removeProtocol(url) {
        if (url.indexOf("https") == 0) return url.substring(6);
        else if (url.indexOf("http") == 0) return url.substring(5);
        return url;
    }
    debug(message) {
        if (options.debug === 1) console.log(message);
    }
    /** test different related url to retrieve scan from url */
    getScan(src) {
        let urls = [
            src, 
            decodeURI(src), 
            this.removeProtocol(src), 
            decodeURI(this.removeProtocol(src))
        ];
        let imgScan;
        let i = 0;
        while (!imgScan || imgScan.length === 0 || i < urls.length) {
            imgScan = $(".spanForImg img[src='" + urls[i++] + "']");
        }
        if (imgScan.length === 0) {
            console.error("Scan to bookmark not found !");
            return;
        }
        return imgScan;
    }
}
export default (new Util)