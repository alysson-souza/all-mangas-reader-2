import browser from "webextension-polyfill"
import { AppStore } from "../types/common"
import { AppLogger } from "../shared/AppLogger"
import { serializeVuexObject } from "../shared/utils"
import { HandleManga } from "./handle-manga"
import { HandleImportExport } from "./handle-import-export"
import { HandleNavigation } from "./handle-navigation"
import { OptionStorage } from "../shared/OptionStorage"
import { HandleBookmarks } from "./handle-bookmarks"
import { HandleLab } from "./handle-lab"
import { MirrorLoader } from "../mirrors/MirrorLoader"
import { NOT_HANDLED_MESSAGE } from "./background-util"
import { IconHelper } from "../amr/icon-helper"

/**
 * Background message listener used to communicate with service worker and pages
 */
export class Handler {
    private readonly handlers: { name?: string; handle: (message, sender) => Promise<unknown> }[]
    private readonly handleManga: HandleManga

    constructor(
        private readonly store: AppStore,
        private readonly logger: AppLogger,
        private readonly optionStorage: OptionStorage,
        private readonly mirrorLoader: MirrorLoader,
        private readonly iconHelper: IconHelper
    ) {
        this.handleManga = new HandleManga(store, logger, mirrorLoader, optionStorage)
        this.handlers = [
            {
                name: "inlineHandleHandle",
                handle: this.inlineHandleHandle
            },
            this.handleManga,
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
                return this.store.dispatch("updateSync", message.payload)
            case "logger":
                this.logger.debug(message)
                return true
            case "refreshBadge":
                return this.iconHelper.refreshBadgeAndIcon()
            case "opentab":
                return browser.tabs.create({ url: message.url })
            case "mirrorInfos":
                const mirror = this.store.state.mirrors.all.find(mir => mir.mirrorName === message.name)
                return Promise.resolve({
                    // can't send a vuex object through js instances on Firefox --> convert
                    activated: mirror.activated,
                    domains: mirror.domains,
                    home: mirror.home,
                    languages: mirror.languages,
                    mirrorIcon: mirror.mirrorIcon,
                    mirrorName: mirror.mirrorName
                })
            case "reloadStats":
                return { result: false }
            default:
                return NOT_HANDLED_MESSAGE
        }
    }

    /**
     * Message from popup and content script handler
     */
    handle = async (message, sender) => {
        this.logger.debug(message)
        for (const handler of this.handlers) {
            try {
                const result = await handler.handle(message, sender)
                if (result !== NOT_HANDLED_MESSAGE) {
                    return result
                }
            } catch (e) {
                this.logger.error(e)
                return undefined
            }
        }

        this.logger.error("No handler for message action " + message.action)
    }
}
