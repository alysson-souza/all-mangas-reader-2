import 'regenerator-runtime/runtime';
import Axios from 'axios';
import browser from "webextension-polyfill";
import mirrorsImpl from '../amr/mirrors-impl';
import store from '../store';
import * as utils from '../amr/utils';

/** Scripts to inject in pages containing mangas */
const contentScripts = [
    'lib/jquery.min.js', 
    'lib/jquery.scrollTo.min.js', 
    'lib/jquery.modal.min.js', 
    'content/back.js'
];
/** CSS to inject in pages containing mangas */
const contentCss = ['content/content.css'];

class HandleManga {
    handle(message, sender) {
        let key;
        if (message.url) key = utils.mangaKey(message.url);
        switch (message.action) {
            case "pagematchurls":
                // content script included, test if a mirror match the page and load AMR in tab
                return this.matchUrlAndLoadScripts(message.url, sender.tab.id);
            case "mangaInfos":
                let mg = store.state.mangas.all.find(manga => manga.key === message.key)
                if (mg !== undefined) {
                    return Promise.resolve({
                        read: mg.read,
                        display: mg.display
                    });
                } else {
                    return Promise.resolve(null);
                }
            case "readManga":
                utils.debug("Read manga " + message.url);
                return store.dispatch('readManga', message);
            case "getNextChapterImages": //returns list of images for prefetch of next chapter in content script
                return this.getChapterImages(message); 
            case "markReadTop":
                return store.dispatch('markMangaReadTop', message);
            case "setDisplayMode":
                return store.dispatch('setMangaDisplayMode', message);
            case "setMangaChapter":
                return store.dispatch('resetManga', message) // reset reading to first chapter
                    .then(() => store.dispatch('readManga', message)); // set reading to current chapter
            case "importSamples":
                return store.dispatch("importSamples");
            case "updateChaptersLists":
                // updates all mangas lists (do it in background if called from popup because it requires jQuery)
                return store.dispatch("updateChaptersLists");
        }
    }

    /**
     * Test if the url matches a mirror implementation. 
     * If so, inject content script to transform the page and the mirror implementation inside the tab
     * @param {*} url 
     * @param {*} tabId 
     */
    async matchUrlAndLoadScripts(url, tabId) {
        const mir = utils.currentPageMatch(url);
        if (mir === null) return Promise.resolve(null);
        let impl;
        // Load mirror implementation from repo (try next repo if previous fail)
        for (let repo of store.state.options["impl_repositories"]) {
            let url = repo + mir.jsFile;
            if (url.indexOf("localhost") > 0) url += "?ts=" + new Date().getTime();
            impl = await Axios.get(url).catch(() => { }); // ignore error, jump to next repo
            if (impl) break;
        }
        if (impl) {
            // Inject css in matched tab
            for (let css of contentCss) {
                await browser.tabs.insertCSS(tabId, { file: css });
            }
            // Inject content scripts in matched tab
            for (let script of contentScripts) {
                await browser.tabs.executeScript(tabId, { file: script });
            }
            // Inject mirror implementation (through a function called in the implementation and existing in back.js)
            await browser.tabs.executeScript(tabId, { code: impl.data });
        }
        return Promise.resolve(utils.serializeVuexObject(mir)); // doing that because content script is not vue aware, the reactive vuex object needs to be converted to POJSO
    }

    /**
     * Return the list of images urls from a chapter
     * @param {*} message 
     */
    async getChapterImages(message) {
        return Axios.get(message.url)
            .then(resp => {
                return new Promise((resolve, reject) => {
                    var div = document.createElement("iframe");
                    div.style.display = "none";
                    var id = "mangaNextChap";
                    var i = 0;
                    while ($("#" + id + i).size() > 0) {
                        i++;
                    }
                    id = id + i;
                    $(div).attr("id", id);
                    document.body.appendChild(div);
                    document.getElementById(id).contentWindow.document.documentElement.innerHTML = resp.data;
                    $(document.getElementById(id).contentWindow.document).ready(async () => {
                        let impl = await mirrorsImpl.getImpl(message.mirrorName);
                        var imagesUrl = impl.getListImages(document.getElementById(id).contentWindow.document, message.url);
                        resolve({
                            images: imagesUrl
                        });
                        $("#" + id).remove();
                    });
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
}

export default (new HandleManga)