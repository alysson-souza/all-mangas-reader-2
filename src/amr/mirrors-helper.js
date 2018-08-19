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
                    if (options && options.nocache) {
                        ajaxObj.beforeSend = function (xhr) {
                            xhr.setRequestHeader("Cache-Control", "no-cache");
                            xhr.setRequestHeader("Pragma", "no-cache");
                        }
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
                    ajaxObj.error = (jqXhr, error, e) => reject(error)
                    ajaxObj.success = (data) => {
                        var div = document.createElement("div");
                        if (options && options.preventimages) {
                            div.innerHTML = data.replace(/<img/gi, '<noload')
                        } else {
                            div.innerHTML = data
                        }
                        resolve(div);
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
                    ajaxObj.contentType = "application/json";
                    ajaxObj.error = (jqXhr, error, e) => reject(error)
                    ajaxObj.success = (data) => {
                        if (typeof data === "string") {
                            resolve(JSON.parse(data));
                        } else {
                            resolve(data);
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
                let res = undefined
                $("script", doc).each(function(i) {
                    let sc = $(this).text()
                    let rx = new RegExp("(var|let|const)\\s" + varname + "\\s=\\s(\\\"|\\\'|\\\{|\\\[)", "gmi")
                    var match = rx.exec(sc)
                    if (match) {
                        let ind = match.index
                        let varchar = match[2]
                        let start = sc.indexOf(varchar, ind) + 1
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
                        } else if (varchar === '[' || varchar === "{") { // var is object or array
                            let curpos = start,
                                openings = 1,
                                opposite = varchar === '[' ? ']' : '}'
                            while (openings > 0) {
                                let c = sc.charAt(curpos++)
                                if (c === varchar) openings++
                                if (c === opposite) openings--
                            }
                            res = JSON.parse(sc.substring(start - 1, curpos))
                        }
                    }
                })
                return res
            }
        })(this);
    }
}

export default (new MirrorsHelper)

