/**
 * All Mangas Reader V2
 * Content script included in every website to test if we need to include AMR 
 */
import browser from "webextension-polyfill";

(() => {
    browser.runtime.sendMessage({ action: "pagematchurls", url: window.location.href });
})();