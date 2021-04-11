import browser from "webextension-polyfill";
import options from "../state/options";
import mirrorImpl from '../state/mirrorimpl';
import pageData from '../state/pagedata';

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
            url: pageData.state.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            language: pageData.state.language
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
            url: pageData.state.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            lastChapterReadName: pageData.state.currentChapter,
            lastChapterReadURL: pageData.state.currentChapterURL,
            name: pageData.state.name,
            language: pageData.state.language
        });
    }
    /**
     * Mark current chapter as latest read in reading list
     */
    async markAsLatest() {
        return await browser.runtime.sendMessage({
            action: "setMangaChapter",
            url: pageData.state.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            lastChapterReadName: pageData.state.currentChapter,
            lastChapterReadURL: pageData.state.currentChapterURL,
            name: pageData.state.name,
            language: pageData.state.language
        })
    }
    /**
     * Change updating mode for this manga (1 : stop updating, 0 : check updates)
     */
    async markReadTop(nTop) {
        return await browser.runtime.sendMessage({
            action: "markReadTop",
            url: pageData.state.currentMangaURL,
            read: nTop,
            updatesamemangas: true,
            language: pageData.state.language
        })
    }
    /**
     * Remove the current manga from reading list
     */
    async deleteManga() {
        return await browser.runtime.sendMessage({
            action: "deleteManga",
            url: pageData.state.currentMangaURL,
            mirror: mirrorImpl.get().mirrorName,
            language: pageData.state.language
        })
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
    /** Set an option value */
    async saveOption(key, value) {
        return await browser.runtime.sendMessage({action: "save_option", key: key, value: value})
    }
}
export default (new Util)
