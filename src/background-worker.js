import browser from "webextension-polyfill"
import store from "./store"
import { Handler } from "./background/handler"
import { getLogger } from "./shared/Logger"
import { OptionStorage } from "./shared/OptionStorage"
// import * as utils from "./amr/utils"
// import amrInit from "./amr/amr-init"
// import HandleManga from "./background/handle-manga"
// import converToMangadexV5 from "./background/misc/mangedex-v5-converter"
// import { Mangadex } from "./background/misc/mangadex-v5-integration"

browser.runtime.onMessage.addListener(({ type, name }, target) => {
    if (type === "set-name") {
        browser.storage.local.set({ name })
    }
    console.log({ type, name, target })
})

browser.runtime.onSuspend.addListener(function () {
    console.log("Unloading.")
    browser.action.setBadgeText({ text: "U" })
})

chrome.alarms.onAlarm.addListener(function (...args) {
    console.log(args)
})

// Initialize store
const init = async () => {
    const optionsStorage = new OptionStorage()

    /**
     * Initialize AMR options from locaStorage
     */
    const options = await optionsStorage.getVueOptions()

    const logger = getLogger(options)
    if (typeof globalThis.window === undefined) {
        globalThis.window = {}
    }

    const handler = new Handler(store)

    /**
     * Initialize extension versioning --> after options because versionning update can affect options
     */
    // let afterLoadingCall = await amrInit()

    /**
     * Initialize mirrors list in store from DB or repo
     */
    logger.debug("Initialize mirrors")
    // await store.dispatch("initMirrors")

    /**
     * Initialize manga list in store from DB
     */
    logger.debug("Initialize mangas")
    await store.dispatch("initMangasFromDB")

    /**
     * Reset watchers for components that can collide.
     */
    await store.dispatch("setOption", { key: "isSyncing", value: 0 })
    await store.dispatch("setOption", { key: "isUpdatingChapterLists", value: 0 })
    await store.dispatch("setOption", { key: "isConverting", value: 0 })
    /**
     * Start sync process between local and remote storage
     */
    await store.dispatch("setMangaTsOpts")
    await store.dispatch("initSync")
    /**
     * Initialize bookmarks list in store from DB
     */
    // utils.debug("Initialize bookmarks")
    await store.dispatch("initBookmarksFromDB")

    /**
     * Call function if there is anything to do after mirrors and mangas loading
     */
    if (typeof afterLoadingCall === "function") {
        await afterLoadingCall()
    }

    // set icon and badge
    // iconHelper.refreshBadgeAndIcon()
    /**
     * If option update chapters lists on startup --> do it
     */
    // if (store.state.options.checkmgstart === 1) {
    //     store.dispatch("updateChaptersLists", {force: false}) // force to false to avoid updating if not necessary
    // }

    // Starts message handling
    // utils.debug("Initialize message handler")
    handler.handle()

    // Check if we need to refresh chapters lists, mirrors lists and launch automatic checker
    // amrUpdater.load()
    // Check the latest published version of AMR
    // amrUpdater.checkLatestPublishedVersion()

    // utils.debug("Running mangadex converter")
    // converToMangadexV5()
    // if (store.state.options.mangadexIntegrationEnable) new Mangadex(store.getters.md_allOptions)
    // content script included, test if a mirror match the page and load AMR in tab
    /*browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
      if (changeInfo.status === "loading") { // just load scripts once, when the tab is loading
          HandleManga.matchUrlAndLoadScripts(tabInfo.url, tabId)
      }
  });*/

    let timers = [] // This is used to keep websites from spamming with calls. It fucks up the reader

    browser.webNavigation.onCommitted.addListener(args => {
        if ("auto_subframe" === args.transitionType) return // do not reload amr on embedded iframes

        timers.push(args.tabId)

        setTimeout(() => {
            timers = timers.filter(id => id != args.tabId)
        }, 500)

        // HandleManga.matchUrlAndLoadScripts(args.url, args.tabId)
    })

    // pushstate events are listened from content script (if from background, we reload the page on amr navigation)
    browser.webNavigation.onHistoryStateUpdated.addListener(args => {
        if ("auto_subframe" === args.transitionType) return // do not reload amr on embedded iframes

        if (timers.includes(args.tabId)) return // History spam

        timers.push(args.tabId)

        setTimeout(() => {
            timers = timers.filter(id => id != args.tabId)
        }, 500)

        // HandleManga.sendPushState(args.url, args.tabId)
    })
}
init()
