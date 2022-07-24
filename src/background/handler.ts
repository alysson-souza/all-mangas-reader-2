import browser from "webextension-polyfill"
import { HandleVueInit } from "./handle-vue-init"
import { AppStore } from "../types/common"
import { serializeVuexObject } from "../amr/utils"
import { HandleManga } from "./handle-manga"
import { HandleMisc } from "./handle-misc"
// import HandleManga from "./handle-manga"
// import HandleNavigation from "./handle-navigation"
// import HandleBookmarks from "./handle-bookmarks"
// import HandleMisc from "./handle-misc"
// import HandleVueInit from "./handle-vue-init"
// import HandleLab from "./handle-lab"
// import HandleSync from "./handle-sync"
// import HandleImportExport from "./handle-importexport"

/**
 * Background message listener used to communicate with service worker and pages
 */
export class Handler {
    private readonly store: AppStore
    private readonly handlers: { handle: (message, sender) => Promise<unknown> }[]

    constructor(store: AppStore) {
        this.store = store

        this.handlers = [
            new HandleVueInit(store),
            {
                handle: this.inlineHandleHandle
            },
            new HandleManga(store),
            new HandleMisc(store)
            // HandleNavigation,
            // HandleBookmarks,
            // HandleLab,
            // HandleSync,
            // HandleImportExport
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
        browser.runtime.onMessage.addListener((message, sender) => {
            for (let handler of this.handlers) {
                const result = handler.handle(message, sender)
                if (result !== undefined) {
                    return result
                }
            }

            console.error("No handler for message action " + message.action)
        })
    }
}
