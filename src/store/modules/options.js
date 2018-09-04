import storedb from '../../amr/storedb'
import Vue from 'vue';

/**
 * Default options of AMR.
 * Each option MUST figure in this object
 */
const default_options = {
    debug: 1, // display debug traces in content script, background, popup, ...

    /**
     * Options used in content scripts (included in mangas pages)
     */
    displayChapters: 1, // display scans as a book
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
    lrkeys: 1, // use arrows keys to read chapter
    rightnext: 1, // arrow right goes to next chapter at bottom
    load: 1, //See loading progression in the title bar
    imgorder: 0, //Load scans in order

    /**
     * Options used by background script
     */
    "impl_repositories": [ // repositories containing mirrors implementations
        "https://mirrors.allmangasreader.com/v4/"
    ],

    /** Customization options */
    newTab: 0, //Open popup in new tab
    displastup: 0, // Display a badge with last time updated in popup
    dark: 0, // Use a dark backgroud for AMR pages,
    colornew: "green", // color of mangas with new chapters
    colorread: "blue", // color of mangas with all chapters read
    colornotfollow: "blue-grey",  // color of mangas which are not followed
    groupmgs: 1, // group manga with similar name (one piece and One Piece)

    /** Updates options */
    updatechap: 21600000, // update chapters frequency (6 hours default)
    updatemg: 86400000, // update mirrors frequency
    stopupdateforaweek: 1, // stop updates for a week after last chapter was found
    checkmgstart: 0, // update chapters lists on startup
    refreshspin: 1, // spin the icon while loading chapters
    savebandwidth: 0, // save bandwidth while loading chapters
    displayzero: 0, // display a grey zero when no new chapter
    nocount: 1, // 1 : display gray sharingan and normal if new chaps; 0 : badge

    /** Notification options */
    shownotifications: 1, //display notifications on new chapter
    notificationtimer: 0, //time to clear notification auto

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
        { name: "category_oneshots", state: "include", type: "native" }
    ],

    /** Internal timestamps and state booleans */
    updated: 0, // last time something has been changed in the list
    changesSinceSync: 0, // 1 : something has been changed since last sync
    lastChaptersUpdate: 0, // last time chapters lists have been updated
    lastMirrorsUpdate: 0, // last time mirrors have been updated

}

const jsonOptions = ["categoriesStates", "impl_repositories", "readlanguages"];
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
                dispatch("removeCategoryFromManga", { key: mg.key, name: name });
            }
        }
    },
    /**
     * Adds a language category in categories states and save
     * @param {*} param0 
     * @param {*} name 
     */
    addLanguageCategory({ commit, dispatch, state }, name) {
        commit('addLanguageCategory', name);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
    },
    /**
     * Remove a language category from categories states and save
     * @param {*} param0 
     * @param {*} name 
     */
    removeLanguageCategory({ commit, dispatch, state, rootState }, name) {
        commit('removeLanguageCategory', name);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
    },
    /**
     * Updates a categories state and save
     * @param {*} param0 
     * @param {*} catObj 
     */
    updateCategory({ commit, dispatch, state }, catObj) {
        commit('updateCategory', catObj);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
    },
    /**
     * Updates a categories name and save, use to upgrade native categories names for i18n
     * @param {*} param0 
     * @param {*} catObj 
     */
    updateCategoryName({ commit, dispatch, state }, oldnew) {
        commit('updateCategoryName', oldnew);
        localStorage["o.categoriesStates"] = JSON.stringify(state.categoriesStates);
    },
    /**
     * Move a repository up in the list
     * @param {*} param0 
     * @param {*} repourl 
     */
    moveUpRepository({ commit, state }, repourl) {
        commit('moveUpRepository', repourl);
        localStorage["o.impl_repositories"] = JSON.stringify(state.impl_repositories);
    },
    /**
     * Move a repository down in the list
     * @param {*} param0 
     * @param {*} repourl 
     */
    moveDownRepository({ commit, state }, repourl) {
        commit('moveDownRepository', repourl);
        localStorage["o.impl_repositories"] = JSON.stringify(state.impl_repositories);
    },
    /**
     * Delete a repository from the list
     * @param {*} param0 
     * @param {*} repourl 
     */
    deleteRepository({ commit, state }, repourl) {
        commit('deleteRepository', repourl);
        localStorage["o.impl_repositories"] = JSON.stringify(state.impl_repositories);
    },
    /**
     * Update a repository in the list
     * @param {*} param0 
     * @param {*} repourl 
     */
    updateRepository({ commit, state }, {old_repo, new_repo}) {
        commit('updateRepository', {repourl: old_repo, newrepo: new_repo});
        localStorage["o.impl_repositories"] = JSON.stringify(state.impl_repositories);
    },
    /**
     * Adds a repository in the list
     * @param {*} param0 
     * @param {*} repourl 
     */
    addRepository({ commit, state }, repourl) {
        commit('addRepository', repourl);
        localStorage["o.impl_repositories"] = JSON.stringify(state.impl_repositories);
    },
    /**
     * Add a language to readable languages list
     * @param {*} param0 
     * @param {*} lang 
     */
    addReadLanguage({ commit, state }, lang) {
        commit('addReadLanguage', lang);
        localStorage["o.readlanguages"] = JSON.stringify(state.readlanguages);
    },
    /**
     * Remove a language from readable languages list
     * @param {*} param0 
     * @param {*} lang 
     */
    removeReadLanguage({ commit, state }, lang) {
        commit('removeReadLanguage', lang);
        localStorage["o.readlanguages"] = JSON.stringify(state.readlanguages);
    },
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
        let index = state.categoriesStates.findIndex(cat => cat.type !== "native" && cat.type !== "language" && cat.name === name);
        if (index >= 0) state.categoriesStates.splice(index, 1);
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
        state.categoriesStates.push(toadd);
    },
    /**
     * Remove a language category from categories states
     * @param {*} state 
     * @param {*} name 
     */
    removeLanguageCategory(state, name) {
        let index = state.categoriesStates.findIndex(cat => cat.type === "language" && cat.name === name);
        if (index >= 0) state.categoriesStates.splice(index, 1);
    },
    /**
     * Updates a categories state
     * @param {*} state 
     * @param {*} param1 
     */
    updateCategory(state, { name, catstate }) {
        let cat = state.categoriesStates.find(cat => cat.name === name);
        cat.state = catstate;
    },
    /**
     * Updates a categories name
     * @param {*} state 
     * @param {*} param1 
     */
    updateCategoryName(state, { oldname, newname }) {
        let cat = state.categoriesStates.find(cat => cat.name === oldname);
        if (cat !== undefined) cat.name = newname;
    },
    /**
     * Move a repository up in the list
     * @param {*} state 
     * @param {*} repourl 
     */
    moveUpRepository(state, repourl) {
        let index = state.impl_repositories.indexOf(repourl);
        if (index > 0) {
            let tmp = state.impl_repositories[index];
            Vue.set(state.impl_repositories, index, state.impl_repositories[index - 1]);
            Vue.set(state.impl_repositories, index - 1, tmp);
        }
    },
    /**
     * Move a repository down in the list
     * @param {*} state 
     * @param {*} repourl 
     */
    moveDownRepository(state, repourl) {
        let index = state.impl_repositories.indexOf(repourl);
        if (index < state.impl_repositories.length - 1) {
            let tmp = state.impl_repositories[index];
            Vue.set(state.impl_repositories, index, state.impl_repositories[index + 1]);
            Vue.set(state.impl_repositories, index + 1, tmp);
        }
    },
    /**
     * Delete a repository from the list
     * @param {*} state 
     * @param {*} repourl 
     */
    deleteRepository(state, repourl) {
        let index = state.impl_repositories.indexOf(repourl);
        if (index >= 0) state.impl_repositories.splice(index, 1);
    },
    /**
     * Update a repository in the list
     * @param {*} state 
     * @param {*} repourl 
     */
    updateRepository(state, {repourl, newrepo}) {
        let index = state.impl_repositories.indexOf(repourl);
        state.impl_repositories[index] = newrepo;
    },
    /**
     * Adds a repository in the list
     * @param {*} state 
     * @param {*} repourl 
     */
    addRepository(state, repourl) {
        state.impl_repositories.unshift(repourl);
    },
    /**
     * Adds a readable language to the list
     * @param {*} state 
     * @param {*} lang 
     */
    addReadLanguage(state, lang) {
        state.readlanguages.push(lang);
    },
    /**
     * Removes a readable language from the list
     * @param {*} state 
     * @param {*} lang 
     */
    removeReadLanguage(state, lang) {
        let index = state.readlanguages.indexOf(lang);
        if (index >= 0) state.readlanguages.splice(index, 1);
    },
}

export default {
    state,
    getters,
    actions,
    mutations
}