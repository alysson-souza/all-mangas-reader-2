import browser from "webextension-polyfill";

class HandleMisc {
    handle(message, sender) {
        switch (message.action) {
            // get options array
            case "opentab":
                browser.tabs.create({
                    "url": request.url
                });
                return Promise.resolve();
        }
    }
}
export default (new HandleMisc)