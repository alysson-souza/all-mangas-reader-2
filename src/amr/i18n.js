import browser from "webextension-polyfill";

/**
 * To reduce code size of i18n
 * @param {*} message 
 * @param {*} args 
 */
export default function(message, ...args) {
    return browser.i18n.getMessage(message, [...args]);
}