import storedb from "../../amr/storedb"
import { bookmarkKey } from "../../shared/utils"

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
    allBookmarks: state => state.all
}

const actions = {
    /**
     * Get bookmarks from local database
     * @param {*} param0
     */
    async initBookmarksFromDB({ commit, dispatch }) {
        const bookmarks = await storedb.getBookmarks() // Get bookmarks from local database
        // set bookmarks list in store
        commit("setBookmarks", bookmarks)
    },
    /**
     * Create a bookmark in the store
     * @param {*} param0
     * @param {*} bm
     */
    async createBookmark({ commit, rootState }, bm) {
        if (!bm.key) {
            bm.key = bookmarkKey({ bookmark: bm, rootState: { state: rootState } })
        }
        commit("createBookmark", bm)
        await storedb.storeBookmark(bm)
    },
    /**
     * Updates the note on a bookmark
     * @param {*} param0
     * @param {*} bm bookmark with new note
     */
    async updateBookmarkNote({ commit, rootState }, bm) {
        if (!bm.key) {
            bm.key = bookmarkKey({ bookmark: bm, rootState: { state: rootState } })
        }
        commit("updateBookmarkNote", bm)
        await storedb.storeBookmark(bm)
    },
    /**
     * Delete a bookmark in the store
     * @param {*} param0
     * @param {*} bm existing bookmark
     */
    async deleteBookmark({ commit, rootState }, bm) {
        const key = bookmarkKey({ bookmark: bm, rootState: { state: rootState } })
        if (state.all.some(bookmark => bookmark.key === key)) {
            commit("deleteBookmark", key)
            await storedb.deleteBookmark(key)
        }
    }
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
            bm.key = bookmarkKey({ bookmark: bm, rootState: this.$store })
        }
        state.all.push(bm)
    },
    /**
     * Updates the note on a bookmark
     * @param {*} state
     * @param {*} bm bookmark with new note
     */
    async updateBookmarkNote(state, bm) {
        const bmn = state.all.find(bookmark => bookmark.key === bm.key)
        if (bmn !== undefined) {
            bmn.note = bm.note
        }
    },
    /**
     * Delete a bookmark
     * @param {*} state
     * @param {*} key key of the bookmark to delete
     */
    deleteBookmark(state, key) {
        const bmindex = state.all.findIndex(bookmark => bookmark.key === key)
        if (bmindex >= 0) {
            state.all.splice(bmindex, 1)
        }
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
