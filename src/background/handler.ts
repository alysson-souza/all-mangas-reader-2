import browser from "webextension-polyfill"
import { HandleVueInit } from "./handle-vue-init"
import { AppStore } from "../types/common"
import { HandleManga } from "./handle-manga"
import { HandleMisc } from "./handle-misc"
import { HandleImportExport } from "./handle-import-export"
import { AppLogger } from "../shared/AppLogger"
import { serializeVuexObject } from "../shared/utils"
import { HandleNavigation } from "./handle-navigation"
import { OptionStorage } from "../shared/OptionStorage"
// import HandleManga from "./handle-manga"
// import HandleNavigation from "./handle-navigation"
// import HandleBookmarks from "./handle-bookmarks"
// import HandleMisc from "./handle-misc"
// import HandleVueInit from "./handle-vue-init"
// import HandleLab from "./handle-lab"
// import HandleSync from "./handle-sync"

/**
 * Background message listener used to communicate with service worker and pages
 */
export class Handler {
    private readonly handlers: { handle: (message, sender) => Promise<unknown> }[]

    constructor(
        private readonly store: AppStore,
        private readonly logger: AppLogger,
        private readonly optionStorage: OptionStorage
    ) {
        this.handlers = [
            new HandleVueInit(store),
            {
                handle: this.inlineHandleHandle
            },
            new HandleManga(store, logger),
            new HandleMisc(store),
            new HandleNavigation(store, optionStorage),
            // HandleBookmarks,
            // HandleLab,
            // HandleSync,
            new HandleImportExport(store)
        ]
    }

    async inlineHandleHandle(message, sender) {
        switch (message.action) {
            case "getoptions":
                // doing that because content script is not vue aware,
                // the reactive vuex object needs to be converted to POJSO
                return serializeVuexObject(this.store.state.options)
        }
    }

    handle() {
        /**
         * Message from popup and content script handler
         */
        browser.runtime.onMessage.addListener(async (message, sender) => {
            console.info(message)
            for (let handler of this.handlers) {
                const result = await handler.handle(message, sender)
                if (result !== undefined) {
                    return result
                }
            }

            console.error("No handler for message action " + message.action)
        })
    }
}
