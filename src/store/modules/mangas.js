import Vue from "vue"
import storedb from "../../amr/storedb"
import Manga, { MANGA_READ_STOP, MANGA_UPDATE_STOP } from "../../amr/manga"
import { getNotificationManager } from "../../amr/notifications"
import samples from "../../amr/samples"
import * as syncUtils from "../../amr/sync/utils"
import { getSyncManager } from "../../amr/sync/sync-manager"
import {
    chapPath,
    findProbableChapter,
    formatMangaName,
    gistDebug,
    isMultiLanguageList,
    mangaKey,
    readLanguage,
    shouldCheckForUpdate
} from "../../shared/utils"
import { getAppLogger } from "../../shared/AppLogger"
import { getMirrorLoader } from "../../mirrors/MirrorLoader"
import { getMirrorHelper } from "../../mirrors/MirrorHelper"
import { getIconHelper } from "../../amr/icon-helper"
import { mdFixLang, mdFixLangKey, mdFixLangsListPrefix } from "../../shared/mangaDexUtil"
import { Alarm, clearAlarm, createAlarm } from "../../shared/AlarmService"
import { shouldDelayUpdate } from "../../shared/chapterUpdaterUtil"
import { getSyncOptions } from "../../shared/Options"

let syncManager
// @TODO replace with actual error
// actually have specific meaning, does not get saved to db
const ABSTRACT_MANGA_MSG = "abstract_manga"
const ERROR_CODE_EMPTY_LIST = 1
const ERROR_CODE_FAILED_UPDATE = 2

const logger = getAppLogger({ debug: 1 })

/**
 *  initial state of the mangas module
 */
const state = {
    /**
     * List of unique manga groups selected
     */
    selected: {},
    /**
     * List of followed mangas
     */
    all: []
}

// getters
const getters = {
    /**
     * Return the whole list of followed mangas
     */
    allMangas: state => state.all,
    /**
     * Count mangas
     */
    countMangas: state => {
        return state.all.length
    },
    /**
     * Return the whole list of followed mangas
     */
    selectedManga: state => state.selected,
    selectedMangasCount: state => Object.keys(state.selected).length,
    selectedMangasKeys: state => Object.keys(state.selected),
    /**
     * Return true is there is unread chapters in manga list
     */
    hasNewMangas: state => {
        for (const mg of state.all) {
            if (mg.listChaps.length > 0) {
                if (chapPath(mg.listChaps[0][1]) != chapPath(mg.lastChapterReadURL) && mg.read == 0) {
                    return true
                }
            }
        }
        return false
    },
    /**
     * Return true is there is unread chapters in manga list
     */
    nbNewMangas: state => {
        let nb = 0
        for (const mg of state.all) {
            if (mg.listChaps.length > 0) {
                if (chapPath(mg.listChaps[0][1]) != chapPath(mg.lastChapterReadURL) && mg.read == 0) {
                    nb++
                }
            }
        }
        return nb
    },

    syncOptions: (state, getters, rootState) => {
        return getSyncOptions(rootState.options)
    },

    allOptions: rootState => {
        return Object.key(rootState.options).reduce((obj, key) => {
            obj[key] = rootState.options[key]
            return obj
        })
    }
}

// actions
const actions = {
    /**
     * Retrieve manga list from DB, initialize the store
     * @param {*} param0
     */
    async initMangasFromDB({ commit, dispatch, rootState }) {
        await dispatch("mdFixLang")
        await storedb.getMangaList().then(async mangasdb => {
            await dispatch("updateLanguageCategories")
            commit(
                "setMangas",
                mangasdb.map(
                    mg =>
                        new Manga(
                            mg,
                            mangaKey({
                                url: mg.url,
                                mirror: mg.mirror,
                                language: mg.language,
                                rootState: { state: rootState }
                            })
                        )
                )
            )
        })
    },
    async mdFixLang({ getters, rootState, dispatch }) {
        const mangasdb = await storedb.getMangaList()
        const mgs = mangasdb.filter(
            mg => mg.mirror === "MangaDex V5" && new RegExp(mdFixLangsListPrefix.join("|")).test(mg.key)
        )
        if (!mgs.length) {
            return
        }
        const temporarySyncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
        const payload = []
        for (const oldManga of mgs) {
            const key = mdFixLangKey(newManga.key)
            const newManga = new Manga(oldManga, key)
            newManga.language = mdFixLang(newManga.language)
            newManga.languages = mdFixLang(newManga.languages)
            payload.push({ oldManga, newManga })
            await storedb.replace({ oldManga, newManga })
        }
        await temporarySyncManager.fixLang(payload)
    },
    /**
     * Initialise syncManager
     * @param {*} param0
     */
    async initSync({ commit, rootState, dispatch, getters }) {
        if (syncManager) syncManager.stop()
        syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
        syncManager.start()
    },
    /**
     * Update syncManager options
     * @param {*} param0
     * @param {key: string, value: boolean} payload not caring about values yet...
     */
    async updateSync({ getters, rootState, dispatch }, payload) {
        if (syncManager) {
            syncManager.stop()
            syncManager.init(getters.syncOptions, rootState, dispatch)
            syncManager.start()
        } else {
            syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            syncManager.start()
        }
    },
    /**
     * Add a manga in the store
     * @param {*} param0
     * @param {*} manga
     */
    async addManga({ dispatch, getters, rootState }, { manga, fromSync }) {
        await storedb.storeManga(manga)
        await dispatch("exportManga", manga, { root: true })
        if (!fromSync) {
            if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            await syncManager.setToRemote(manga, "ts")
        }
        try {
            dispatch("setOption", { key: "updated", value: Date.now() })
            dispatch("setOption", { key: "changesSinceSync", value: 1 })
        } catch (e) {
            console.error("Error while updating sync timestamp")
            console.error(e)
        }
    },
    /**
     * Update a manga in the store
     * @param {*} param0
     * @param {*} manga
     */
    async findAndUpdateManga({ dispatch, commit }, manga) {
        try {
            await storedb.findAndUpdate(manga)
            dispatch("setOption", { key: "updated", value: Date.now() })
            dispatch("setOption", { key: "changesSinceSync", value: 1 })
        } catch (e) {
            console.error("Error while running findAndUpdateManga", manga)
            console.error(e)
        }
    },
    async setMangaTsOpts({ commit, dispatch }, manga, date) {
        if (manga) {
            const mg = state.all.find(m => m.key === manga.key)
            commit("setMangaTsOpts", mg.key, date)
        } else {
            const mgs = state.all.filter(m => typeof m.tsOpts === "undefined")
            for (const mg of mgs) {
                commit("setMangaTsOpts", mg.key)
                await dispatch("findAndUpdateManga", mg)
            }
        }
    },
    /**
     * Change manga display mode
     * @param {*} vuex object
     * @param {*} message containing url of the manga and new display mode
     */
    async setMangaDisplayMode({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit("setMangaDisplayMode", message, fromSync)
        dispatch("findAndUpdateManga", mg)
        if (!fromSync) {
            if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            await syncManager.setToRemote(mg, "display")
        }
    },
    /**
     * Change manga reader layout mode
     * @param {*} vuex object
     * @param {*} message containing url of the manga and new layout mode
     */
    async setMangaLayoutMode({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit("setMangaLayoutMode", message, fromSync)
        dispatch("findAndUpdateManga", mg)
        if (!fromSync) {
            if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            await syncManager.setToRemote(mg, "layout")
        }
    },
    /**
     * Change manga reader webtoon mode
     * @param {*} vuex object
     * @param {*} message containing url of the manga and new webtoon mode
     */
    async setMangaWebtoonMode({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })

        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit("setMangaWebtoonMode", message, fromSync)
        dispatch("findAndUpdateManga", mg)
        if (!fromSync) {
            if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            await syncManager.setToRemote(mg, "webtoon")
        }
    },
    /**
     * Change manga reader zoom value
     * @param {*} param0
     * @param {*} message
     */
    async setMangaZoomMode({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit("setMangaZoomMode", message)
        dispatch("findAndUpdateManga", mg)
        if (!fromSync) {
            if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            await syncManager.setToRemote(mg, "zoom")
        }
    },

    /**
     * Change manga display name
     * @param {*} vuex object
     * @param {*} message containing manga object
     */
    async setMangaDisplayName({ dispatch, commit, getters }, message, fromSync) {
        const mg = state.all.find(manga => manga.key === message.key)
        commit("setMangaDisplayName", message, fromSync)
        dispatch("findAndUpdateManga", mg)
        if (!fromSync) {
            if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
            await syncManager.setToRemote(mg, "displayName")
        }
    },
    /**
     * Reset manga reading for a manga to first chapter
     * @param {*} vuex object
     * @param {*} message containing url of the manga
     */
    async resetManga({ dispatch, commit, getters, rootState }, message) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })

        const mg = state.all.find(manga => manga.key === key)
        commit("resetManga", mg)
        dispatch("findAndUpdateManga", mg)
        await syncManager.setToRemote(mg, "ts")
    },
    /**
     * Save the state of reading (currentChapter and currentScanUrl)
     * If the same chapter is reopened next time, it goes to currentScanUrl
     * @param {*} vuex object
     * @param {*} message containing url of the manga
     */
    async saveCurrentState({ dispatch, commit, getters, rootState }, message) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        commit("saveCurrentState", { key, ...message })
        const mg = state.all.find(manga => manga.key === key)
        dispatch("findAndUpdateManga", mg)
        return true
    },

    async createUnlistedManga({ dispatch, commit, rootState }, message) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        commit("createManga", {
            key,
            // Setting webtoon default
            webtoon: rootState.options.webtoonDefault === 1,
            ...message
        })
        const mg = state.all.find(manga => manga.key === key)
        try {
            await dispatch("refreshLastChapters", message)
        } catch (e) {
            // do not save mangas added from search panel on websites proposing multiple language -->
            // in this case, the first attempt does not contains the required language field
            if (e === ABSTRACT_MANGA_MSG) {
                return
            }
            // ignore error if manga list can not be loaded --> save the manga
            console.error(e)
        }

        dispatch("addManga", { manga: mg, fromSync: message.isSync })
        // update native language categories
        dispatch("updateLanguageCategories")
    },

    /**
     * Read a manga : update latest read chapter if the current chapter is more recent than the previous one
     * @param {*} vuex object
     * @param {*} message containing infos about the manga read
     */
    async readManga({ dispatch, commit, getters, rootState }, message) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        if (key.indexOf("unknown") === 0) {
            console.error("Impossible to import manga because mirror can't be found. Perhaps has it been deleted...")
            console.error(message)
            return
        }
        const iconHelper = getIconHelper({ state: rootState, getters })
        const mg = state.all.find(manga => manga.key === key)
        if (mg === undefined) {
            console.warn("readManga of an unlisted manga --> create it")
            await dispatch("createUnlistedManga", message)
            iconHelper.refreshBadgeAndIcon()
            return
        }

        try {
            await dispatch("consultManga", message)
        } catch (e) {
            console.error(e) // ignore error if manga list can't be updated
        }

        dispatch("findAndUpdateManga", mg)
        iconHelper.refreshBadgeAndIcon()
    },
    /**
     * Get list of chapters for a manga
     */
    async getMangaListOfChapters({ dispatch, commit, getters, rootState }, manga) {
        // @TODO can this be injected somehow?
        const mirrorLoader = getMirrorLoader(getMirrorHelper(rootState.options))
        const impl = await mirrorLoader.getImpl(manga.mirror)
        if (!impl || impl.disabled) {
            await dispatch("disabledManga", manga)
            throw new Error(`Failed to get implementation for mirror ${manga.mirror}`)
        }
        return impl.getListChaps(manga.url)
    },

    /**
     * Stop Reading and Following updates
     * @param dispatch
     * @param manga
     * @return {Promise<void>}
     */
    async disabledManga({ dispatch }, manga) {
        manga.update = MANGA_UPDATE_STOP
        manga.read = MANGA_READ_STOP
        await dispatch("findAndUpdateManga", manga)
    },

    /**
     * Called when a manga entry is consulted
     * Returns a Promise
     * @param {*} vuex object
     * @param {*} message message contains info on a manga and flag fromSite
     */
    async consultManga({ dispatch, commit, getters, rootState }, message) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })

        let posOld = -1
        let posNew = -1
        const mg = state.all.find(manga => manga.key === key)

        const mgchap = chapPath(mg.lastChapterReadURL)
        const messchap = chapPath(message.lastChapterReadURL)

        for (let i = 0; i < mg.listChaps.length; i++) {
            if (chapPath(mg.listChaps[i][1]) === mgchap) {
                posOld = i
            }
            if (chapPath(mg.listChaps[i][1]) === messchap) {
                posNew = i
            }
        }

        commit("updateMangaEntryWithInfos", { key: mg.key, obj: message })

        if (posNew !== -1) {
            if (message.fromSite || posNew < posOld || posOld === -1) {
                commit("updateMangaLastChapter", { key: mg.key, obj: message }, { root: true })
                if (!message.isSync) {
                    if (!syncManager) {
                        syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
                    }
                    await syncManager.setToRemote(mg, "ts")
                }
            }
            return
        }

        if (mg.update !== 1) {
            // Nothing to do
            return
        }

        // Main logic
        let listChaps = await dispatch("getMangaListOfChapters", mg)
        /**
         * Manage the case in which the returned list contains multiple chapters list
         * for different languages
         */
        if (listChaps !== undefined && !Array.isArray(listChaps)) {
            if (mg.language === undefined) {
                // should not happen there (the case is handled for new mangas but not here when manga already exists)
                reject(
                    new Error(
                        "Mirror language is undefined. the case is handled for new mangas but not here when manga already exists"
                    )
                )
            }
            if (listChaps[mg.language] && listChaps[mg.language].length > 0) {
                // update list of existing languages
                const listLangs = Object.keys(listChaps).join(",")
                commit("updateMangaListLangs", { key: mg.key, langs: listLangs })
                // set current list chaps to the right one
                listChaps = listChaps[mg.language]
            } else {
                logger.debug(
                    "required language " +
                        mg.language +
                        " does not exist in resulting list of chapters for manga " +
                        mg.name +
                        " on " +
                        mg.mirror +
                        ". Existing languages are : " +
                        Object.keys(listChaps).join(",")
                )
            }
        }
        if (listChaps.length > 0) {
            commit("updateMangaListChaps", { key: mg.key, listChaps: listChaps })
            const mgchap = chapPath(mg.lastChapterReadURL),
                messchap = chapPath(message.lastChapterReadURL)
            for (let i = 0; i < listChaps.length; i++) {
                if (chapPath(listChaps[i][1]) === mgchap) posOld = i
                if (chapPath(listChaps[i][1]) === messchap) posNew = i
            }
            if (posNew !== -1 && (message.fromSite || posNew < posOld || posOld === -1)) {
                commit("updateMangaLastChapter", { key: mg.key, obj: message })
                if (!message.isSync) {
                    if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
                    await syncManager.setToRemote(mg, "ts")
                }
            }
        }
    },

    /**
     * Return list of chapters.
     * Clean up multi language list if needed.
     * Should always return chapters in the same format
     */
    async getMangaChapters({ dispatch, commit, getters, rootState }, mg) {
        logger.debug("waiting for manga list of chapters for " + mg.name + " on " + mg.mirror)
        const listChaps = await dispatch("getMangaListOfChapters", mg)

        // list chapters in the correct format
        if (!isMultiLanguageList(listChaps)) {
            return listChaps
        }

        // Manage the case in which the returned list contains multiple
        // chapters list for different languages
        if (mg.language === undefined) {
            // Returned list contains different languages and language has not been set,
            // this can be the case if manga is added from search list on a website
            // supporting multiple languages like MangaDex (require login for search) etc.
            const availableChapterLanguages = Object.keys(listChaps)
            if (availableChapterLanguages.length === 0) {
                // Now we are expecting to be dealing with multi languages otherwise, we start deleting stuff...
                throw new Error(`Failed to get valid language for ${mg.key}`)
            }
            const readable = rootState.options.readlanguages

            // Pick languages to read, select from readable languages
            const languagesToAdd = availableChapterLanguages.filter(l => readable.includes(l))

            // if none, select first language
            if (languagesToAdd.length === 0) {
                languagesToAdd.push(availableChapterLanguages[0])
            }
            // add a manga entry for all readable languages
            for (const language of languagesToAdd) {
                dispatch("readManga", {
                    url: mg.url,
                    mirror: mg.mirror,
                    language: language,
                    name: mg.name
                })
            }

            // Remove the manga --> will always fail because no language specified
            dispatch("deleteManga", mg)
            // Fail for current (deleted) manga
            // actually have specific meaning, does not get saved to db
            throw ABSTRACT_MANGA_MSG
        }

        logger.debug(
            "chapters in multiple languages found for " +
                mg.name +
                " on " +
                mg.mirror +
                " --> select language " +
                mg.language
        )
        if (listChaps[mg.language] && listChaps[mg.language].length > 0) {
            // update list of existing languages
            const listOfLanguages = Object.keys(listChaps).join(",")
            commit("updateMangaListLangs", { key: mg.key, langs: listOfLanguages })
            // return current list chaps to the selected one
            return listChaps[mg.language]
        }

        logger.debug(
            "required language " +
                mg.language +
                " does not exist in resulting list of chapters. Existing languages are : " +
                Object.keys(listChaps).join(",")
        )
        return listChaps
    },

    /**
     * Check if there is new chapters on a manga entry
     * Display a notification if so
     * @throws Error|string
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     * @return void
     */
    async refreshLastChapters({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        const mg = state.all.find(manga => manga.key === key)
        if (mg.update !== 1) {
            return
        }

        const listChaps = await dispatch("getMangaChapters", mg)
        if (listChaps.length <= 0) {
            logger.error(`Not chapters found for ${key}, skipping refreshLastChapters...`)
            dispatch("markHasUpdateError", { manga: mg, errorCode: ERROR_CODE_EMPTY_LIST })
            return
        }

        const oldLastChap = typeof mg.listChaps[0] === "object" ? mg.listChaps[0][1] : undefined

        logger.debug(listChaps.length + " chapters found for " + mg.name + " on " + mg.mirror)
        commit("updateMangaListChaps", { key: mg.key, listChaps: listChaps })
        dispatch("markNoUpdateError", mg)

        const newLastChap = mg.listChaps[0][1]

        if (newLastChap !== oldLastChap && oldLastChap !== undefined) {
            if (!fromSync && !message.isSync) {
                getNotificationManager({ state: rootState }).notifyNewChapter(mg)
            }
            commit("updateMangaLastChapTime", { key: mg.key })
        }

        if (!mg.lastChapterReadURL) {
            // no last chapter read (imported from samples or from search)
            commit("updateMangaLastChapter", {
                key: mg.key,
                obj: {
                    lastChapterReadURL: listChaps[listChaps.length - 1][1],
                    lastChapterReadName: listChaps[listChaps.length - 1][0],
                    fromSite: false
                }
            })
            return
        }
        if (rootState.options.gistDebugEnabled) {
            gistDebug(getters.syncOptions.gistSyncSecret, getters.syncOptions.gistSyncGitID, "amrResets.json", {
                name: mg.name,
                mirror: mg.mirror,
                oldPath: mg.lastChapterReadURL,
                oldName: mg.lastChapterReadName,
                newPath: listChaps[listChaps.length - 1][1],
                newName: listChaps[listChaps.length - 1][0],
                dateTime: new Date().toLocaleString()
            }).catch(e => logger.error(e))
        }

        // test if lastChapterRead is consistent (exists)
        const lastReadPath = chapPath(mg.lastChapterReadURL)
        const lastRead = mg.listChaps.find(arr => chapPath(arr[1]) === lastReadPath)
        if (lastRead) {
            return
        }

        logger.debug(
            "Manga " +
                mg.name +
                " on " +
                mg.mirror +
                " has a lastChapterReadURL set to " +
                mg.lastChapterReadURL +
                " but this url can no more be found in the chapters list. First url in list is " +
                mg.listChaps[0][1] +
                ". "
        )
        const probable = findProbableChapter(mg.lastChapterReadURL, mg.listChaps)
        if (probable !== undefined) {
            const [name, url] = probable
            logger.debug(`Found probable chapter : ${name} : ${url}`)
            commit("updateMangaLastChapter", {
                key: mg.key,
                obj: {
                    lastChapterReadURL: url,
                    lastChapterReadName: name,
                    fromSite: false
                }
            })
            return
        }

        logger.debug("No list entry or multiple list entries match the known last chapter. Reset to first chapter")
        commit("updateMangaLastChapter", {
            key: mg.key,
            obj: {
                lastChapterReadURL: listChaps[listChaps.length - 1][1],
                lastChapterReadName: listChaps[listChaps.length - 1][0],
                fromSite: false
            }
        })
    },

    /**
     * Update all mangas chapters lists
     * @param {*} param0
     * @param {*} force force update if true. If false, check last time manga has been updated and take parameter pause for a week into account
     */
    async updateChaptersLists({ dispatch, getters, state, rootState }, { force } = { force: true }) {
        const delayUpdate = shouldDelayUpdate(rootState)
        if (delayUpdate.shouldSkip) {
            logger.debug(delayUpdate.message)
            if (delayUpdate.nextRunTimestamp) {
                createAlarm({ name: Alarm.DelayedChaptersUpdates, when: delayUpdate.nextRunTimestamp })
            }
            return
        }

        dispatch("setOption", { key: "isUpdatingChapterLists", value: 1 }) // Set watcher
        const nowInMs = Date.now()
        dispatch("setOption", { key: "lastChaptersUpdate", value: nowInMs })
        logger.info(
            `Started chapter lists update. lastChaptersUpdate is now ${new Date(nowInMs).toISOString()} (${nowInMs})`
        )

        const iconHelper = getIconHelper({ state: rootState, getters })
        createAlarm({ name: Alarm.UpdatingChapterListsChange, delayInMinutes: 10 })
        if (rootState.options.refreshspin === 1) {
            iconHelper.spinIcon()
            // stop spinning after two minutes if any error occurred
            createAlarm({ name: Alarm.StopSpinning, delayInMinutes: 2 })
        }

        // Group mangas that we need to update for each mirror
        /** @type {Record<string, AppManga[]>} */
        const mirrorTasks = {}
        for (const mg of state.all) {
            if (mg.deleted === syncUtils.DELETED) {
                continue // Don't refresh deleted manga
            }

            // we update if it has been forced by the user (through option or timers page) or if we need to update
            if (force || shouldCheckForUpdate(mg, rootState.options, logger)) {
                if (!mirrorTasks[mg.mirror]) {
                    mirrorTasks[mg.mirror] = []
                }
                mirrorTasks[mg.mirror].push(mg)
            }
        }
        logger.debug(`Completed grouping with ${Object.keys(mirrorTasks).length} mirrors`)
        logger.info(
            Object.entries(mirrorTasks).reduce((acc, [name, list]) => {
                acc[name] = list.length
                return acc
            }, {})
        )

        async function refreshManga(mg) {
            return dispatch("refreshLastChapters", mg)
                .then(() => {
                    dispatch("findAndUpdateManga", mg) //save updated manga, do not wait
                    iconHelper.refreshBadgeAndIcon()
                })
                .catch(e => {
                    if (e !== ABSTRACT_MANGA_MSG) {
                        logger.error(e)
                        dispatch("markHasUpdateError", { manga: mg, errorCode: ERROR_CODE_FAILED_UPDATE })
                    }
                })
        }

        const sleep = delay => new Promise(resolve => setTimeout(() => resolve(), delay))
        // Force at least 1 second interval
        const waitDelayInMs = Math.max(rootState.options.waitbetweenupdates, 1) * 1000

        await Promise.all(
            Object.entries(mirrorTasks).map(async ([name, mirrorMangas]) => {
                const now = Date.now()
                for (const mg of mirrorMangas) {
                    await refreshManga(mg).catch(logger.error)
                    await sleep(waitDelayInMs)
                }
                logger.info(`[${name}] completed processing in ${Date.now() - now}ms`)
            })
        ).catch(logger.error)

        logger.info("Done updating chapter lists")

        if (!rootState.options.isUpdatingChapterLists) {
            clearAlarm(Alarm.UpdatingChapterListsChange).then(r =>
                logger.debug(`${Alarm.UpdatingChapterListsChange} Cleared=${r}`)
            )
        }
        dispatch("setOption", { key: "isUpdatingChapterLists", value: 0 }) // Unset watcher when done

        if (rootState.options.refreshspin === 1) {
            iconHelper.stopSpinning()
            clearAlarm(Alarm.StopSpinning).then(r => logger.debug(`${Alarm.StopSpinning} Cleared=${r}`))
        }
    },

    /**
     * Change the read top on a manga
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     */
    async markMangaReadTop({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            message.key = key
            commit("setMangaReadTop", message, fromSync)
            dispatch("findAndUpdateManga", mg)
            if (!fromSync) {
                if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
                await syncManager.setToRemote(mg, "read")
            }
        }
        const iconHelper = getIconHelper({ state: rootState, getters })
        iconHelper.refreshBadgeAndIcon()
    },

    /**
     * Mark manga as having an update error
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     */
    markHasUpdateError({ dispatch, commit, getters, rootState }, { manga, errorCode }) {
        commit("markHasUpdateError", { manga, errorCode })
        dispatch("findAndUpdateManga", manga)
    },
    /**
     * Mark manga as having an update error
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     */
    markNoUpdateError({ dispatch, commit, getters, rootState }, manga) {
        commit("markNoUpdateError", manga)
        dispatch("findAndUpdateManga", manga)
    },
    /**
     * Change the update top on a manga
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     */
    async markMangaUpdateTop({ dispatch, commit, getters, rootState }, message, fromSync) {
        const key = mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: { state: rootState }
        })
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            message.key = key
            commit("setMangaUpdateTop", message, fromSync)
            dispatch("findAndUpdateManga", mg)
            if (!fromSync) {
                if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
                await syncManager.setToRemote(mg, "update")
            }
        }

        const iconHelper = getIconHelper({ state: rootState, getters })
        iconHelper.refreshBadgeAndIcon()
    },
    /**
     * Refresh chapters and update mangas from the message mangas list
     * @param {*} param0
     * @param {{ action: string, mangas: { url: string, mirror: any, language: any }[]}} message
     */
    async refreshMangas({ dispatch, getters, rootState }, { manga }) {
        const iconHelper = getIconHelper({ state: rootState, getters })
        iconHelper.spinIcon()
        try {
            await dispatch("refreshLastChapters", manga)
            await storedb.storeManga(manga)
        } catch (e) {
            console.error(e)
        }
        iconHelper.stopSpinning()
    },
    /**
     * Given its key, deletes a manga from reading list
     * @param {*} param0
     * @param {*} message
     */
    async deleteManga({ dispatch, commit, getters, rootState }, message, fromSync = false) {
        const mg = state.all.find(manga => manga.key === message.key)
        if (mg !== undefined) {
            commit("deleteManga", message.key)
            storedb.deleteManga(message.key)
            dispatch("unExportManga", mg, { root: true })
            if (!fromSync) {
                if (!syncManager) syncManager = getSyncManager(getters.syncOptions, rootState, dispatch)
                await syncManager.deleteManga(message.key)
            }
        }
        const iconHelper = getIconHelper({ state: rootState, getters })
        iconHelper.refreshBadgeAndIcon()
        // update native language categories
        dispatch("updateLanguageCategories")
    },
    /**
     * Import sample mangas on user request
     * @param {*} param0
     */
    importSamples({ dispatch }) {
        logger.debug("Importing samples manga in AMR (" + samples.length + " mangas to import)")
        for (const sample of samples) {
            sample.auto = true
            dispatch("readManga", sample)
        }
    },
    /**
     * Add category
     * @param {*} param0
     * @param {*} obj containing key of the manga and name of the category
     */
    addCategoryToManga({ commit, dispatch }, obj) {
        const mg = state.all.find(manga => manga.key === obj.key)
        commit("addCategoryToManga", obj)
        dispatch("findAndUpdateManga", mg)
    },
    /**
     * Remove category
     * @param {*} param0
     * @param {*} param0
     */
    removeCategoryFromManga({ commit, dispatch }, obj) {
        const mg = state.all.find(manga => manga.key === obj.key)
        commit("removeCategoryFromManga", obj)
        dispatch("findAndUpdateManga", mg)
    },

    /**
     * Updates categories to add language categories if there is mangas in more
     * than one different language
     * @param {*} param0
     */
    updateLanguageCategories({ commit, dispatch, rootState }) {
        const catsLang = rootState.options.categoriesStates.filter(cat => cat.type === "language")
        const langs = []
        for (const mg of state.all) {
            const l = readLanguage(mg, rootState.mirrors.all)
            if (l !== "aa" && !langs.includes(l)) langs.push(l) // do not create a category for aa which corresponds to multiple languages possible
        }
        if (catsLang.length > 0 && langs.length <= 1) {
            // remove language categories, only one language
            for (const cat of catsLang) {
                dispatch("removeLanguageCategory", cat.name)
            }
        } else if (langs.length > 1) {
            // add new ones
            for (const l of langs) {
                if (catsLang.findIndex(cat => cat.name === l) === -1) {
                    // add language category l
                    dispatch("addLanguageCategory", l)
                }
            }
            // remove deleted ones
            for (const cat of catsLang) {
                if (!langs.includes(cat.name)) {
                    dispatch("removeLanguageCategory", cat.name)
                }
            }
        }
    },
    toggleMangaSelect({ commit }, mangaKey) {
        commit("onSelectChange", mangaKey)
    },
    clearMangasSelect({ commit }) {
        commit("clearSelection")
    }
}

/**
 * All possible mutations on manga objects
 * It is very important to write a mutation each time we need to update or create fields on a manga object.
 * This way, mutations are propagated in the different instances of the store.
 * If not, some modifications can be not reflected and not saved to the database.
 * A mutation MUST be a synchrone function
 */
const mutations = {
    /**
     * Set the list of mangas in the store
     * @param {*} state
     * @param {*} mangas
     */
    setMangas(state, mangas) {
        state.all = mangas
    },
    setMangaTsOpts(state, key, date) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.tsOpts = date || Date.now()
        }
    },
    /**
     * Change manga display mode
     * @param {*} state
     * @param {*} param1 url of the manga and display mode
     */
    setMangaDisplayMode(state, { key, url, mirror, language, display }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.display = display
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Change manga reader layout mode
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaLayoutMode(state, { key, url, mirror, language, layout }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.layout = layout
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Change manga reader webtoon mode
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaWebtoonMode(state, { key, url, mirror, language, webtoon }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.webtoon = webtoon
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Change manga reader webtoon mode
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaZoomMode(state, { key, url, mirror, language, zoom }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.zoom = zoom
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Change manga display name
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaDisplayName(state, { key, displayName }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.displayName = displayName
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Set that the manga has an error updating
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    markHasUpdateError(state, { manga, errorCode }) {
        const mg = state.all.find(m => m.key === manga.key)
        if (mg !== undefined) {
            mg.updateError = 1
            mg.updateErrorCode = errorCode
        }
    },
    /**
     * Set that the manga has no error updating
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    markNoUpdateError(state, { key }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.updateError = 0
            mg.updateErrorCode = 0
        }
    },

    /**
     * Change manga read top
     * @param {*} state
     * @param {*} param1 url of the manga and read top
     */
    setMangaReadTop(state, { key, url, read, mirror, language }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.read = read
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Change manga update top
     * @param {*} state
     * @param {*} param1 url of the manga and update top
     */
    setMangaUpdateTop(state, { key, url, update, mirror, language }, fromSync) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.update = update
            if (!fromSync) mg.tsOpts = Date.now()
        }
    },
    /**
     * Set upts to now (means : 'last time we found a new chapter is now');
     * @param {*} state
     * @param {*} param1
     */
    updateMangaLastChapTime(state, { key }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) mg.upts = Date.now()
    },
    /**
     * Update the list of chapters of a manga
     * @param {*} state
     * @param {*} param1
     */
    updateMangaListChaps(state, { key, listChaps }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.listChaps = listChaps
        }
    },
    /**
     * Update the list of languages supported of a manga
     * @param {*} state
     * @param {*} param1
     */
    updateMangaListLangs(state, { key, langs }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.languages = langs
        }
    },
    /**
     * Update the last read chapter of a manga
     * @param {*} state
     * @param {*} param1
     */
    updateMangaLastChapter(state, { key, obj }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.lastChapterReadURL = obj.lastChapterReadURL
            mg.lastChapterReadName = obj.lastChapterReadName
            if (!obj.fromSite) {
                console.log("updated ts")
                mg.ts = Math.round(Date.now() / 1000)
            }
        }
    },
    /**
     * Change manga informations when a manga is consulted, update some of the properties
     * @param {*} state
     * @param {*} param1 key of the manga and informations
     */
    updateMangaEntryWithInfos(state, { key, obj }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            //if the current manga doesnt have a name, and the request does, then we fix the current name
            if (mg.name === "" && obj.name !== mg.name) {
                mg.name = name
            }

            //This happens when incoming updates comes from sync
            //if obj.display, obj.read, obj.cats, MAJ this....
            if (obj.display) {
                mg.display = obj.display
            }
            if (obj.layout) {
                mg.layout = obj.layout
            }
            if (obj.read) {
                mg.read = obj.read
            }
            if (obj.update) {
                mg.update = obj.update
            }
            if (obj.cats !== undefined && obj.cats !== null) {
                if (obj.cats instanceof Array) {
                    mg.cats = obj.cats
                } else {
                    mg.cats = JSON.parse(obj.cats) || []
                }
            }
            if (obj.ts && obj.fromSite) {
                mg.ts = obj.ts
            }
        }
    },
    /**
     * Reset manga reading for a manga to first chapter
     * @param {*} state
     * @param {*} param1 url of the manga
     */
    resetManga(state, { key }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (mg.listChaps.length > 0) {
                mg.lastChapterReadURL = mg.listChaps[mg.listChaps.length - 1][1]
                mg.lastChapterReadName = mg.listChaps[mg.listChaps.length - 1][0]
                mg.ts = Math.round(Date.now() / 1000)
            }
        }
    },
    /**
     * Save current state (currentChapter, currentScanUrl)
     * @param {*} state
     * @param {*} param1 url of the manga
     */
    saveCurrentState(state, { key, currentChapter, currentScanUrl }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.currentChapter = currentChapter
            mg.currentScanUrl = currentScanUrl
        }
    },
    /**
     * Create a new manga
     * @param {*} state
     * @param {*} mgdef object containing manga info
     */
    createManga(state, mgdef) {
        const mg = new Manga(mgdef, mgdef.key)
        const titMg = formatMangaName(mg.name)
        const smgs = state.all.filter(manga => formatMangaName(manga.name) === titMg)
        for (const sim of smgs) {
            mg.cats.push(...sim.cats)
            mg.layout = sim.layout
            // if (sim.read === 1) mg.read = 1
            // if (sim.update === 0) mg.update = 0
        }
        mg.cats = [...new Set(mg.cats)]
        state.all.push(mg)
    },
    /**
     * Create a new manga
     * @param {*} state
     * @param {*} mgdef object containing manga info
     */
    deleteManga(state, key) {
        const mgindex = state.all.findIndex(manga => manga.key === key)
        if (mgindex >= 0) {
            state.all.splice(mgindex, 1)
        }
    },
    /**
     * Links a category to a manga
     * @param {*} state
     * @param {*} param1 containing key of the manga and name of the category to add
     */
    addCategoryToManga(state, { key, name }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (!mg.cats.includes(name)) {
                mg.cats.push(name)
            }
        }
    },
    /**
     * Unlink a category from a manga
     * @param {*} state
     * @param {*} param1 containing key of the manga and name of the category to remove
     */
    removeCategoryFromManga(state, { key, name }) {
        const mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (mg.cats.includes(name)) {
                mg.cats.splice(mg.cats.indexOf(name), 1)
            }
        }
    },
    onSelectChange(state, mangaKey) {
        if (state.selected[mangaKey]) {
            Vue.delete(state.selected, mangaKey)
        } else {
            Vue.set(state.selected, mangaKey, true)
        }
    },
    clearSelection(state) {
        Vue.set(state, "selected", {})
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
