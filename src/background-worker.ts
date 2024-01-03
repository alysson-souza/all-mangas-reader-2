import browser from "webextension-polyfill"
import store from "./store"
import { Handler } from "./background/handler"
import { getAppLogger } from "./shared/AppLogger"
import { OptionStorage } from "./shared/OptionStorage"
import { AmrInit } from "./background/amr-init"
import storedb from "./amr/storedb"
import { convertToMangaDexV5 } from "./background/misc/mangedex-v5-converter"
import { Mangadex } from "./background/misc/mangadex-v5-integration"
import { getMirrorHelper } from "./mirrors/MirrorHelper"
import { getMirrorLoader } from "./mirrors/MirrorLoader"
import { AmrUpdater } from "./pages/amr-updater"
import { getIconHelper } from "./amr/icon-helper"
import { host_permissions } from "./constants/required_permissions"
import { getNotifications } from "./amr/notifications"

const optionsStorage = new OptionStorage()
const iconHelper = getIconHelper(store)
const logger = getAppLogger({ debug: 0 })
const amrInit = new AmrInit(store, storedb, optionsStorage, logger)
const amrUpdater = new AmrUpdater(store, optionsStorage)
const mirrorHelper = getMirrorHelper(store.state.options)
const mirrorLoader = getMirrorLoader(mirrorHelper)
const handler = new Handler(store, logger, optionsStorage, mirrorLoader, iconHelper)
const handleManga = handler.getHandleManga()
const notifications = getNotifications(store)

const init = async () => {
    const options = await optionsStorage.getVueOptions()

    await store.dispatch("initOptions", options)

    logger.setConfig(options)
    mirrorHelper.setOptions(options)

    /**
     * Initialize extension versioning --> after options because versioning update can affect options
     */
    const afterLoadingCall = await amrInit.init()

    /**
     * Initialize mirrors list in store from DB or repo
     */
    logger.debug("Initialize mirrors")
    await store.dispatch("initMirrors")

    /**
     * Initialize manga list in store from DB
     */
    logger.debug("Initialize mangas")
    await store.dispatch("initMangasFromDB")

    /**
     * Check to see if extension has required origin permissions
     */
    logger.debug("Checking for permissions")
    const hasPermission = await browser.permissions.contains(host_permissions)
    if (!hasPermission) {
        logger.debug("Missing required permissions. Opening request page")
        browser.tabs.create({ active: true, url: "/pages/permissions/permissions.html" })
    }

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
    logger.debug("Initialize bookmarks")
    await store.dispatch("initBookmarksFromDB")

    /**
     * Call function if there is anything to do after mirrors and mangas loading
     */
    if (typeof afterLoadingCall === "function") {
        await afterLoadingCall()
    }

    // set icon and badge
    iconHelper.refreshBadgeAndIcon()

    /**
     * If option update chapters lists on startup --> do it
     */
    if (store.state.options.checkmgstart === 1) {
        store.dispatch("updateChaptersLists", { force: false }) // force to false to avoid updating if not necessary
    }

    // Check the latest published version of AMR
    await amrUpdater.checkLatestPublishedVersion()

    logger.debug("Running mangadex converter")
    convertToMangaDexV5(store, logger).catch(e => logger.error(e))
    if (store.state.options.mangadexIntegrationEnable) {
        new Mangadex(store.getters.md_allOptions, store.dispatch)
    }

    return true
}

const initPromise = init()
initPromise.then(() => console.debug("completed background init"))

/**
 * Initialise all listeners at the top level, so they can be persisted in firefox
 */

// Alarms - Initialize refresh checkers
browser.alarms.onAlarm.addListener(alarm => {
    switch (alarm.name) {
        case "checkChaptersUpdates":
            return amrUpdater.checkChaptersUpdates()
        case "checkMirrorsUpdates":
            return amrUpdater.checkMirrorsUpdates()
        default:
            console.error(`Received unknown alarm "${alarm.name}"`)
    }
})

browser.alarms.create("checkChaptersUpdates", { delayInMinutes: 0.1, periodInMinutes: 1 })
browser.alarms.create("checkMirrorsUpdates", { delayInMinutes: 0.1, periodInMinutes: 1 })

let timers = [] // This is used to keep websites from spamming with calls. It fucks up the reader

browser.webNavigation.onCommitted.addListener(args => {
    if ("auto_subframe" === args["transitionType"]) {
        return // do not reload amr on embedded iframes
    }

    timers.push(args.tabId)

    setTimeout(() => {
        timers = timers.filter(id => id != args.tabId)
    }, 500)

    // This where all frontend AMR Reader actually begins
    handleManga.matchUrlAndLoadScripts(args.url, args.tabId)
})

// push state events are listened from content script (if from background, we reload the page on amr navigation)
browser.webNavigation.onHistoryStateUpdated.addListener(args => {
    if ("auto_subframe" === args["transitionType"]) {
        return
    } // do not reload amr on embedded iframes

    if (timers.includes(args.tabId)) {
        return // History spam
    }

    if (!args.url.includes("mangadex.org")) {
        timers.push(args.tabId)
    }

    setTimeout(() => {
        timers = timers.filter(id => id != args.tabId)
    }, 500)

    handleManga.sendPushState(args.url, args.tabId).catch(err => {
        logger.error(err)
    })
})

if (browser.notifications) {
    // Add the callback to ALL notifications opened by AMR.
    browser.notifications.onClicked.addListener(notifications.notificationClickCallback)
    // To prevent the notification array from growing
    browser.notifications.onClosed.addListener(notifications.notificationCloseCallback)
}

logger.info("Initialize message handler")
browser.runtime.onMessage.addListener(async (msg, sender) => {
    // Make sure init is complete
    await initPromise
    return handler.handle(msg, sender)
})
