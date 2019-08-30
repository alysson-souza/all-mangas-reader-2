import Axios from 'axios';
import browser from "webextension-polyfill";
import mirrorsImpl from '../amr/mirrors-impl';
import store from '../store';
import * as utils from '../amr/utils';
import storedb from '../amr/storedb';

/** Scripts to inject in pages containing mangas */
const contentScripts = [
    '/lib/jquery.min.js',
    '/lib/jquery.scrollTo.min.js',
    '/lib/jquery.modal.min.js',
    '/content/back.js'
];
/** CSS to inject in pages containing mangas */
const contentCss = [
    '/content/content.css',
    '/lib/jquery.modal.min.css'
];

/** Scripts to inject in pages containing mangas for new reader */
const contentScriptsV2 = [
    '/lib/jquery.min.js',
    '/reader/init-reading.js'
];

class HandleManga {
    handle(message, sender) {
        let key;
        if (message.url) key = utils.mangaKey(message.url, message.mirror, message.language);
        switch (message.action) {
            case "mangaExists":
                return Promise.resolve(
                    store.state.mangas.all.find(manga => manga.key === key) !== undefined
                );
            case "mangaInfos":
                let mg = store.state.mangas.all.find(manga => manga.key === key)
                if (mg !== undefined) {
                    return Promise.resolve({
                        read: mg.read, /* Read top */
                        display: mg.display, /* Display mode of the old reader */
                        layout: mg.layout, /* Layout for the new reader */
                        lastchapter: mg.lastChapterReadURL, /* last read chapter (the most advanced one) */
                        currentChapter: mg.currentChapter, /* last read chapter, last chapter page opened */
                        currentScanUrl: mg.currentScanUrl /* last viewed page in currentChapter */
                    });
                } else {
                    return Promise.resolve();
                }
            case "saveCurrentState":
                return store.dispatch('saveCurrentState', message);
            case "readManga":
                //count number of chapters read
                let nb = localStorage["nb_read"] ? parseInt(localStorage["nb_read"]) : 1
                localStorage["nb_read"] = "" + (nb + 1);
                utils.debug("Read manga " + message.url);
                // call store method to update reading list appropriately
                return store.dispatch('readManga', message);
            case "deleteManga":
                utils.debug("Delete manga key " + key);
                return store.dispatch('deleteManga', {key: key});
            case "getNextChapterImages", "getChapterData": //returns boolean telling if url is a chapter page, infos from page and list of images for prefetch of next chapter in content script
                return this.getChapterData(message);
            case "markReadTop":
                return store.dispatch('markMangaReadTop', message);
            case "setDisplayMode":
                return store.dispatch('setMangaDisplayMode', message);
            case "setLayoutMode":
                return store.dispatch('setMangaLayoutMode', message);
            case "setMangaChapter":
                return store.dispatch('resetManga', message) // reset reading to first chapter
                    .then(() => store.dispatch('readManga', message)); // set reading to current chapter
            case "importSamples":
                return store.dispatch("importSamples");
            case "updateChaptersLists":
                // updates all mangas lists (do it in background if called from popup because it requires jQuery)
                return store.dispatch("updateChaptersLists"); // update is forced by default (mangas are updated even if chapters has been found recently (less than a week ago) and the pause for a week option is checked) but is done manually by the user (this case is called from options page or for timers page)
            case "searchList":
                return this.searchList(message);
            case "getListChaps":
                let mgch = store.state.mangas.all.find(mg => mg.key === key);
                if (mgch !== undefined) {
                    return Promise.resolve(mgch.listChaps);
                } else {
                    return Promise.resolve();
                }
            case "loadListChaps": 
                return this.loadListChaps(message)
            case "importMangas": 
                return this.importMangas(message)
        }
    }

    /**
     * Loads chapters list
     * @param {*} message 
     */
    async loadListChaps(message) {
        let impl = await mirrorsImpl.getImpl(message.mirror);
        let lst = await impl.getListChaps(message.url)
        return Promise.resolve(lst);
    }

    /**
     * Search mangas on a mirror from search phrase
     * @param {*} message 
     */
    async searchList(message) {
        return new Promise(async (resolve, reject) => {
            let impl = await mirrorsImpl.getImpl(message.mirror);
            // check if mirror can list all mangas
            if (impl && impl.canListFullMangas) {
                // check if mirror list is in local db and filter
                let list = await storedb.getListOfMangaForMirror(message.mirror)
                if (list && list.length > 0) {
                    // filter entries on search phrase
                    resolve(this.resultSearchFromArray(
                        this.filterSearchList(list, message.search), 
                        message.mirror));
                } else {
                    // retrieve from website
                    let mgs = await this.searchListRemote(message.search, impl);
                    // store result
                    storedb.storeListOfMangaForMirror(message.mirror, mgs);
                    // return filtered results
                    resolve(this.resultSearchFromArray(
                        this.filterSearchList(mgs, message.search), 
                        message.mirror));
                }
            } else {
                // let website search 
                resolve(this.resultSearchFromArray(
                    await this.searchListRemote(message.search, impl), 
                    message.mirror));
            }
        });
    }
    /**
     * Convert array of array (standard result from implementation) in proper result
     * @param {*} list 
     * @param {*} mirror 
     */
    resultSearchFromArray(list, mirror) {
        return list.map(arr => {
            return {
                url: arr[1],
                name: arr[0],
                mirror: mirror
            }
        })
    }
    /**
     * Return entries matching the search phrase from a list of results
     * @param {*} list 
     * @param {*} search 
     */
    filterSearchList(list, search) {
        return list.filter(arr => utils.formatMgName(arr[0]).indexOf(utils.formatMgName(search)) !== -1);
    }
    /**
     * Call search function from remote website
     */
    async searchListRemote(search, impl) {
        return new Promise(async (resolve, reject) => {
            let res = await impl.getMangaList(search)
            resolve(res);
        });
    }

    async getImplementation(mir) {
        let impl;
        let abstract;
        // Load mirror implementation from repo (try next repo if previous fail)
        for (let repo of store.state.options["impl_repositories"]) {
            let url = repo + mir.jsFile;
            if (url.indexOf("localhost") > 0) url += "?ts=" + Date.now();
            impl = await Axios.get(url).catch(() => { }); // ignore error, jump to next repo
            if (impl) {
                // test if abstract
                if (mir.abstract !== undefined) {
                    let abs = store.state.mirrors.abstracts.find(abs => abs.mirrorName === mir.abstract)
                    url = repo + abs.jsFile;
                    if (url.indexOf("localhost") > 0) url += "?ts=" + Date.now();
                    abstract = await Axios.get(url).catch(() => { }); // ignore error, jump to next repo
                }
                break;
            }
        }
        return abstract !== undefined ? abstract.data + impl.data : impl.data
    }
    /**
     * Test if the url matches a mirror implementation. 
     * If so, inject content script to transform the page and the mirror implementation inside the tab
     * @param {*} url 
     * @param {*} tabId 
     */
    async matchUrlAndLoadScripts(url, tabId) {
        const mir = utils.currentPageMatch(url)
        if (mir === null) return Promise.resolve(null)

        if (!localStorage["oldreader"]) {
            // check if we need to load preload (it could be annoying to have preload on each pages of the website)
            // websites which provide a chapter_url regexp will have their chapters with a preload
            let dopreload = false
            if (mir.chapter_url) {
                var parts = /\/(.*)\/(.*)/.exec(mir.chapter_url);
                var chaprx = new RegExp(parts[1], parts[2]);
                if (chaprx.test("/" + utils.afterHostURL(url))) dopreload = true
            }
            if (dopreload) {
                // Load amr preload
                let loading = []
                loading.push(browser.tabs.insertCSS(tabId, { file: "/reader/pre-loader.css" }))
                let bgcolor = "#424242"
                if (store.state.options.darkreader === 0) bgcolor = "white"
                loading.push(browser.tabs.executeScript(
                    tabId, 
                    { code: `
                        let amr_icon_url = '${browser.extension.getURL('/icons/icon_128.png')}';
                        let cover = document.createElement("div")
                        cover.id = "amr-loading-cover"
                        cover.style.backgroundColor = "${bgcolor}"

                        let img = document.createElement("img")
                        img.src = amr_icon_url;
                        cover.appendChild(img)

                        document.body.appendChild(cover)
                        setTimeout(() => {
                            try {cover.parentNode.remove(cover)} catch(e) {}
                        }, 5000)
                    `}))
                Promise.all(loading)
            }
        }
        let impl = await this.getImplementation(mir)
        if (impl) {
            if (localStorage["oldreader"]) {
                // Inject css in matched tab
                for (let css of contentCss) {
                    await browser.tabs.insertCSS(tabId, { file: css });
                }
                // Inject content scripts in matched tab
                for (let script of contentScripts) {
                    await browser.tabs.executeScript(tabId, { file: script });
                }
            } else {
                // Inject content scripts in matched tab
                for (let script of contentScriptsV2) {
                    await browser.tabs.executeScript(tabId, { file: script });
                }
            }
            // Inject mirror implementation (through a function called in the implementation and existing in back.js)
            await browser.tabs.executeScript(tabId, { code: impl });
        }
        return Promise.resolve(utils.serializeVuexObject(mir)); // doing that because content script is not vue aware, the reactive vuex object needs to be converted to POJSO
    }
    /**
     * Send an event to the tab telling that url has been changed. If it's done by AMR, nothing to do, if it's inner website navigation, load amr
     * @param {*} url 
     * @param {*} tabId 
     */
    async sendPushState(url, tabId) {
        browser.tabs
          .executeScript(tabId, { code: "if (typeof window['onPushState'] === 'function') window['onPushState']();" })
          .catch(utils.debug)
    }
    /**
     * Return the list of images urls from a chapter
     * @param {*} message 
     */
    async getChapterData(message) {
        return Axios.get(message.url)
            .then(resp => {
                return new Promise((resolve, reject) => {
                    var div = document.createElement("iframe");
                    div.style.display = "none";
                    var id = "mangaNextChap";
                    var i = 0;
                    while ($("#" + id + i).length > 0) {
                        i++;
                    }
                    id = id + i;
                    $(div).attr("id", id);
                    document.body.appendChild(div);
                    // was $(document.getElementById(id).contentWindow.document).ready(...); but ready method was removed from jQuery 3.x --> do it the js way
                    let ldoc = document.getElementById(id).contentWindow.document;
                    ldoc.documentElement.innerHTML = resp.data;
                    let readyCall = async () => {
                        // loads the implementation code
                        let impl = await mirrorsImpl.getImpl(message.mirrorName);

                        // Check if this is a chapter page
                        let isChapter = impl.isCurrentPageAChapterPage(
                            document.getElementById(id).contentWindow.document, 
                            message.url)
                        let infos, imagesUrl = []
                        if (isChapter) {
                            try {
                                // Retrieve informations relative to current chapter / manga read
                                infos = await impl.getInformationsFromCurrentPage(
                                    document.getElementById(id).contentWindow.document, 
                                    message.url)
                                    
                                // retrieve images to load
                                imagesUrl = await impl.getListImages(
                                    document.getElementById(id).contentWindow.document, 
                                    message.url);
                            } catch (e) {
                                console.error("Error while loading infos and images from url " + message.url)
                                console.error(e)
                            }
                        }
                        let title = document.getElementById(id).contentWindow.document.title
                        $("#" + id).remove();
                        resolve({
                            isChapter: isChapter,
                            infos: infos,
                            images: imagesUrl,
                            title: title
                        });
                    }
                    if (ldoc.readyState === "complete" ||
                        (ldoc.readyState !== "loading" && !ldoc.documentElement.doScroll)) {
                        readyCall();
                    } else {
                        ldoc.addEventListener("DOMContentLoaded", readyCall);
                    }
                });
            })
            .catch((e) => {
                console.error("error while loading images from chapter " + message.url);
                console.error(e);
                return Promise.resolve({
                    images: null
                });
            });
    }
    /**
     * Imports a list of mangas (only the long async part is in there)
     * @param {*} message 
     */
    async importMangas(message) {
        let importcat = message.importcat
        let imps = message.imports
        if (imps.mangas && imps.mangas.length > 0) {
            // add default category if inexistant
            if (importcat !== "") {
                let cats = store.state.options.categoriesStates;
                if (-1 === cats.findIndex(cat => cat.name === importcat)) {
                    store.dispatch("addCategory", importcat);
                }
            }

            let readall = [];
            let firstChapToImport = true;
            for (let mg of imps.mangas) {
                // convert manga to something matching readManga requirements
                let readmg = {
                    mirror: mg.m,
                    name: mg.n,
                    url: mg.u
                };
                if (mg.l) readmg.lastChapterReadURL = mg.l;
                if (mg.r) readmg.read = mg.r;
                if (mg.p) readmg.update = mg.p;
                if (mg.d) readmg.display = mg.d;
                if (mg.y) readmg.layout = mg.y;
                if (mg.c) readmg.cats = mg.c;
                if (mg.g) readmg.language = mg.g;
                // add default category if specified
                if (importcat !== "") {
                    if (readmg.cats && readmg.cats.length > 0)
                        readmg.cats.push(importcat);
                    else readmg.cats = [importcat];
                }
                readmg.action = "readManga";

                let mgimport = Promise.resolve(
                    store.dispatch('readManga', readmg)
                .catch(e => e));
                if (store.state.options.waitbetweenupdates === 0) {
                    if (store.state.options.savebandwidth === 1) {
                        await mgimport;
                    } else {
                        readall.push(mgimport);
                    }
                } else {
                    if (firstChapToImport) {
                        await mgimport;
                        firstChapToImport = false
                    } else {
                        await new Promise(resolve => {
                            setTimeout(async () => {
                                await mgimport;
                                resolve()
                            }, 1000 * store.state.options.waitbetweenupdates)
                        })
                    }
                }
            }
            if (store.state.options.savebandwidth !== 1) {
                // read all mangas
                await Promise.all(readall);
            }
        }
    }
}

export default (new HandleManga)
