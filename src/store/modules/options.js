import storedb from '../../amr/storedb'

/**
 * Default options of AMR.
 * Each option MUST figure in this object
 */
const default_options = {
    debug: 1, // display debug traces in content script, background, popup, ...
    /**
     * Options used by background script
     */
    "impl-repositories": [ // repositories containing mirrors implementations
        "https://community.allmangasreader.com/latest_v2/",
        "https://raw.github.com/AllMangasReader-dev/mirrors/master/"
    ],
    shownotifications: 1, //display notifications on new chapter
    notificationtimer: 0, //time to clear notification auto

    /**
     * Options used in content scripts (included in mangas pages)
     */
    displayChapters: 1, // display scans as a book
    newbar: 1, // display one navigation bar on top

    /**
     * mode = 1 --> images are displayed on top of one another
     * mode = 2 --> images are displayed two by two occidental reading mode
     * mode = 3 --> images are displayed two by two japanese reading mode
     */
    displayMode: 3,
    addauto: 1, // automatically mark chapters as read while reading
    resize: 1, // resize scans to fit in viewport
    autobm: 1, // bookmark automatically the scans when dlbclicked in page
    markwhendownload: 0, // mark mangas as read when all images downloaded
    prefetch: 1, // load next chapter in background while reading 
    groupmgs: 1, // group manga with similar name (one piece and One Piece)
    lrkeys: 1, // use arrows keys to read chapter
    rightnext: 1, // arrow right goes to next chapter at bottom

    //TO IMPLEMENT
    load: 0, //See loading progression in the title bar
    imgorder: 0, //Load scans in order

    /** Customization options */
    newTab: 0, //Open popup in new tab
    displastup: 0, // Display a badge with last time updated in popup
    dark: 0, //DONE // Use a dark backgroup for AMR pages,
    colornew: "green", //DONE // color of mangas with new chapters
    colorread: "blue", //DONE// color of mangas with all chapters read
    colornotfollow: "blue-grey", //DONE // color of mangas which are not followed

    /** Updates options */
    updatechap: 1800000, //DONE // update chapters frequency
    updatemg: 86400000, //DONE // update mirrors frequency
    checkmgstart: 0, //DONE // update chapters lists on startup
    refreshspin: 1, // spin the icon while loading chapters
    savebandwidth: 0, // save bandwidth while loading chapters
    displayzero: 1, // display a grey zero when no new chapter
    nocount: 1, // 1 : display gray sharingan and normal if new chaps; 0 : badge
    
    /**
     * Categories states, each custom category is stored in localStorage in this array
     * states are 
     *  - include (include mangas from this cat), 
     *  - exclude (exclude manga from this cat), 
     *  - <empty> (does not care of this cat)
     */
    categoriesStates: [
        { name: "New", state: "include", type: "native" },
        { name: "Read", state: "include", type: "native" },
        { name: "Unread", state: "include", type: "native" },
        { name: "One Shots", state: "include", type: "native" }
    ], 

    /** Internal timestamps and state booleans */
    updated: 0, // last time something has been changed in the list
    changesSinceSync: 0, // 1 : something has been changed since last sync
    lastChaptersUpdate: 0, // last time chapters lists have been updated
    lastMirrorsUpdate: 0, // last time mirrors have been updated
    
}

const jsonOptions = ["categoriesStates", "impl-repositories"];
const stringOptions = ["colornew", "colorread", "colornotfollow"];

/**
 *  initial state of amr options
 */
const state = default_options

// getters
const getters = {
    /**
     * Return the whole options object
     */
    options: state => state,
}

// actions
const actions = {
    /**
     * Override default options with options values in localStorage
     * @param {*} param0 
     */
    initOptions({ commit, dispatch, state }) {
        for (let key of Object.keys(state)) {
            let storedVal = localStorage["o." + key];
            if (storedVal) {
                if (jsonOptions.includes(key)) storedVal = JSON.parse(storedVal);
                else {
                    if (!stringOptions.includes(key)) {
                        storedVal = parseInt(storedVal); // all non Json and non String values are considered Integers --> this is right for now
                    }
                }
                commit('setOption', { key: key, value: storedVal });
            }
        }
    },
    /**
     * Set an option
     * @param {*} param0 
     * @param {*} keyValObj object with key and value fields
     */
    setOption({ commit, dispatch }, keyValObj) {
        commit('setOption', keyValObj);
        localStorage["o." + keyValObj.key] = keyValObj.value;
    },
    /**
     * Adds a category in categories states and save
     * @param {*} param0 
     * @param {*} name 
     */
    addCategory({ commit, dispatch, state }, name) {
        commit('addCategory', name);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
    },
    /**
     * Remove a non native category from categories states and save
     * @param {*} param0 
     * @param {*} name 
     */
    removeCategory({ commit, dispatch, state, rootState }, name) {
        commit('removeCategory', name);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
        for (let mg of rootState.mangas.all) {
            if (mg.cats.includes(name)) {
                dispatch("removeCategoryFromManga", {key: mg.key, name: name});
            }
        }
    },
    /**
     * Updates a categories state and save
     * @param {*} param0 
     * @param {*} catObj 
     */
    updateCategory({ commit, dispatch, state }, catObj) {
        commit('updateCategory', catObj);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
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
        Object.assign(state, opts);
    },
    /**
     * Set {key, value} option
     * @param {*} state 
     * @param {*} obj containing key and value
     */
    setOption(state, { key, value }) {
        if (!key) console.error("Impossible to set option with undefined key; value is " + value);
        else state[key] = value;
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
        state.categoriesStates.push(toadd);
    },
    /**
     * Remove a non native category from categories states
     * @param {*} state 
     * @param {*} name 
     */
    removeCategory(state, name) {
        let index = state.categoriesStates.findIndex(cat => cat.type !== "native" && cat.name === name);
        if (index >= 0) state.categoriesStates.splice(index, 1);
    },
    /**
     * Updates a categories state
     * @param {*} state 
     * @param {*} param1 
     */
    updateCategory(state, {name, catstate}) {
        let cat = state.categoriesStates.find(cat => cat.name === name);
        cat.state = catstate;
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}