import browser from "webextension-polyfill";
import store from '../store';

class HandleMisc {
    handle(message, sender) {
        switch (message.action) {
            // get options array
            case "opentab":
                browser.tabs.create({
                    "url": message.url
                });
                return Promise.resolve();
            case "mirrorInfos":
                let mirror = store.state.mirrors.all.find(mir => mir.mirrorName === message.name)
                return Promise.resolve(mirror);
        }
    }
}
export default (new HandleMisc)