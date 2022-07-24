import browser from "webextension-polyfill"
import { isFirefox, THINSCAN } from "./Options"

const jsonOptions = ["categoriesStates", "readlanguages"]
const stringOptions = [
    "colornew",
    "colorread",
    "colornotfollow",
    "gistSyncSecret",
    "gistSyncGitID",
    "komgaUrl",
    "komgaUser",
    "komgaPassword",
    "mangadexToken",
    "mangadexRefresh",
    "pageNavigationPosition",
    "sortOrder",
    "tachideskUrl"
]

type NumberOption = 0 | 1
export const defaultOptions = {
    debug: 1, // display debug traces in content script, background, popup, ...
    /**
     * New reader layout options (specific layout value for a manga is scaleUp * 10000 + displayBook * 1000 + readingDirection + 100 + displayFullChapter * 10 + resizeMode (ex : 01110))
     */
    scaleUp: 0 /* If we should scale up smaller images than the viewport */,
    displayBook: 1 /* Display pages side by side */,
    readingDirection: 1 /* ltr (0) for left to right or rtl (1) */,
    invertKeys: 0 /* If we should sync the previous/next page logic with the reading direction */,
    displayFullChapter: 1 /* Display full chapter long strip or current scan (doucle scan) */,
    resizeMode: 0 /* How to resize scans width (0), height (1) (only if displayFullChapter = 0), container (2) or none (3) */,

    addauto: 1, // automatically mark chapters as read while reading
    markwhendownload: 0, // mark mangas as read when all images downloaded
    prefetch: 1, // load next chapter in background while reading
    load: 1, //See loading progression in the title bar
    imgorder: 0, //Load scans in order
    smoothNavigation: 1, // Should next/previous chapter load dynamically or force a page loag

    darkreader: 1, // Reader is in dark mode, if not --> light mode

    thinscan: THINSCAN.default,
    webtoonDefault: 0, // Should webtoon mode be the default or not

    resize: 1, // resize scans to fit in viewport  // DEPRECATED WITH NEW READER (A search for this term gives lots of results so removing it later)

    /**
     * Options used by background script
     */

    /** Customization options */
    newTab: 0 as NumberOption, //Open popup in new tab
    displastup: 0 as NumberOption, // Display a badge with last time updated in popup
    disppercentage: 1 as NumberOption, // Display a circular icon with progression
    dark: 0 as NumberOption, // Use a dark backgroud for AMR pages,
    colornew: "green", // color of mangas with new chapters
    colorread: "blue", // color of mangas with all chapters read
    colornotfollow: "blue-grey", // color of mangas which are not followed
    groupmgs: 1 as NumberOption, // group manga with similar name (one piece and One Piece)

    /** Updates options */
    updatechap: 21600000 as number, // update chapters frequency (6 hours default)
    updatemg: 86400000 as number, // update mirrors frequency
    stopupdateforaweek: 0 as number, // stop updates for a week after last chapter was found
    checkmgstart: 0 as number, // update chapters lists on startup
    refreshspin: 1 as number, // spin the icon while loading chapters
    savebandwidth: 1 as number, // save bandwidth while loading chapters
    waitbetweenupdates: 2 as number, // wait for n seconds betwwen two manga chapters update request
    displayzero: 0 as number, // display a grey zero when no new chapter
    nocount: 1 as number, // 1 : display gray sharingan and normal if new chaps; 0 : badge

    /** Notification options */
    shownotifications: 1, //display notifications on new chapter
    notificationtimer: 0, //time to clear notification auto
    notifynewversion: isFirefox() ? 0 : 1, //do we notify in the popup if the app is not the latest published version
    allowtracking: 0, // send informations to tracking tool
    allowtrackingdone: 1, // user has chosen to let amr track his reading / or not
    allowcookies: 0, // read/create cookies
    allowcookiesdone: 0, // user has chosen to let amr read/create cookies / or not

    /** Sync options */
    syncEnabled: 0,
    gistSyncEnabled: 0,
    gistSyncSecret: "",
    gistSyncGitID: "",

    /** Debug options */
    gistDebugEnabled: 0,
    /**
     * Sync/Update/Convert safener
     */
    isUpdatingChapterLists: 0,
    isSyncing: 0,
    isConverting: 0,
    /** Search Options */
    searchOpenSeries: 0,

    /** Language options */
    readlanguages: ["en", "gb"] as string[], // default language is english. On install, the user language is added to this list
    deactivateunreadable: false, // deactivate automatically mirrors in languages that do not match readable languages

    /**
     * Categories states, each custom category is stored in localStorage in this array
     * states are
     *  - include (include mangas from this cat),
     *  - exclude (exclude manga from this cat),
     *  - <empty> (does not care of this cat)
     */
    categoriesStates: [
        { name: "category_new", state: "include", type: "native" },
        { name: "category_read", state: "include", type: "native" },
        { name: "category_unread", state: "include", type: "native" },
        { name: "category_oneshots", state: "include", type: "native" },
        { name: "category_disabled_mirrors", state: "include", type: "native" }
    ],

    /** Internal timestamps and state booleans */
    updated: 0, // last time something has been changed in the list
    changesSinceSync: 0, // 1 : something has been changed since last sync
    lastChaptersUpdate: 0, // last time chapters lists have been updated
    lastMirrorsUpdate: 0, // last time mirrors have been updated

    /** Manga List options */
    perPageMangas: 25, // Manga entries per page
    pageNavigationPosition: "top", // Should the page navigation/settings bar be up top or on bottom
    alternateColors: 0, // This applies a alternating color scheme to the manga list
    sortOrder: "updates", // Order to sort manga list
    alpha_asc_desc: false, // Order by name asending/descending

    /** Mangadex specific options */

    /** Mangadex Options */
    mangadexDataSaver: 0, // Use the datasaver option when getting chapter images

    /** Mangadex Integration Options */
    mangadexIntegrationEnable: 0, // enable integration
    mangadexValidCredentials: 0, // watcher for credentials validity
    mangadexDontRemindMe: 0, // Stop reminding the user that they need to login again
    mangadexToken: "", // current token
    mangadexTokenExpire: Date.now(), // current token expiration date
    mangadexRefresh: "", // refresh token
    mangadexRefreshExpire: Date.now(), // refresh token expiration date
    mangadexUpdateReadStatus: 0, // mark as read on mangadex
    mangadexExportToList: 0, // auto export added manga to MDlist
    mangadexExportToFollows: 0, // auto export added manga to Follows (removed onces are moved to "dropped")
    //

    /** Komga specific options */
    komgaUrl: "http://localhost:8080",
    komgaUser: "",
    komgaPassword: "",

    tachideskUrl: "http://localhost:4567 "
} as const

export type AppConfig = typeof defaultOptions

export class OptionStorage {
    constructor() {}

    private getLookupRecord() {
        return Object.entries(defaultOptions).reduce((a, [key, value]) => {
            return {
                ...a,
                [key]: value
            }
        }, {} as AppConfig)
    }

    public async getVueOptions() {
        const options = await browser.storage.local.get(this.getLookupRecord())

        const vueOptions: Partial<AppConfig> = {}
        Object.entries(options).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
                return // Skip
            }

            if (jsonOptions.includes(key) && typeof value === "string") {
                let storedVal = JSON.parse(value)
                if (key === "categoriesStates") {
                    storedVal = storedVal.filter(cat => cat.name !== undefined)
                }

                vueOptions[key] = storedVal
            } else if (!stringOptions.includes(key) && typeof value === "string") {
                // all non Json and non String values are considered Integers --> this is right for now
                vueOptions[key] = parseInt(value)
            } else {
                vueOptions[key] = value
            }
        })

        return vueOptions
    }

    getKey(key: string): Promise<string | undefined> {
        return browser.storage.local.get(key).then(data => data[key])
    }

    getKeys(keys?: null | string | string[] | Record<string, any>) {
        return browser.storage.local.get(keys)
    }

    setKey(key: string, value: string | number) {
        return browser.storage.local.set({ [key]: value })
    }
}
