import browser from "webextension-polyfill";
import * as domutils from '../amr/domutils';
import CryptoJS from 'crypto-js'

/**
 * Mirrors implementation helper
 */
class MirrorsHelper {
    constructor() {
        (function () {
            /**
             * Helper for implementations.
             * Exist from version 2.0.2.140 and V4 from mirrors
             */
            window["amr"] = window["amr"] || {};

            /**
             * Loads a page and return an element in which page is loaded
             * options :
             *  - nocache: true to prevent page to be loaded from cache
             *  - preventimages: true to prevent images in page to be loaded
             *  - post: true to send message using POST
             *  - dataType: valid jQuery ajax dataType
             *  - data: object to send in accordance with its dataType
             * @param {*} url
             * @param {*} options
             */
            amr.loadPage = function(url, options) {
                return new Promise((resolve, reject) => {
                    let ajaxObj = {url : url}
                    let headers = {}
                    if (options && options.nocache) {
                        headers["Cache-Control"] = "no-cache"
                        headers["Pragma"] = "no-cache"
                    }
                    if (options && options.post) {
                        ajaxObj.method = 'POST'
                    }
                    if (options && options.dataType !== undefined) {
                        ajaxObj.dataType = options.dataType
                    }
                    if (options && options.data !== undefined) {
                        ajaxObj.data = options.data
                    }
                    if (options && options.headers !== undefined) {
                        Object.assign(headers, options.headers)
                    }
                    if (options && options.crossdomain) {
                        ajaxObj.crossDomain = true
                    }
                    ajaxObj.beforeSend = function (xhr) {
                        for (let dt in headers) {
                            xhr.setRequestHeader(dt, headers[dt]);
                        }
                    }
                    ajaxObj.error = (jqXhr, error, e) => reject(error)
                    ajaxObj.success = (data) => {
                        let toparse = data
                        if (options && options.preventimages) {
                            toparse = data.replace(/<img/gi, '<noload')
                        }
                        let htmlDocument = domutils.sanitizeDom(toparse)
                        resolve(htmlDocument)
                    }
                    /**
                     * In Firefox, cookies and referer are not sent properly when using xhr from content script. Override the xhr provider to use the build in right xhr
                     * in Firefox and fallback to XMLHttpRequest on other browsers
                     * @see https://discourse.mozilla.org/t/webextension-xmlhttprequest-issues-no-cookies-or-referrer-solved/11224/17
                     */
                    ajaxObj.xhr = () => {
                        try {
                            return XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
                        }
                        catch (evt) {
                            return new XMLHttpRequest();
                        }
                    }
                    $.ajax(ajaxObj)
                });
            }
            /**
             * Loads a url and get JSON
             * options :
             *  - nocache: true to prevent cache
             *  - post: true to send message using POST
             *  - dataType: valid jQuery ajax dataType
             *  - data: object to send in accordance with its dataType
             * @param {*} url
             * @param {*} options
             */
            amr.loadJson = function(url, options) {
                return new Promise((resolve, reject) => {
                    let ajaxObj = {url : url}
                    let headers = {}
                    if (options && options.post) {
                        ajaxObj.method = 'POST'
                    }
                    if (options && options.nocache) {
                        ajaxObj.cache = false
                    }
                    if (options && options.dataType !== undefined) {
                        ajaxObj.dataType = options.dataType
                    }
                    if (options && options.data !== undefined) {
                        ajaxObj.data = options.data
                    }
                    if (options && options.headers !== undefined) {
                        Object.assign(headers, options.headers)
                    }
                    ajaxObj.beforeSend = function (xhr) {
                        for (let dt in headers) {
                            xhr.setRequestHeader(dt, headers[dt]);
                        }
                    }
                    let contenttype = true
                    if (options && options.nocontenttype) {
                        contenttype = false
                    }
                    if (contenttype) ajaxObj.contentType = "application/json";
                    ajaxObj.error = (jqXhr, error, e) => reject(error)
                    ajaxObj.success = (data) => {
                        if (typeof data === "string") {
                            try {
                                resolve(JSON.parse(data));
                            } catch (e) {
                                resolve(data);
                            }
                        } else {
                            resolve(data);
                        }
                    }
                    /**
                     * In Firefox, cookies and referer are not sent properly when using xhr from content script. Override the xhr provider to use the build in right xhr
                     * in Firefox and fallback to XMLHttpRequest on other browsers
                     * @see https://discourse.mozilla.org/t/webextension-xmlhttprequest-issues-no-cookies-or-referrer-solved/11224/17
                     */
                    ajaxObj.xhr = () => {
                        try {
                            return XPCNativeWrapper(new window.wrappedJSObject.XMLHttpRequest());
                        }
                        catch (evt) {
                            return new XMLHttpRequest();
                        }
                    }
                    $.ajax(ajaxObj)
                });
            }
            /**
             * Get a variable value from a script tag, parse it manually
             * @param {*} varname
             */
            amr.getVariable = function(varname, doc) {
                return amr.getVariableFromScript(varname, $("#__amr_text_dom__", doc).text())
            }

            /**
             * Get a variable value from a snippet
             */
            amr.getVariableFromScript = function(varname, sc) {
                let res = undefined
                let rx = new RegExp("(var|let|const)\\s+" + varname + "\\s*=\\s*([0-9]+|\\\"|\\\'|\\\{|\\\[|JSON\\s*\\\.\\s*parse\\\()", "gmi")
                let match = rx.exec(sc)
                if (match) {
                    let ind = match.index
                    let varchar = match[2]
                    let start = sc.indexOf(varchar, ind) + 1
                    if (varchar.match(/[0-9]+/)) {
                        res = Number(varchar)
                    } else {
                        if (varchar === '"' || varchar === "'") { // var is a string
                            let found = false,
                                curpos = start,
                                prevbs = false;
                            while (!found) {
                                let c = sc.charAt(curpos++)
                                if (c === varchar && !prevbs) {
                                    found = true
                                    break
                                }
                                prevbs = c === "\\"
                            }
                            res = sc.substring(start, curpos - 1)
                        } else { // if (varchar === '[' || varchar === "{" || varchar === 'JSON.parse(') { // var is object or array or parsable
                            let curpos = start + varchar.length - 1,
                                openings = 1,
                                opening = varchar === 'JSON.parse(' ? '(' : varchar,
                                opposite = varchar === '[' ? ']' : (varchar === '{' ? '}' : ')')
                            while (openings > 0 && curpos < sc.length) {
                                let c = sc.charAt(curpos++)
                                if (c === opening) openings++
                                if (c === opposite) openings--
                            }
                            let toparse = sc.substring(start - 1 + varchar.length - 1, curpos)
                            if (toparse.match(/atob\s*\(/g)) { // if data to parse is encoded using btoa
                                let m = /(?:'|").*(?:'|")/g.exec(toparse)
                                toparse = atob(m[0].substring(1, m[0].length - 1))
                            }
                            res = JSON.parse(toparse)
                        }
                    }
                }
                return res
            }
            /**
             * Set a cookie on a domain
             */
            amr.setCookie = async function(setCookieObj) {
                await browser.cookies.set(setCookieObj)
            }

            amr.getOption = function(option) {
                return window['AMR_STORE'].state.options[option] || ''
            }

            amr.crypto = CryptoJS
        })(this);
    }
}

export default (new MirrorsHelper)
