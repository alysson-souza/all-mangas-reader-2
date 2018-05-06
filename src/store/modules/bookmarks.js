import storedb from '../../amr/storedb'
import * as utils from '../../amr/utils'

/**
 *  initial state of the bookmarks module
 */
const state = {
    /**
     * List of bookmarks
     */
    all: []
}

// getters
const getters = {
    /**
     * Return the whole list of bookmarks
     */
    allBookmarks: state => state.all,
}

// actions
const actions = {
    /**
     * Get bookmarks from local database
     * @param {*} param0 
     */
    async initBookmarksFromDB({ commit, dispatch }) {
        let bookmarks = await storedb.getBookmarks(); // Get bookmarks from local database
        // set bookmarks list in store
        commit('setBookmarks', bookmarks);
    },
    /**
     * Create a bookmark in the store
     * @param {*} param0 
     * @param {*} bm 
     */
    async createBookmark({ commit }, bm) {
        utils.debug("create description of bookmark " + bm.key + " in db");
        commit('createBookmark', bm);
        await storedb.storeBookmark(bm);
    },
    /**
     * Delete a bookmark in the store
     * @param {*} param0 
     * @param {*} key 
     */
    async deleteBookmark({ commit }, key) {
        let bm = state.all.find(bookmark => bookmark.key === key);
        if (bm !== undefined) {
            commit('deleteBookmark', key);
            await storedb.deleteBookmark(key);
        }
    },
}

/**
 * All possible mutations on bookmarks objects
 * It is very important to write a mutation each time we need to update or create fields on a bookmark object.
 * This way, mutations are propagated in the different instances of the store.
 * If not, some modifications can be not reflected and not saved to the database.
 * A mutation MUST be a synchrone function
 */
const mutations = {
    /**
     * Set the list of bookmarks in the store
     * @param {*} state 
     * @param {*} bookmarks 
     */
    setBookmarks(state, bookmarks) {
        state.all = []
        state.all.push(...bookmarks)
    },
    /**
     * Create a new bookmark
     * @param {*} state 
     * @param {*} bm object containing bookmark info
     */
    createBookmark(state, bm) {
        if (!bm.key) {
            bm.key = utils.mangaKey(bm.url)
        }
        state.all.push(bm)
    }, 
    /**
     * Delete a bookmark
     * @param {*} state 
     * @param {*} key key of the bookmark to delete
     */
    deleteBookmark(state, key) {
        let bmindex = state.all.findIndex(bookmark => bookmark.key === key)
        if (bmindex >= 0) {
            state.all.splice(bmindex, 1);
        }
    }, 
}

export default {
    state,
    getters,
    actions,
    mutations
}