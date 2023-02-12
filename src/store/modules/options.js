import { THINSCAN } from "../../amr/options"

const isFirefox = function () {
    // Firefox 1.0+ (tested on Firefox 45 - 53)
    return typeof InstallTrigger !== "undefined"
}

/**
 * Default options of AMR.
 * Each option MUST figure in this object
 */
const default_options = {
    debug: 0, // display debug traces in content script, background, popup, ...
    /**
     * New reader layout options (specific layout value for a manga is scaleUp * 10000 + displayBook * 1000 + readingDirection + 100 + displayFullChapter * 10 + resizeMode (ex : 01110))
     */
    scaleUp: 0 /* If we should scale up smaller images than the viewport */,
    displayBook: 1 /* Display pages side by side */,
    readingDirection: 1 /* ltr (0) for left to right or rtl (1) */,
    invertKeys: 0 /* If we should sync the previous/next page logic with the reading direction */,
    displayFullChapter: 1 /* Display full chapter long strip or current scan (doucle scan) */,
    resizeMode: 0 /* How to resize scans width (0), height (1) (only if displayFullChapter = 0), container (2) or none (3) */,
    magicScrollEnabled: 1 /* Option to enable/disable magic scroll */,
    bottomNavigationEnabled: 1 /* Option to enable/disable the bottom hover navigation */,

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
    newTab: 0, //Open popup in new tab
    displastup: 0, // Display a badge with last time updated in popup
    disppercentage: 1, // Display a circular icon with progression
    dark: 0, // Use a dark backgroud for AMR pages,
    colornew: "green", // color of mangas with new chapters
    colorread: "blue", // color of mangas with all chapters read
    colornotfollow: "blue-grey", // color of mangas which are not followed
    groupmgs: 1, // group manga with similar name (one piece and One Piece)

    /** Updates options */
    updatechap: 21600000, // update chapters frequency (6 hours default)
    updatemg: 86400000, // update mirrors frequency
    stopupdateforaweek: 0, // stop updates for a week after last chapter was found
    checkmgstart: 0, // update chapters lists on startup
    refreshspin: 1, // spin the icon while loading chapters
    savebandwidth: 1, // save bandwidth while loading chapters
    waitbetweenupdates: 2, // wait for n seconds betwwen two manga chapters update request
    displayzero: 0, // display a grey zero when no new chapter
    nocount: 1, // 1 : display gray sharingan and normal if new chaps; 0 : badge

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
    readlanguages: ["en", "gb"], // default language is english. On install, the user language is added to this list
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
}

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

/**
 *  initial state of amr options
 */
const state = default_options

// getters
const getters = {
    /**
     * Return the whole options object
     */
    options: state => state
}

// actions
const actions = {
    /**
     * Override default options with options values in localStorage
     * @param {*} param0
     */
    initOptions({ commit, dispatch, state }) {
        for (let key of Object.keys(state)) {
            let storedVal = localStorage["o." + key]
            if (storedVal) {
                if (jsonOptions.includes(key)) storedVal = JSON.parse(storedVal)
                else {
                    if (!stringOptions.includes(key)) {
                        storedVal = parseInt(storedVal) // all non Json and non String values are considered Integers --> this is right for now
                    }
                }
                // do not display broken categories
                if (key === "categoriesStates") {
                    storedVal = storedVal.filter(cat => typeof cat.name !== "undefined")
                }
                commit("setOption", { key: key, value: storedVal })
            }
        }
    },
    /**
     * Set an option
     * @param {*} param0
     * @param {*} keyValObj object with key and value fields
     */
    setOption({ commit, dispatch }, keyValObj) {
        commit("setOption", keyValObj)
        localStorage["o." + keyValObj.key] = keyValObj.value
    },
    /**
     * Adds a category in categories states and save
     * @param {*} param0
     * @param {*} name
     */
    addCategory({ commit, dispatch, state }, name) {
        commit("addCategory", name)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
    },
    /**
     * Remove a non native category from categories states and save
     * @param {*} param0
     * @param {*} name
     */
    removeCategory({ commit, dispatch, state, rootState }, name) {
        commit("removeCategory", name)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
        for (let mg of rootState.mangas.all) {
            if (mg.cats.includes(name)) {
                dispatch("removeCategoryFromManga", { key: mg.key, name: name })
            }
        }
    },
    /**
     * Remove a non native category from categories states and save
     * @param {*} param0
     * @param {{oldname: string, newname: string}} nameChange Information about the category name change.
     */
    editCategory({ commit, dispatch, state, rootState }, nameChange) {
        commit("updateCategoryName", nameChange)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
        const { oldname, newname } = nameChange

        // Not very efficient way, but re-using existing methods
        for (let mg of rootState.mangas.all) {
            if (mg.cats.includes(oldname)) {
                dispatch("removeCategoryFromManga", { key: mg.key, name: oldname })
                dispatch("addCategoryToManga", { key: mg.key, name: newname })
            }
        }
    },
    /**
     * Adds a language category in categories states and save
     * @param {*} param0
     * @param {*} name
     */
    addLanguageCategory({ commit, dispatch, state }, name) {
        commit("addLanguageCategory", name)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
    },
    /**
     * Adds a native category in categories states and save
     * @param {*} param0
     * @param {*} name
     */
    addNativeCategory({ commit, dispatch, state }, name) {
        commit("addNativeCategory", name)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
    },
    /**
     * Remove a language category from categories states and save
     * @param {*} param0
     * @param {*} name
     */
    removeLanguageCategory({ commit, dispatch, state, rootState }, name) {
        commit("removeLanguageCategory", name)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
    },
    /**
     * Updates a categories state and save
     * @param {*} param0
     * @param {*} catObj
     */
    updateCategory({ commit, dispatch, state }, catObj) {
        commit("updateCategory", catObj)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
    },
    /**
     * Updates a categories name and save, use to upgrade native categories names for i18n
     * @param {*} param0
     * @param {{oldname: string, newname: string}} oldnew Information about the category name change.
     */
    updateCategoryName({ commit, dispatch, state }, oldnew) {
        commit("updateCategoryName", oldnew)
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates)
    },
    /**
     * Add a language to readable languages list
     * @param {*} param0
     * @param {*} lang
     */
    addReadLanguage({ commit, state }, lang) {
        commit("addReadLanguage", lang)
        localStorage["o.readlanguages"] = JSON.stringify(state.readlanguages)
    },
    /**
     * Remove a language from readable languages list
     * @param {*} param0
     * @param {*} lang
     */
    removeReadLanguage({ commit, state }, lang) {
        commit("removeReadLanguage", lang)
        localStorage["o.readlanguages"] = JSON.stringify(state.readlanguages)
    }
}

/**
 * All possible mutations on options
 * It is very important to write a mutation each time we need to update or create fields in options.
 * This way, mutations are propagated in the different instances of the store.
 * If not, some modifications can be not reflected and not saved to the database.
 * A mutation MUST be a synchrone function
 */
const mutations = {
    /**
     * Update options
     * @param {*} state
     * @param {*} opts object ovveriding defaults
     */
    extendOptions(state, opts) {
        Object.assign(state, opts)
    },
    /**
     * Set {key, value} option
     * @param {*} state
     * @param {*} obj containing key and value
     */
    setOption(state, { key, value }) {
        if (!key) console.error("Impossible to set option with undefined key; value is " + value)
        else state[key] = value
    },
    /**
     * Adds a category in categories states
     * @param {*} state
     * @param {*} name
     */
    addCategory(state, name) {
        let toadd = {
            name: name,
            state: "include"
        }
        state.categoriesStates.push(toadd)
    },
    /**
     * Remove a non native category from categories states
     * @param {*} state
     * @param {*} name
     */
    removeCategory(state, name) {
        let index = state.categoriesStates.findIndex(
            cat => cat.type !== "native" && cat.type !== "language" && cat.name === name
        )
        if (index >= 0) state.categoriesStates.splice(index, 1)
    },
    /**
     * Adds a native category in categories states
     * @param {*} state
     * @param {*} name
     */
    addNativeCategory(state, name) {
        let toadd = {
            name: name,
            type: "native",
            state: "include"
        }
        state.categoriesStates.push(toadd)
    },
    /**
     * Adds a language category in categories states
     * @param {*} state
     * @param {*} name
     */
    addLanguageCategory(state, name) {
        let toadd = {
            name: name,
            type: "language",
            state: "include"
        }
        state.categoriesStates.push(toadd)
    },
    /**
     * Remove a language category from categories states
     * @param {*} state
     * @param {*} name
     */
    removeLanguageCategory(state, name) {
        let index = state.categoriesStates.findIndex(cat => cat.type === "language" && cat.name === name)
        if (index >= 0) state.categoriesStates.splice(index, 1)
    },
    /**
     * Updates a categories state
     * @param {*} state
     * @param {*} param1
     */
    updateCategory(state, { name, catstate }) {
        let cat = state.categoriesStates.find(cat => cat.name === name)
        cat.state = catstate
    },
    /**
     * Updates a categories name
     * @param {*} state
     * @param {*} param1
     */
    updateCategoryName(state, { oldname, newname }) {
        let cat = state.categoriesStates.find(cat => cat.name === oldname)
        if (cat !== undefined) cat.name = newname
    },
    /**
     * Adds a readable language to the list
     * @param {*} state
     * @param {*} lang
     */
    addReadLanguage(state, lang) {
        state.readlanguages.push(lang)
    },
    /**
     * Removes a readable language from the list
     * @param {*} state
     * @param {*} lang
     */
    removeReadLanguage(state, lang) {
        let index = state.readlanguages.indexOf(lang)
        if (index >= 0) state.readlanguages.splice(index, 1)
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
