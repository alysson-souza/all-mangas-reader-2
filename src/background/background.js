import Handler from './handler';
import IconHelper from '../amr/icon-helper';
import store from '../store';
import * as utils from '../amr/utils';
import amrUpdater from '../amr/amr-updater';
import amrInit from '../amr/amr-init';
import browser from "webextension-polyfill";
import HandleManga from './handle-manga';
import mirrorsHelper from '../amr/mirrors-helper';
var CryptoJS = require("crypto-js")
import { getSyncManager } from '../amr/sync/sync-manager'

// Blue icon while loading
IconHelper.setBlueIcon();

// Initialize store
(async () => {
    /**
     * Make the store a global variable so we can avoid circular depandancies
     */
    window['AMR_STORE'] = store

    /**
     * Initialize AMR options from locaStorage
     */
    utils.debug("Initialize options");
    await store.dispatch('initOptions');

    /**
     * Initialize extension versioning --> after options because versionning update can affect options
     */
    let afterLoadingCall = await amrInit()

    /**
     * Initialize mirrors list in store from DB or repo
     */
    utils.debug("Initialize mirrors");
    await store.dispatch('initMirrors');

    /**
     * Initialize manga list in store from DB
     */
    utils.debug("Initialize mangas");
    await store.dispatch('initMangasFromDB');

    /**
     * Start sync process between local and remote storage
     */

    // Filtering all *sync* options
    const SyncOptions = Object.keys(store.state.options)
        .filter(x=>x.toLowerCase().indexOf('sync') > -1)
        .reduce((obj, key) => {
            obj[key] = store.state.options[key]
            return obj
        }, {})
    const syncManager = getSyncManager(SyncOptions, window['AMR_STORE']);
    // Need to complete sync before we refresh chapters to clean up deleted entries
    await syncManager.start()

    store.subscribe((mutation) => {
        if (mutation.type === 'deleteManga') {
            syncManager.deleteManga(mutation.payload)
        }
    })
    /**
     * Initialize bookmarks list in store from DB
     */
    utils.debug("Initialize bookmarks");
    await store.dispatch('initBookmarksFromDB');

    /**
     * Call function if there is anything to do after mirrors and mangas loading
     */
    if (typeof afterLoadingCall === 'function') await afterLoadingCall()

    // set icon and badge
    amrUpdater.refreshBadgeAndIcon();
    /**
     * If option update chapters lists on startup --> do it
     */
    if (store.state.options.checkmgstart === 1) {
        store.dispatch("updateChaptersLists", {force: false}); // force to false to avoid updating if not necessary
    }

    // Starts message handling
    utils.debug("Initialize message handler");
    Handler.handle();

    // Check if we need to refresh chapters lists, mirrors lists and launch automatic checker
    amrUpdater.load();
    // Check the latest published version of AMR
    amrUpdater.checkLatestPublishedVersion();

    // content script included, test if a mirror match the page and load AMR in tab
    /*browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
        if (changeInfo.status === "loading") { // just load scripts once, when the tab is loading
            HandleManga.matchUrlAndLoadScripts(tabInfo.url, tabId)
        }
    });*/
    
    let timers = [] // This is used to keep websites from spamming with calls. It fucks up the reader

    browser.webNavigation.onCommitted.addListener((args) => {
        if ("auto_subframe" === args.transitionType) return; // do not reload amr on embedded iframes

        timers.push(args.tabId)

        setTimeout(() => {
            timers = timers.filter(id => id != args.tabId)
        }, 500)

        HandleManga.matchUrlAndLoadScripts(args.url, args.tabId)
    })

    
    // pushstate events are listened from content script (if from background, we reload the page on amr navigation)
    browser.webNavigation.onHistoryStateUpdated.addListener((args) => {
        if ("auto_subframe" === args.transitionType) return; // do not reload amr on embedded iframes
        
        if (timers.includes(args.tabId)) return // History spam

        timers.push(args.tabId)

        setTimeout(() => {
            timers = timers.filter(id => id != args.tabId)
        }, 500)

        HandleManga.sendPushState(args.url, args.tabId)

    })

    /**
     * The function below increments the reading of each manga in the list from a chapter each 2 seconds
     * You can observe that when you open the popup, these modifications are propagated in real time to the popup
     * These modifications are going down to the database and propagated to all store instances (open pages of the extension)
     */
    /*
    function setNextChapterAuto() {
        for (let mg of store.state.mangas.all) {
            let cur = mg.listChaps.findIndex(arr => arr[1] === mg.lastChapterReadURL);
            if (cur == 1) {
                store.dispatch('resetManga', {url: mg.url})
            } else {
                store.dispatch('readManga', {
                    "url": mg.url,
                    "mirror": mg.mirror,
                    "lastChapterReadName": mg.listChaps[cur - 1][0],
                    "lastChapterReadURL": mg.listChaps[cur - 1][1],
                    "name": mg.name
                })
            }
        }
        setTimeout(setNextChapterAuto, 2000);
    }
    setTimeout(setNextChapterAuto, 2000);*/
})()
