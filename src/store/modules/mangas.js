import storedb from '../../amr/storedb'
import Manga from '../../amr/manga'
import mirrorsImpl from '../../amr/mirrors-impl';
import notifications from '../../amr/notifications';
import statsEvents from '../../amr/stats-events';
import * as utils from "../../amr/utils";
import samples from "../../amr/samples";
import amrUpdater from '../../amr/amr-updater';
import iconHelper from '../../amr/icon-helper';

/**
 *  initial state of the mangas module
 */
const state = {
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
     * Return true is there is unread chapters in manga list
     */
    hasNewMangas: (state) => {
        for (let mg of state.all) {
            if (mg.listChaps.length > 0) {
                var lastUrl = mg.listChaps[0][1];
                if (lastUrl != mg.lastChapterReadURL && mg.read == 0) {
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
                var lastUrl = mg.listChaps[0][1];
                if (lastUrl != mg.lastChapterReadURL && mg.read == 0) {
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
     * Update a manga in the store
     * @param {*} param0 
     * @param {*} manga 
     */
    async updateManga({ dispatch, commit }, manga) {
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
     * Change manga display mode
     * @param {*} vuex object 
     * @param {*} message containing url of the manga and new display mode
     */
    async setMangaDisplayMode({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url);
        commit('setMangaDisplayMode', message);
        dispatch('updateManga', state.all.find(manga => manga.key === key));
    },
    /**
     * Reset manga reading for a manga to first chapter
     * @param {*} vuex object 
     * @param {*} message containing url of the manga
     */
    async resetManga({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url);
        commit('resetManga', message);
        let mg = state.all.find(manga => manga.key === key);
        dispatch('updateManga', mg);
        statsEvents.trackResetManga(mg);
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Read a manga : update latest read chapter if the current chapter is more recent than the previous one
     * @param {*} vuex object 
     * @param {*} message containing infos about the manga read
     */
    async readManga({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url);
        let mg = state.all.find(manga => manga.key === key);
        if (mg === undefined) {
            utils.debug("readManga of an unlisted manga --> create it");
            commit('createManga', message);
            mg = state.all.find(manga => manga.key === key);
            try {
                await dispatch("refreshLastChapters", message);
            } catch (e) { console.error(e) } // ignore error if manga list can not be loaded --> save the manga
            utils.debug("saving new manga to database");
            dispatch('updateManga', mg);
            if (!message.auto) statsEvents.trackAddManga(mg);
        } else {
            try {
                await dispatch("consultManga", message);
            } catch (e) { console.error(e) } // ignore error if manga list can't be updated
            dispatch('updateManga', mg);
            statsEvents.trackReadManga(mg);
            statsEvents.trackReadMangaChapter(mg);
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Get list of chapters for a manga
     * @param {*} param0 
     * @param {*} param1 
     */
    async getMangaListOfChapters({ dispatch, commit, getters }, manga) {
        return new Promise(async (resolve, reject) => {
            utils.debug("getMangaListOfChapters : get implementation of " + manga.mirror);
            let impl = await mirrorsImpl.getImpl(manga.mirror);
            //New chapter is not in chapters list --> Reload chapter list
            if (impl !== null) {
                utils.debug("getMangaListOfChapters : implementation found, get list of chapters for manga " + manga.name + " key " + manga.key);
                impl.getListChaps(manga.url, manga.name, manga, function (lst) {
                    resolve(lst);
                });
            } else {
                reject();
            }
        });
    },

    /**
     * Called when a manga entry is consulted
     * Returns a Promise
     * @param {*} vuex object 
     * @param {*} message message contains info on a manga and flag fromSite
     */
    async consultManga({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url),
            posOld = -1,
            posNew = -1,
            isNew = false,
            mg = state.all.find(manga => manga.key === key);

        for (let i = 0; i < mg.listChaps.length; i++) {
            if (mg.listChaps[i][1] === mg.lastChapterReadURL) posOld = i;
            if (mg.listChaps[i][1] === message.lastChapterReadURL) posNew = i;
        }

        commit('updateMangaEntryWithInfos', { key: mg.key, obj: message });

        return new Promise(async (resolve, reject) => {
            if (posNew === -1) {
                if (mg.update === 1) {
                    try {
                        let listChaps = await dispatch("getMangaListOfChapters", mg)
                        if (listChaps.length > 0) {
                            commit('updateMangaListChaps', { key: mg.key, listChaps: listChaps });
                            for (let i = 0; i < listChaps.length; i++) {
                                if (listChaps[i][1] === mg.lastChapterReadURL) posOld = i;
                                if (listChaps[i][1] === message.lastChapterReadURL) posNew = i;
                            }
                            if (posNew !== -1 && (message.fromSite || (posNew < posOld || posOld === -1))) {
                                commit('updateMangaLastChapter', { key: mg.key, obj: message });
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
                }
                resolve();
            }
        });
    },

    /**
     * Check if there is new chapters on a manga entry
     * Display a notification if so
     * Returns a promise
     * @param {*} vuex object 
     * @param {*} message message contains info on a manga
     */
    async refreshLastChapters({ dispatch, commit, getters }, message) {
        let key = utils.mangaKey(message.url),
            mg = state.all.find(manga => manga.key === key);
        if (mg.update === 1) {
            return new Promise(async (resolve, reject) => {
                let hasBeenTimeout = false,
                    timeOutRefresh = setTimeout(function () {
                        hasBeenTimeout = true;
                        console.error("Refreshing " + mg.key + " has been timeout... seems unreachable...");
                        reject(mg);
                    }, 60000);
                try {
                    utils.debug("waiting for manga list of chapters for " + mg.name + " on " + mg.mirror)
                    let listChaps = await dispatch("getMangaListOfChapters", mg)
                    utils.debug(listChaps.length + " chapters found for " + mg.name + " on " + mg.mirror)
                    clearTimeout(timeOutRefresh);
                    if (listChaps.length > 0) {
                        let oldLastChap = (typeof mg.listChaps[0] === 'object' ? mg.listChaps[0][1] : undefined),
                            newLastChap;
                        commit('updateMangaListChaps', { key: mg.key, listChaps: listChaps });
                        newLastChap = mg.listChaps[0][1];
                        // if oldLastChap === undefined --> new manga added --> no notifications (Issue #40)
                        if ((newLastChap !== oldLastChap) && (oldLastChap !== undefined)) {
                            notifications.notifyNewChapter(mg);
                            commit('updateMangaLastChapTime', { key: mg.key });
                        }
                        if (!mg.lastChapterReadURL) { // no last chapter read (imported from samples or from search)
                            commit('updateMangaLastChapter', {key: mg.key, obj : {
                                lastChapterReadURL: listChaps[listChaps.length - 1][1],
                                lastChapterReadName: listChaps[listChaps.length - 1][0],
                                fromSite: false
                            }});
                        }
                    }

                    if (!hasBeenTimeout) {
                        resolve(mg);
                    }
                } catch (e) {
                    // implementation was not loaded
                    console.error("Impossible to load mirror implementation " + mg.mirror);
                    console.error(e);
                    reject(mg);
                }
            });
        } else {
            return Promise.resolve(mg);
        }
    },

    /**
     * Update all mangas chapters lists
     * @param {*} param0 
     * @param {*} force force update if true. If false, check last time manga has been updated and take parameter pause for a week into account 
     */
    async updateChaptersLists({ dispatch, commit, getters, state, rootState }, {force} = {force: true}) {
        if (rootState.options.refreshspin === 1) {
            // spin the badge
            iconHelper.spinIcon();
        }

        // update last update ts
        dispatch("setOption", {key: "lastChaptersUpdate", value: Date.now()});

        // refresh all mangas chapters lists
        let refchaps = [];
        for (let mg of state.all) {
            let doupdate = true;
            // check if we are in a pause case (if pause for a week option is checked, we check updates only during 2 days (one before and one after) around each 7 days after last chapter found)
            if (!force && rootState.options.stopupdateforaweek === 1 && mg.upts) {
                let day = 1000 * 60 * 60 * 24
                let week = day * 7
                doupdate = false
                // number of weeks since last update
                let nbweeks = Math.floor((Date.now() - mg.upts) / week) + 1;
                // check if we are in the gap between minus one day to plus one day compared to nbweeks weeks after last update
                if (mg.upts + week * nbweeks - day <= Date.now() && Date.now() <= mg.upts + week * nbweeks + day) {
                    doupdate = true;
                }
                if (doupdate) {
                    utils.debug("Manga " + mg.key + " has been updated less than " + nbweeks + " ago. We are in the minus one day to plus one day gap for this week number. We update the chapters list.")
                } else {
                    utils.debug("Manga " + mg.key + " has been updated less than " + nbweeks + " week ago. We are NOT in the minus one day to plus one day gap for this week number. We do not update the chapters list.")
                }
            }
            // we update if it has been forced by the user (through option or timers page) or if we need to update
            if (force || doupdate) {
                // we catch the reject from the promise to prevent the Promise.all to fail due to a rejected promise. Thanks to that, Promise.all will wait that each manga is refreshed, even if it does not work
                let mgupdate = Promise.resolve(
                    dispatch("refreshLastChapters", {url: mg.url})
                        .then(() => {
                            //save updated manga do not wait
                            dispatch('updateManga', mg);
                            //update badges and icon state
                            amrUpdater.refreshBadgeAndIcon();
                        })
                        .catch(e => e));
                if (rootState.options.savebandwidth === 1) {
                    await mgupdate;
                } else {
                    refchaps.push(mgupdate);
                }
            }
        }
        if (rootState.options.savebandwidth !== 1) {
            await Promise.all(refchaps); // wait for everything to be updated
        }

        if (rootState.options.refreshspin === 1) {
            //stop the spinning
            iconHelper.stopSpinning();
        }
    },
    
    /**
     * Change the read top on a manga
     * @param {*} vuex object 
     * @param {*} message message contains info on a manga
     */
    async markMangaReadTop({ dispatch, commit, getters, rootState }, message) {
        let key = utils.mangaKey(message.url),
            mg = state.all.find(manga => manga.key === key);
        if (mg !== undefined) {
            commit('setMangaReadTop', message);
            dispatch('updateManga', mg);
            statsEvents.trackReadTop(mg);
            if (message.updatesamemangas && rootState.options.groupmgs === 1) {
                let titMg = utils.formatMgName(mg.name);
                let smgs = state.all.filter(manga => utils.formatMgName(manga.name) === titMg)
                for (let smg of smgs) {
                    commit('setMangaReadTop', { url: smg.url, read: message.read });
                    dispatch('updateManga', smg);
                }
            }
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Change the update top on a manga
     * @param {*} vuex object 
     * @param {*} message message contains info on a manga
     */
    async markMangaUpdateTop({ dispatch, commit, getters, rootState }, message) {
        let key = utils.mangaKey(message.url),
            mg = state.all.find(manga => manga.key === key);
        if (mg !== undefined) {
            commit('setMangaUpdateTop', message);
            dispatch('updateManga', mg);
            if (message.updatesamemangas && rootState.options.groupmgs === 1) {
                let titMg = utils.formatMgName(mg.name);
                let smgs = state.all.filter(manga => utils.formatMgName(manga.name) === titMg)
                for (let smg of smgs) {
                    commit('setMangaUpdateTop', { url: smg.url, update: message.update });
                    dispatch('updateManga', smg);
                }
            }
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
    },
    /**
     * Given its key, deletes a manga from reading list
     * @param {*} param0 
     * @param {*} message 
     */
    async deleteManga({ dispatch, commit, getters, rootState }, message) {
        let mg = state.all.find(manga => manga.key === message.key);
        if (mg !== undefined) {
            commit('deleteManga', message.key);
            storedb.deleteManga(message.key);
        }
        // refresh badge
        amrUpdater.refreshBadgeAndIcon();
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
        dispatch('updateManga', mg);
    },
    /**
     * Remove category
     * @param {*} param0 
     * @param {*} param0 
     */
    removeCategoryFromManga({ commit, dispatch }, obj) {
        let mg = state.all.find(manga => manga.key === obj.key);
        commit("removeCategoryFromManga", obj);
        dispatch('updateManga', mg);
    },
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
    setMangaDisplayMode(state, { url, display }) {
        let key = utils.mangaKey(url);
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) mg.display = display;
    },
    /**
     * Change manga read top
     * @param {*} state 
     * @param {*} param1 url of the manga and read top
     */
    setMangaReadTop(state, { url, read }) {
        let key = utils.mangaKey(url),
            mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) mg.read = read;
    },
    /**
     * Change manga update top
     * @param {*} state 
     * @param {*} param1 url of the manga and update top
     */
    setMangaUpdateTop(state, { url, update }) {
        let key = utils.mangaKey(url),
            mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) mg.update = update;
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
        if (mg !== undefined) mg.listChaps = listChaps;
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
    resetManga(state, { url }) {
        let key = utils.mangaKey(url);
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) {
            if (mg.listChaps.length > 0) {
                mg.lastChapterReadURL = mg.listChaps[mg.listChaps.length - 1][1];
                mg.lastChapterReadName = mg.listChaps[mg.listChaps.length - 1][0];
            }
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
        for (let sim of smgs) {
            if (sim.read == 1) {
                mg.read = 1;
                break;
            }
            if (sim.update == 0) {
                mg.update = 0;
                break;
            }
        }
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
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}