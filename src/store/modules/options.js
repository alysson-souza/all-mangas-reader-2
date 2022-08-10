import { defaultOptions, OptionStorage } from "../../shared/OptionStorage"

const optionStorage = new OptionStorage()

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
     */
    async initOptions({ commit }, options) {
        commit("extendOptions", options)
    },
    /**
     * Set an option
     * @param {*} param0
     * @param {*} keyValObj object with key and value fields
     */
    setOption({ commit, dispatch }, keyValObj) {
        commit("setOption", keyValObj)
        optionStorage.setKey(keyValObj.key, keyValObj.value)
    },
    /**
     * Adds a category in categories states and save
     * @param {*} param0
     * @param {*} name
     */
    addCategory({ commit, dispatch, state }, name) {
        commit("addCategory", name)
        optionStorage.setKey("categoriesStates", state.categoriesStates)
    },
    /**
     * Remove a non native category from categories states and save
     * @param {*} param0
     * @param {*} name
     */
    removeCategory({ commit, dispatch, state, rootState }, name) {
        commit("removeCategory", name)
        optionStorage.setKey("categoriesStates", state.categoriesStates)
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
        optionStorage.setKey("categoriesStates", state.categoriesStates)
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
        optionStorage.updateCategories(state.categoriesStates)
    },
    /**
     * Adds a native category in categories states and save
     * @param {*} param0
     * @param {*} name
     */
    addNativeCategory({ commit, dispatch, state }, name) {
        commit("addNativeCategory", name)
        optionStorage.updateCategories(state.categoriesStates)
    },
    /**
     * Remove a language category from categories states and save
     * @param {*} param0
     * @param {*} name
     */
    removeLanguageCategory({ commit, dispatch, state, rootState }, name) {
        commit("removeLanguageCategory", name)
        optionStorage.updateCategories(state.categoriesStates)
    },
    /**
     * Updates a categories state and save
     * @param {*} param0
     * @param {*} catObj
     */
    updateCategory({ commit, dispatch, state }, catObj) {
        commit("updateCategory", catObj)
        optionStorage.updateCategories(state.categoriesStates)
    },
    /**
     * Updates a categories name and save, use to upgrade native categories names for i18n
     * @param {*} param0
     * @param {{oldname: string, newname: string}} oldnew Information about the category name change.
     */
    updateCategoryName({ commit, dispatch, state }, oldnew) {
        commit("updateCategoryName", oldnew)
        optionStorage.updateCategories(state.categoriesStates)
    },
    /**
     * Add a language to readable languages list
     * @param {*} param0
     * @param {*} lang
     */
    addReadLanguage({ commit, state }, lang) {
        commit("addReadLanguage", lang)
        optionStorage.setKey("readlanguages", state.readlanguages)
    },
    /**
     * Remove a language from readable languages list
     * @param {*} param0
     * @param {*} lang
     */
    removeReadLanguage({ commit, state }, lang) {
        commit("removeReadLanguage", lang)
        optionStorage.setKey("readlanguages", state.readlanguages)
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
    state: defaultOptions,
    getters,
    actions,
    mutations
}
