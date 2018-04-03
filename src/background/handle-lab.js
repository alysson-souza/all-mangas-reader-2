import mirrorsImpl from "../amr/mirrors-impl";
import Axios from 'axios';

/**
 * Runs implementation functions for the lab
 */
class HandleLab {
    handle(message, sender) {
        if ("lab" === message.action) {
            return this.runFunction(message);
        }
    }
    async runFunction(message) {
        // load implementation for mirror
        return new Promise(async (resolve, reject) => {
            let impl = await mirrorsImpl.getImpl(message.mirror);
            if (message.torun === "search") {
                impl.getMangaList(message.search, function (mirrorName, res) {
                    if (mirrorName !== message.mirror) {
                        reject("Mirror name returned is wrong !");
                    } else {
                        resolve(res);
                    }
                });
            }
            else if (message.torun === "chapters") {
                impl.getListChaps(message.url, /*Manga name*/null, /*Manga object*/null, 
                    function (lst) {
                        resolve(lst);
                    }
                );
            }
            else if (message.torun === "loadChapterAndDo") {
                try {
                    let res = this.loadChapterAndDo(message, impl);
                    resolve(res);
                } catch (e) {
                    reject(e);
                }
            }
        });
    }
    async loadChapterAndDo(message, impl) {
        return Axios.get(message.url)
            .then(resp => {
                return new Promise((resolve, reject) => {
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
                    document.getElementById(id).contentWindow.document.documentElement.innerHTML = resp.data;
                    $(document.getElementById(id).contentWindow.document).ready(() => {
                        //once the iframe is ready
                        if (message.task === "containScans") {
                            resolve(
                                impl.isCurrentPageAChapterPage(document.getElementById(id).contentWindow.document, message.url)
                            );
                        } else if (message.task === "informations") {
                            impl.getInformationsFromCurrentPage(
                                document.getElementById(id).contentWindow.document, message.url,
                                function(infos) {
                                    resolve(infos);
                                }
                            );
                        } else if (message.task === "listScans") {
                            let imagesUrl = impl.getListImages(document.getElementById(id).contentWindow.document, message.url);
                            resolve({
                                images: imagesUrl
                            });
                        }
                        $("#" + id).remove();
                    });
                });
            })
            .catch((e) => {
                return Promise.reject(e);
            });
    }
}
export default (new HandleLab)