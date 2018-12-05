import browser from "webextension-polyfill";
import options from "../content/options";
import mirrorImpl from '../content/mirrorimpl';
import pageData from '../content/pagedata';

class Util {
    removeProtocol(url) {
        if (url.indexOf("https") == 0) return url.substring(6);
        else if (url.indexOf("http") == 0) return url.substring(5);
        return url;
    }
    debug(message) {
        if (options.debug === 1) console.log(message);
    }
    /**
     * Return the path from a url (used for chapters url)
     */
    chapPath(chap_url) {
        if (!chap_url) return chap_url;
        return chap_url.split("/").slice(3).join("/")//new URL(chap_url).pathname
    }
    matchChapUrl(chap, tomatch) {
        return (this.chapPath(chap) === this.chapPath(tomatch))
    }
    /**
     * Returns true if manga is in reading list
     */
    async mangaExists() {
        return await browser.runtime.sendMessage({
            action: "mangaExists", 
            url: pageData.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            language: pageData.language
        })
    }
    /**
     * Consult manga, update reading list state to take the current chapter into account
     * Can add the manga to the list if addauto options or update reading status
     */
    async consultManga(force = false) {
        if (!force && options.addauto !== 1) { // check if option "Automatically add manga to list" is unchecked
            // check if manga is already in list
            let exists = await this.mangaExists()
            // if not, we do not add the manga to the list (else, we continue, so reading progress is updated)
            if (!exists) return;
        }
        await browser.runtime.sendMessage({
            action: "readManga",
            url: pageData.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            lastChapterReadName: pageData.currentChapter,
            lastChapterReadURL: pageData.currentChapterURL,
            name: pageData.name,
            language: pageData.language
        });
    }
    /** Clear current document selection */
    clearSelection() {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if(window.getSelection) {
            var sel = window.getSelection();
            sel.removeAllRanges();
        }
    }
    /** Get a value from localStorage */
    async getStorage(key) {
        return await browser.runtime.sendMessage({action: "get_storage", key: key})
    }
    /** Set a value in localStorage */
    async setStorage(key, value) {
        return await browser.runtime.sendMessage({action: "set_storage", key: key, value: value})
    }
}
export default (new Util)