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
        })(this);
    }
}

export default (new MirrorsHelper)

