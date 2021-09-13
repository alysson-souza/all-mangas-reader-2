import Vue from 'vue';
import storedb from '../../amr/storedb'
import Manga, { MANGA_READ_STOP, MANGA_UPDATE_STOP } from '../../amr/manga'
import mirrorsImpl from '../../amr/mirrors-impl';
import notifications from '../../amr/notifications';
import statsEvents from '../../amr/stats-events';
import * as utils from "../../amr/utils";
import samples from "../../amr/samples";
import amrUpdater from '../../amr/amr-updater';
import iconHelper from '../../amr/icon-helper';
import * as syncUtils from '../../amr/sync/utils';
import { getSyncManager } from '../../amr/sync/sync-manager';
const syncManager = getSyncManager()
// @TODO replace with actual error
// actually have specific meaning, does not get saved to db
const ABSTRACT_MANGA_MSG = "abstract_manga";

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
    countMangas: (state) => {
        return state.all.length;
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
    hasNewMangas: (state) => {
        for (let mg of state.all) {
            if (mg.listChaps.length > 0) {
                if (utils.chapPath(mg.listChaps[0][1]) != utils.chapPath(mg.lastChapterReadURL) && mg.read == 0) {
                    return true;
                }
            }
        }
        return false;
    },
    /**
     * Return true is there is unread chapters in manga list
     */
    nbNewMangas: (state) => {
        let nb = 0;
        for (let mg of state.all) {
            if (mg.listChaps.length > 0) {
                if (utils.chapPath(mg.listChaps[0][1]) != utils.chapPath(mg.lastChapterReadURL) && mg.read == 0) {
                    nb++;
                }
            }
        }
        return nb;
    }
}

// actions
const actions = {
    /**
     * Retrieve manga list from DB, initialize the store
     * @param {*} param0
     */
    async initMangasFromDB({ commit }) {
        await storedb.getMangaList().then(mangasdb => {
            commit('setMangas', mangasdb.map(mg => new Manga(mg)));
        })
    },
    /**
     * Add a manga in the store
     * @param {*} param0
     * @param {*} manga
     */
    async addManga({ dispatch, commit }, manga) {
        await storedb.storeManga(manga);
        try {
            dispatch("setOption", {key: "updated", value: Date.now()});
            dispatch("setOption", {key: "changesSinceSync", value: 1});
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
    async findAndUpdateManga({dispatch, commit}, manga) {
        await storedb.findAndUpdate(manga)
        try {
            dispatch("setOption", {key: "updated", value: Date.now()});
            dispatch("setOption", {key: "changesSinceSync", value: 1});
        } catch (e) {
            console.error("Error while updating sync timestamp")
            console.error(e)
        }
    },
    /**
     * Change manga display mode
     * @param {*} vuex object
     * @param {*} message containing url of the manga and new display mode
     */
    async setMangaDisplayMode({ dispatch, commit, getters }, message, fromSync) {
        let key = utils.mangaKey(message.url, message.mirror, message.language);
        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit('setMangaDisplayMode', message);
        dispatch('findAndUpdateManga', mg);
        if(!fromSync) await syncManager.setToRemote(mg, 'display')
    },
    /**
     * Change manga reader layout mode
     * @param {*} vuex object
     * @param {*} message containing url of the manga and new layout mode
     */
    async setMangaLayoutMode({ dispatch, commit, getters }, message, fromSync) {
        let key = utils.mangaKey(message.url, message.mirror, message.language);
        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit('setMangaLayoutMode', message);
        dispatch('findAndUpdateManga', mg);
        if(!fromSync) await syncManager.setToRemote(mg, 'layout')
    },
    /**
     * Change manga reader webtoon mode
     * @param {*} vuex object
     * @param {*} message containing url of the manga and new webtoon mode
     */
    async setMangaWebtoonMode({ dispatch, commit, getters }, message, fromSync) {
        let key = utils.mangaKey(message.url, message.mirror, message.language);
        message.key = key
        const mg = state.all.find(manga => manga.key === key)
        commit('setMangaWebtoonMode', message);
        dispatch('findAndUpdateManga', mg);
        if(!fromSync) await syncManager.setToRemote(mg, 'webtoon')
    },
    /**
     * Change manga display name
     * @param {*} vuex object
     * @param {*} message containing manga object
     */
    async setMangaDisplayName({ dispatch, commit, getters }, message, fromSync) {
        const mg = state.all.find(manga => manga.key === message.key)
        commit('setMangaDisplayName', message);
        dispatch('findAndUpdateManga', mg);
        if(!fromSync) await syncManager.setToRemote(mg, 'displayName')
    },
    /**
     * Reset manga reading for a manga to first chapter
     * @param {*} vuex object
     * @param {*} message containing url of the manga
     */
    async resetManga({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url, message.mirror, message.language);
        commit('resetManga', message);
        let mg = state.all.find(manga => manga.key === key);
        dispatch('findAndUpdateManga', mg);
        await syncManager.setToRemote(mg, 'ts')
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Save the state of reading (currentChapter and currentScanUrl)
     * If the same chapter is reopened next time, it goes to currentScanUrl
     * @param {*} vuex object
     * @param {*} message containing url of the manga
     */
    async saveCurrentState({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url, message.mirror, message.language);
        commit('saveCurrentState', message);
        let mg = state.all.find(manga => manga.key === key);
        dispatch('findAndUpdateManga', mg);
    },

    async createUnlistedManga({ dispatch, commit }, message) {
        commit('createManga', message);
        const key = utils.mangaKey(message.url, message.mirror, message.language);
        const mg = state.all.find(manga => manga.key === key);

        try {
            await dispatch("refreshLastChapters", message);
        } catch (e) {
            // do not save mangas added from search panel on websites proposing multiple language -->
            // in this case, the first attempt does not contains the required language field
            if (e === ABSTRACT_MANGA_MSG) {
                return;
            }
            // ignore error if manga list can not be loaded --> save the manga
            console.error(e)
        }

        utils.debug("saving new manga to database");
        dispatch('addManga', mg);
        // update native language categories
        dispatch("updateLanguageCategories")
    },

    /**
     * Read a manga : update latest read chapter if the current chapter is more recent than the previous one
     * @param {*} vuex object
     * @param {*} message containing infos about the manga read
     */
    async readManga({ dispatch, commit, getters }, message) {
        const key = utils.mangaKey(message.url, message.mirror, message.language);
        if (key.indexOf("unknown") === 0) {
            console.error("Impossible to import manga because mirror can't be found. Perhaps has it been deleted...");
            console.error(message);
            return;
        }
        const mg = state.all.find(manga => manga.key === key);
        if (mg === undefined) {
            utils.debug("readManga of an unlisted manga --> create it");
            await dispatch("createUnlistedManga", message);
            amrUpdater.refreshBadgeAndIcon();
            return;
        }

        try {
            await dispatch("consultManga", message);
        } catch (e) {
            console.error(e); // ignore error if manga list can't be updated
        }

        dispatch('findAndUpdateManga', mg);

        // Ignore sync updates for stats
        if (message.isSync !== 1) {
            // statsEvents.trackReadManga(mg);
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Get list of chapters for a manga
     */
    async getMangaListOfChapters({ dispatch, commit, getters }, manga) {
        utils.debug("getMangaListOfChapters : get implementation of " + manga.mirror);
        const impl = await mirrorsImpl.getImpl(manga.mirror);
        if (!impl || impl.disabled) {
            await dispatch("disabledManga", manga);
            throw new Error(`Failed to get implementation for mirror ${manga.mirror}`);
        }
        utils.debug("getMangaListOfChapters : implementation found, get list of chapters for manga " + manga.name + " key " + manga.key);
        return impl.getListChaps(manga.url);
    },

    /**
     * Stop Reading and Following updates
     * @param dispatch
     * @param manga
     * @return {Promise<void>}
     */
    async disabledManga({ dispatch }, manga) {
        manga.update = MANGA_UPDATE_STOP;
        manga.read = MANGA_READ_STOP;
        await dispatch('findAndUpdateManga', manga);
    },

    /**
     * Called when a manga entry is consulted
     * Returns a Promise
     * @param {*} vuex object
     * @param {*} message message contains info on a manga and flag fromSite
     */
    async consultManga({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url, message.mirror, message.language),
            posOld = -1,
            posNew = -1,
            isNew = false,
            mg = state.all.find(manga => manga.key === key);

        let mgchap = utils.chapPath(mg.lastChapterReadURL),
            messchap = utils.chapPath(message.lastChapterReadURL);
        for (let i = 0; i < mg.listChaps.length; i++) {
            if (utils.chapPath(mg.listChaps[i][1]) === mgchap) posOld = i;
            if (utils.chapPath(mg.listChaps[i][1]) === messchap) posNew = i;
        }

        commit('updateMangaEntryWithInfos', { key: mg.key, obj: message });

        return new Promise(async (resolve, reject) => {
            if (posNew === -1) {
                if (mg.update === 1) {
                    try {
                        let listChaps = await dispatch("getMangaListOfChapters", mg)
                        /**
                         * Manage the case in which the returned list contains multiple chapters list
                         * for different languages
                         */
                        if (listChaps !== undefined && !Array.isArray(listChaps)) {
                            if (mg.language === undefined) {
                                // should not happen there (the case is handled for new mangas but not here when manga already exists)
                                reject()
                            }
                            if (listChaps[mg.language] && listChaps[mg.language].length > 0) {
                                // update list of existing languages
                                let listLangs = Object.keys(listChaps).join(",")
                                commit('updateMangaListLangs', { key: mg.key, langs: listLangs });
                                // set current list chaps to the right one
                                listChaps = listChaps[mg.language]
                            } else {
                                utils.debug("required language " + mg.language + " does not exist in resulting list of chapters for manga " + mg.name + " on " + mg.mirror + ". Existing languages are : " + Object.keys(listChaps).join(","))
                            }
                        }
                        if (listChaps.length > 0) {
                            commit('updateMangaListChaps', { key: mg.key, listChaps: listChaps });
                            let mgchap = utils.chapPath(mg.lastChapterReadURL),
                                messchap = utils.chapPath(message.lastChapterReadURL);
                            for (let i = 0; i < listChaps.length; i++) {
                                if (utils.chapPath(listChaps[i][1]) === mgchap) posOld = i;
                                if (utils.chapPath(listChaps[i][1]) === messchap) posNew = i;
                            }
                            if (posNew !== -1 && (message.fromSite || (posNew < posOld || posOld === -1))) {
                                commit('updateMangaLastChapter', { key: mg.key, obj: message });
                                syncManager.setToRemote(mg, 'ts')
                            }
                        }
                        resolve();
                    } catch (e) {
                        reject();
                    }
                } else {
                    resolve();
                }
            } else {
                if (message.fromSite || (posNew < posOld || posOld === -1)) {
                    commit('updateMangaLastChapter', { key: mg.key, obj: message });
                    syncManager.setToRemote(mg, 'ts')
                }
                resolve();
            }
        });
    },

    /**
     * Return list of chapters.
     * Clean up multi language list if needed.
     * Should always return chapters in the same format
     */
    async getMangaChapters({ dispatch, commit, getters, rootState }, mg) {

        const timeOutRefresh = setTimeout(function () {
            throw new Error("Refreshing " + mg.key + " has been timeout... seems unreachable...");
        }, 60000);

        utils.debug("waiting for manga list of chapters for " + mg.name + " on " + mg.mirror)
        let listChaps = await dispatch("getMangaListOfChapters", mg)
        clearTimeout(timeOutRefresh);

        // list chapters in the correct format
        if (!utils.isMultiLanguageList(listChaps)) {
            return listChaps
        }

        // Manage the case in which the returned list contains multiple
        // chapters list for different languages
        if (mg.language === undefined) {
            // Returned list contains different languages and language has not been set,
            // this can be the case if manga is added from search list on a website
            // supporting multiple languages like MangaDex (require login for search) etc.
            const availableChapterLanguages = Object.keys(listChaps);
            const readable = rootState.options.readlanguages;

            // Pick languages to read, select from readable languages
            const languagesToAdd = availableChapterLanguages.filter(l => readable.includes(l));

            // if none, select first language
            if (languagesToAdd.length === 0) {
                languagesToAdd.push(availableChapterLanguages[0])
            }
            // add a manga entry for all readable languages
            for (let language of languagesToAdd) {
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

        utils.debug("chapters in multiple languages found for " + mg.name + " on " + mg.mirror + " --> select language " + mg.language)
        if (listChaps[mg.language] && listChaps[mg.language].length > 0) {
            // update list of existing languages
            const listOfLanguages = Object.keys(listChaps).join(",");
            commit('updateMangaListLangs', { key: mg.key, langs: listOfLanguages });
            // return current list chaps to the selected one
            return listChaps[mg.language]
        }

        utils.debug("required language " + mg.language + " does not exist in resulting list of chapters. Existing languages are : " + Object.keys(listChaps).join(","))
        return listChaps;
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
        const key = utils.mangaKey(message.url, message.mirror, message.language);
        const mg = state.all.find(manga => manga.key === key);
        if (mg.update !== 1) {
            return;
        }

        const listChaps = await dispatch("getMangaChapters", mg)
        if (listChaps.length <= 0) {
            return;
        }

        const oldLastChap = (typeof mg.listChaps[0] === 'object' ? mg.listChaps[0][1] : undefined);

        utils.debug(listChaps.length + " chapters found for " + mg.name + " on " + mg.mirror)
        commit('updateMangaListChaps', { key: mg.key, listChaps: listChaps });

        const newLastChap = mg.listChaps[0][1];

        if ((newLastChap !== oldLastChap) && (oldLastChap !== undefined)) {
            if(!fromSync) notifications.notifyNewChapter(mg);
            commit('updateMangaLastChapTime', { key: mg.key });
        }

        if (!mg.lastChapterReadURL) {
            // no last chapter read (imported from samples or from search)
            commit('updateMangaLastChapter', {
                key: mg.key, obj: {
                    lastChapterReadURL: listChaps[listChaps.length - 1][1],
                    lastChapterReadName: listChaps[listChaps.length - 1][0],
                    fromSite: false
                }
            });
            return;
        }

        // test if lastChapterRead is consistent (exists)
        const lastReadPath = utils.chapPath(mg.lastChapterReadURL);
        const lastRead = mg.listChaps.find(arr => utils.chapPath(arr[1]) === lastReadPath);
        if (lastRead) {
            return;
        }

        console.error("Manga " + mg.name + " on " + mg.mirror + " has a lastChapterReadURL set to " + mg.lastChapterReadURL + " but this url can no more be found in the chapters list. First url in list is " + mg.listChaps[0][1] + ". ");
        const probable = utils.findProbableChapter(mg.lastChapterReadURL, mg.listChaps);
        if (probable !== undefined) {
            const [name, url] = probable;
            console.log(`Found probable chapter : ${name} : ${url}`)
            commit('updateMangaLastChapter', {
                key: mg.key, obj: {
                    lastChapterReadURL: url,
                    lastChapterReadName: name,
                    fromSite: false
                }
            });
            return;
        }

        console.log("No list entry or multiple list entries match the known last chapter. Reset to first chapter");
        commit('updateMangaLastChapter', {
            key: mg.key, obj: {
                lastChapterReadURL: listChaps[listChaps.length - 1][1],
                lastChapterReadName: listChaps[listChaps.length - 1][0],
                fromSite: false
            }
        });
    },

    /**
     * Update all mangas chapters lists
     * @param {*} param0
     * @param {*} force force update if true. If false, check last time manga has been updated and take parameter pause for a week into account
     */
    async updateChaptersLists({ dispatch, commit, getters, state, rootState }, {force} = {force: true}) {
        // avoid overlapping updates
        if(rootState.options.isUpdatingChapterLists) return
        // get sync and convert watchers
        const isConverting = rootState.options.isConverting
        const isSyncEnabled = (rootState.options.syncEnabled || rootState.options.gistSyncEnabled)
        const isSyncing = rootState.options.isSyncing === 1

        // retry later if sync or convert is running
        let timeout = 0;
        if(isSyncEnabled) {
            if(isSyncing) timeout = 10*1000
        }
        if(isConverting) timeout = 60*1000
        if(timeout > 0) {
            utils.debug('Skipped chapter lists update')
            setTimeout(() => {
               actions.updateChaptersLists({ dispatch, commit, getters, state, rootState }, {force} = {force: true})
            }, timeout);
            return
        }
        dispatch("setOption", {key: "isUpdatingChapterLists", value: 1}); // Set watcher
        utils.debug('Starting chapter lists update')
        let tsstopspin;
        if (rootState.options.refreshspin === 1) {
            // spin the badge
            iconHelper.spinIcon();
            tsstopspin = setTimeout(() => {
                iconHelper.stopSpinning();
            }, 1000 * 60 * 2) // stop spinning after two minutes if any error occured
        }

        // update last update ts
        dispatch("setOption", {key: "lastChaptersUpdate", value: Date.now()});

        // refresh all mangas chapters lists
        let mirrorTasks = {}
        let delay = Math.max(rootState.options.waitbetweenupdates, 1) // Force at least 1 second interval

        async function mgupdate(mg, delay) {
            return new Promise(resolve => {
                setTimeout(async () => {
                    await dispatch("refreshLastChapters", mg).then(() => {
                            dispatch('findAndUpdateManga', mg); //save updated manga do not wait
                            amrUpdater.refreshBadgeAndIcon();
                        }).catch(e => {
                            if (e !== ABSTRACT_MANGA_MSG) {
                                console.error(e);
                            }
                        });
                    resolve()
                }, 1000 * delay)
            })
        }

        for (let mg of state.all) {

            // Don't refresh deleted manga
            if (mg.deleted === syncUtils.DELETED) {
                continue
            }

            // we update if it has been forced by the user (through option or timers page) or if we need to update
            if (force || utils.shouldCheckForUpdate(mg, rootState.options)) {

                if (!(mg.mirror in mirrorTasks)) {
                    mirrorTasks[mg.mirror] = []
                }

                mirrorTasks[mg.mirror].push(() => mgupdate(mg, delay))
            }
        }

        let mirrorTasks2 = Object.values(mirrorTasks).map(list => {
            return () => new Promise(async (resolve) => {
                for (let seriesUpdate of list) {
                    await seriesUpdate().catch(utils.debug)
                }
                resolve()
            })
        })

        await Promise.all(mirrorTasks2.map(t => t())).catch(utils.debug)
        dispatch("setOption", {key: "isUpdatingChapterLists", value: 0}); // Unset watcher when done
        utils.debug('Done updating chapter lists')
        if (rootState.options.refreshspin === 1) {
            //stop the spinning
            iconHelper.stopSpinning();
            if (tsstopspin) {
                clearTimeout(tsstopspin)
            }
        }
    },

    /**
     * Change the read top on a manga
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     */
    async markMangaReadTop({ dispatch, commit, getters, rootState }, message, fromSync) {
        let key = utils.mangaKey(message.url, message.mirror, message.language),
            mg = state.all.find(manga => manga.key === key);
        if (mg !== undefined) {
            message.key = key
            commit('setMangaReadTop', message, mg);
            dispatch('findAndUpdateManga', mg);
            if(!fromSync) await syncManager.setToRemote(mg, 'read')
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Change the update top on a manga
     * @param {*} vuex object
     * @param {*} message message contains info on a manga
     */
    async markMangaUpdateTop({ dispatch, commit, getters, rootState }, message, fromSync) {
        let key = utils.mangaKey(message.url, message.mirror, message.language),
            mg = state.all.find(manga => manga.key === key);
        if (mg !== undefined) {
            message.key = key
            commit('setMangaUpdateTop', message);
            dispatch('findAndUpdateManga', mg);
            if(!fromSync) await syncManager.setToRemote(mg, 'update')
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Refresh chapters and update mangas from the message mangas list
     * @param {*} param0
     * @param {{ action: string, mangas: { url: string, mirror: any, language: any }[]}} message
     */
    async refreshMangas({ dispatch }, { manga }) {

        iconHelper.spinIcon();
        try {
            await dispatch("refreshLastChapters", manga)
            await storedb.storeManga(manga);
        } catch (e) {
            console.error(e);
        }
        iconHelper.stopSpinning();
    },
    /**
     * Given its key, deletes a manga from reading list
     * @param {*} param0
     * @param {*} message
     */
    async deleteManga({ dispatch, commit, getters, rootState }, message, fromSync = false) {
        let mg = state.all.find(manga => manga.key === message.key);
        if (mg !== undefined) {
            commit('deleteManga', message.key);
            storedb.deleteManga(message.key);
            if(!fromSync) syncManager.deleteManga(key)
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
        // update native language categories
        dispatch("updateLanguageCategories")
    },
    /**
     * Import sample mangas on user request
     * @param {*} param0
     */
    importSamples({ dispatch }) {
        utils.debug("Importing samples manga in AMR (" + samples.length + " mangas to import)");
        for (let sample of samples) {
            sample.auto = true;
            dispatch("readManga", sample);
        }
    },
    /**
     * Add category
     * @param {*} param0
     * @param {*} obj containing key of the manga and name of the category
     */
    addCategoryToManga({ commit, dispatch }, obj) {
        let mg = state.all.find(manga => manga.key === obj.key);
        commit("addCategoryToManga", obj);
        dispatch('findAndUpdateManga', mg);
    },
    /**
     * Remove category
     * @param {*} param0
     * @param {*} param0
     */
    removeCategoryFromManga({ commit, dispatch }, obj) {
        let mg = state.all.find(manga => manga.key === obj.key);
        commit("removeCategoryFromManga", obj);
        dispatch('findAndUpdateManga', mg);
    },

    /**
     * Updates categories to add language categories if there is mangas in more
     * than one different language
     * @param {*} param0
     */
    updateLanguageCategories({ commit, dispatch, rootState }) {
        let catsLang = rootState.options.categoriesStates.filter(cat => cat.type === 'language')
        let langs = []
        for (let mg of state.all) {
            let l = utils.readLanguage(mg)
            if (l !== "aa" && !langs.includes(l)) langs.push(l) // do not create a category for aa which corresponds to multiple languages possible
        }
        if (catsLang.length > 0 && langs.length <= 1) {
            // remove language categories, only one language
            for (let cat of catsLang) {
                dispatch("removeLanguageCategory", cat.name)
            }
        } else if (langs.length > 1) {
            // add new ones
            for (let l of langs) {
                if (catsLang.findIndex(cat => cat.name === l) === -1) {
                    // add language category l
                    dispatch("addLanguageCategory", l)
                }
            }
            // remove deleted ones
            for (let cat of catsLang) {
                if (!langs.includes(cat.name)) {
                    dispatch("removeLanguageCategory", cat.name)
                }
            }
        }
    },
    toggleMangaSelect({ commit }, mangaKey) {
        commit("onSelectChange", mangaKey);
    },
    clearMangasSelect({ commit }) {
        commit("clearSelection");
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
    /**
     * Change manga display mode
     * @param {*} state
     * @param {*} param1 url of the manga and display mode
     */
    setMangaDisplayMode(state, { key, url, mirror, language, display }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.display = display;
        }
    },
    /**
     * Change manga reader layout mode
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaLayoutMode(state, { key, url, mirror, language, layout }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.layout = layout;
        }
    },
    /**
     * Change manga reader webtoon mode
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaWebtoonMode(state, { key, url, mirror, language, webtoon }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.webtoon = webtoon;
        }
    },
    /**
     * Change manga display name
     * @param {*} state
     * @param {*} param1 url of the manga and layout mode
     */
    setMangaDisplayName(state, { key, displayName }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.displayName = displayName;
        }
    },
    /**
     * Change manga read top
     * @param {*} state
     * @param {*} param1 url of the manga and read top
     */
    setMangaReadTop(state, { key, url, read, mirror, language }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.read = read;
        }
    },
    /**
     * Change manga update top
     * @param {*} state
     * @param {*} param1 url of the manga and update top
     */
    setMangaUpdateTop(state, { key, url, update, mirror, language }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.update = update;
        }
    },
    /**
     * Set upts to now (means : 'last time we found a new chapter is now');
     * @param {*} state
     * @param {*} param1
     */
    updateMangaLastChapTime(state, { key }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) mg.upts = Date.now();
    },
    /**
     * Update the list of chapters of a manga
     * @param {*} state
     * @param {*} param1
     */
    updateMangaListChaps(state, { key, listChaps }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.listChaps = listChaps;
        }
    },
    /**
     * Update the list of languages supported of a manga
     * @param {*} state
     * @param {*} param1
     */
    updateMangaListLangs(state, { key, langs }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.languages = langs;
        }
    },
    /**
     * Update the last read chapter of a manga
     * @param {*} state
     * @param {*} param1
     */
    updateMangaLastChapter(state, { key, obj }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            mg.lastChapterReadURL = obj.lastChapterReadURL;
            mg.lastChapterReadName = obj.lastChapterReadName;
            if (!obj.fromSite) {
                mg.ts = Math.round(Date.now() / 1000);
            }
        }
    },
    /**
     * Change manga informations when a manga is consulted, update some of the properties
     * @param {*} state
     * @param {*} param1 key of the manga and informations
     */
    updateMangaEntryWithInfos(state, { key, obj }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            //if the current manga doesnt have a name, and the request does, then we fix the current name
            if (mg.name === "" && obj.name !== mg.name) {
                mg.name = name;
            }

            //This happens when incoming updates comes from sync
            //if obj.display, obj.read, obj.cats, MAJ this....
            if (obj.display) {
                mg.display = obj.display;
            }
            if (obj.layout) {
                mg.layout = obj.layout;
            }
            if (obj.read) {
                mg.read = obj.read;
            }
            if (obj.update) {
                mg.update = obj.update;
            }
            if (obj.cats !== undefined && obj.cats !== null) {
                if (obj.cats instanceof Array) {
                    mg.cats = obj.cats;
                } else {
                    mg.cats = JSON.parse(obj.cats) || [];
                }
            }
            if (obj.ts && obj.fromSite) {
                mg.ts = obj.ts;
            }
        }
    },
    /**
     * Reset manga reading for a manga to first chapter
     * @param {*} state
     * @param {*} param1 url of the manga
     */
    resetManga(state, { url, mirror, language }) {
        let key = utils.mangaKey(url, mirror, language);
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (mg.listChaps.length > 0) {
                mg.lastChapterReadURL = mg.listChaps[mg.listChaps.length - 1][1];
                mg.lastChapterReadName = mg.listChaps[mg.listChaps.length - 1][0];
                mg.ts = Math.round(Date.now() / 1000)
            }
        }
    },
    /**
     * Save current state (currentChapter, currentScanUrl)
     * @param {*} state
     * @param {*} param1 url of the manga
     */
    saveCurrentState(state, { url, mirror, language, currentChapter, currentScanUrl }) {
        let key = utils.mangaKey(url, mirror, language);
        let mg = state.all.find(manga => manga.key === key)
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
        let mg = new Manga(mgdef);
        let titMg = utils.formatMgName(mg.name);
        let smgs = state.all.filter(manga => utils.formatMgName(manga.name) === titMg)
        // Setting webtoon default
        mg.webtoon = window['AMR_STORE'].state.options.webtoonDefault === 1
        for (let sim of smgs) {
            mg.cats.push(...sim.cats)
            mg.layout = sim.layout
            // if (sim.read === 1) mg.read = 1
            // if (sim.update === 0) mg.update = 0
        }
        mg.cats = [...(new Set(mg.cats))]
        state.all.push(mg);
    },
    /**
     * Create a new manga
     * @param {*} state
     * @param {*} mgdef object containing manga info
     */
    deleteManga(state, key) {
        let mgindex = state.all.findIndex(manga => manga.key === key)
        if (mgindex >= 0) {
            state.all.splice(mgindex, 1);
        }
    },
    /**
     * Links a category to a manga
     * @param {*} state
     * @param {*} param1 containing key of the manga and name of the category to add
     */
    addCategoryToManga(state, {key, name}) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (!mg.cats.includes(name)) {
                mg.cats.push(name);
            }
        }
    },
    /**
     * Unlink a category from a manga
     * @param {*} state
     * @param {*} param1 containing key of the manga and name of the category to remove
     */
    removeCategoryFromManga(state, {key, name}) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (mg.cats.includes(name)) {
                mg.cats.splice(mg.cats.indexOf(name), 1);
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
        Vue.set(state, 'selected', {})
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}
