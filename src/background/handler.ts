import browser from "webextension-polyfill"
import { AppStore, MirrorImplementation } from "../types/common"
import { AppLogger } from "../shared/AppLogger"
import { serializeVuexObject } from "../shared/utils"
import { HandleManga } from "./handle-manga"
import { HandleMisc } from "./handle-misc"
import { HandleImportExport } from "./handle-import-export"
import { HandleNavigation } from "./handle-navigation"
import { OptionStorage } from "../shared/OptionStorage"
import { HandleBookmarks } from "./handle-bookmarks"
import { HandleLab } from "./handle-lab"
import { MirrorLoader } from "../mirrors/MirrorLoader"

/**
 * Background message listener used to communicate with service worker and pages
 */
export class Handler {
    private readonly handlers: { handle: (message, sender) => Promise<unknown> }[]
    private readonly handleManga: HandleManga

    constructor(
        private readonly store: AppStore,
        private readonly logger: AppLogger,
        private readonly optionStorage: OptionStorage,
        private readonly mirrorLoader: MirrorLoader
    ) {
        this.handleManga = new HandleManga(store, logger, mirrorLoader, optionStorage)
        this.handlers = [
            {
                handle: this.inlineHandleHandle
            },
            this.handleManga,
            new HandleMisc(store, mirrorLoader),
            new HandleNavigation(store, optionStorage),
            new HandleBookmarks(store, mirrorLoader),
            new HandleLab(mirrorLoader),
            new HandleImportExport(store)
        ]
    }

    public getHandleManga() {
        return this.handleManga
    }

    inlineHandleHandle = async (message, sender) => {
        switch (message.action) {
            case "getoptions":
                // doing that because content script is not vue aware,
                // the reactive vuex object needs to be converted to POJSO
                return serializeVuexObject(this.store.state.options)
            case "vuex_initstate":
                let mod_state_obj = this.store.state[message.module]
                if (message.key) {
                    mod_state_obj = mod_state_obj[message.key]
                }
                return serializeVuexObject(mod_state_obj)
            case "sync_update":
                return this.store.dispatch("updateSync", true)
            case "logger":
                this.logger.debug(message)
                return true
        }
    }

    handle() {
        /**
         * Message from popup and content script handler
         */
        browser.runtime.onMessage.addListener(async (message, sender) => {
            this.logger.info(message)
            for (let handler of this.handlers) {
                const result = await handler.handle(message, sender)
                if (result !== undefined) {
                    return result
                }
            }

            this.logger.error("No handler for message action " + message.action)
        })
    }
}
