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
                return Promise.resolve({ // can't send a vuex object through js instances on Firefox --> convert
                    activated: mirror.activated,
                    domains: mirror.domains,
                    home: mirror.home,
                    languages: mirror.languages,
                    mirrorIcon: mirror.mirrorIcon,
                    mirrorName: mirror.mirrorName
                });
        }
    }
}
export default (new HandleMisc)