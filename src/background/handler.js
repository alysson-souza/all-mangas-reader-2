import browser from "webextension-polyfill";
import HandleManga from './handle-manga';
import HandleNavigation from './handle-navigation';
import HandleBookmarks from './handle-bookmarks';
import HandleOptions from "./handle-options";
import HandleMisc from "./handle-misc";
import HandleVueInit from "./handle-vue-init";
import HandleLab from "./handle-lab";

class Handler {
    handle() {
        /**
         * Message from popup and content script handler
         */
        browser.runtime.onMessage.addListener((message, sender) => {
            let result;
            let handlers = [
                HandleVueInit, 
                HandleMisc, 
                HandleManga, 
                HandleOptions, 
                HandleNavigation, 
                HandleBookmarks, 
                HandleLab
            ];
            for (let handler of handlers) {
                result = handler.handle(message, sender);
                if (result !== undefined) break;
            }
            if (result === undefined) console.error("No handler for message action " + message.action);
            return result;
        });
    }
}
export default (new Handler)