import storedb from '../../amr/storedb'
import Manga from '../../amr/manga'
import mirrorsImpl from '../../amr/mirrors-impl';
import notifications from '../../amr/notifications';
import statsEvents from '../../amr/stats-events';
import * as utils from "../../amr/utils";
import samples from "../../amr/samples";

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
            dispatch("setOption", {key: "updated", value: new Date().getTime()});
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
                        if (mg.lastChapterReadURL === null) {
                            commit('updateMangaLastChapter', {key: mg.key, obj : {
                                lastChapterReadURL: lst[lst.length - 1][1],
                                lastChapterReadName: lst[lst.length - 1][0],
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
                    reject(mg);
                }
            });
        } else {
            return Promise.resolve(mg);
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
            if (message.updatesamemangas && rootState.options.groupmgs == 1) {
                let titMg = utils.formatMgName(mg.name);
                let smgs = state.all.filter(manga => utils.formatMgName(manga.name) === titMg)
                for (let smg of smgs) {
                    commit('setMangaReadTop', { url: smg.url, read: request.read });
                    dispatch('updateManga', smg);
                }
            }
        }
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
     * Set upts to now (means : 'last time we found a new chapter is now');
     * @param {*} state 
     * @param {*} param1 
     */
    updateMangaLastChapTime(state, { key }) {
        let mg = state.all.find(manga => manga.key === key)
        if (mg !== undefined) mg.upts = new Date().getTime();
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
                mg.ts = Math.round((new Date()).getTime() / 1000);
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
    }
}

export default {
    state,
    getters,
    actions,
    mutations
}