import mirrorsImpl from "../amr/mirrors-impl";
import Axios from 'axios';

/**
 * Runs implementation functions for the lab
 */
class HandleLab {
    handle(message, sender) {
        if ("lab" === message.action) {
            if (message.url && message.url.indexOf("//") === 0) 
                message.url = "http:" + message.url;
            return this.runFunction(message);
        }
    }
    async runFunction(message) {
        // load implementation for mirror
        return new Promise(async (resolve, reject) => {
            try {
                let impl = await mirrorsImpl.getImpl(message.mirror);
                if (message.torun === "search") {
                    let res = await impl.getMangaList(message.search)
                    resolve(res);
                }
                else if (message.torun === "chapters") {
                    let lst = await impl.getListChaps(message.url)
                    resolve(lst);
                }
                else if (message.torun === "loadChapterAndDo") {
                    let res = this.loadChapterAndDo(message, impl);
                    resolve(res);
                } 
                else if (message.torun === "getScanUrl") {
                    let img = new Image();
                    await impl.getImageFromPageAndWrite(message.url, img);
                    (function wait() {
                        if (img.src && img.src != "") {
                            return resolve(img.src);
                        }
                        setTimeout(wait, 100);
                    })()
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    async loadChapterAndDo(message, impl) {
        return Axios.get(message.url)
            .then(resp => {
                return new Promise((resolve, reject) => {
                    try {
                        // load the chapter in an iframe
                        var div = document.createElement("iframe");
                        div.style.display = "none";
                        var id = "mangaChap";
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
                            //once the iframe is ready
                            if (message.task === "containScans") {
                                resolve(
                                    impl.isCurrentPageAChapterPage(document.getElementById(id).contentWindow.document, message.url)
                                );
                            } else if (message.task === "informations") {
                                let infos = await impl.getInformationsFromCurrentPage(
                                    document.getElementById(id).contentWindow.document, 
                                    message.url
                                );
                                resolve(infos);
                            } else if (message.task === "listScans") {
                                let imagesUrl = await impl.getListImages(document.getElementById(id).contentWindow.document, message.url);
                                resolve(imagesUrl);
                            } else if (message.task === "wherenav") {
                                impl.doSomethingBeforeWritingScans(document.getElementById(id).contentWindow.document, message.url);
                                let where = impl.whereDoIWriteScans(document.getElementById(id).contentWindow.document, message.url);
                                resolve(where.length);
                            }
                            $("#" + id).remove();
                        }
                        if (ldoc.readyState === "complete" ||
                            (ldoc.readyState !== "loading" && !ldoc.documentElement.doScroll)) {
                            readyCall();
                        } else {
                            ldoc.addEventListener("DOMContentLoaded", readyCall);
                        }
                    } catch (e) {
                        reject(e);
                    }
                });
            })
            .catch((e) => {
                return Promise.reject(e);
            });
    }
}
export default (new HandleLab)