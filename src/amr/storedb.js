import * as utils from './utils'

/**
 * Class helping to store data in IndexedDb
 * In AMR V1, objects were stored in WebDB. WebDB is deprecated and Mozilla never implemented WebDB in FireFox
 * In AMR V2, objects are stored through IndexedDB.
 * Handle storage of
 *  - mirrors definition,
 *  - mirrors full list of mangas
 *  - mangas reading list
 *  - bookmarked chapters and scans
 */
class StoreDB {
    constructor() {
        this.status = 0; // Not initialized (1 : ready; 2 : error; 3 : initializing)
    }

    /**
     * Initialize db connection
     */
    initDB() {
        this.status = 3;
        this.dbversion = 2;
        this.db = undefined;
        let store = this;
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            }
            if (!window.indexedDB) {
                console.error("Browser does not support IndexedDB. Storage will fail");
                store.status = 2;
                reject();
            }

            let request = window.indexedDB.open("AllMangasReader", this.dbversion);
            request.onerror = function (event) {
                console.error("Impossible to open database All Mangas Reader. Error code : " + event.target.errorCode);
                store.status = 2;
                reject();
            };
            request.onupgradeneeded = function (event) {
                let db = event.target.result;

                /**
                 * Create stores for AMR objects
                 */
                if (!db.objectStoreNames.contains("mirrors")) {
                    db.createObjectStore("mirrors", { keyPath: "mirrorName" });
                }
                if (!db.objectStoreNames.contains("mangalists")) {
                    db.createObjectStore("mangalists", { keyPath: "mirrorName" });
                }
                if (!db.objectStoreNames.contains("mangas")) {
                    db.createObjectStore("mangas", { keyPath: "key" });
                }
                if (!db.objectStoreNames.contains("bookmarks")) {
                    db.createObjectStore("bookmarks", { keyPath: "key" });
                }
            };
            request.onsuccess = function (event) {
                store.db = event.target.result;
                store.status = 1;
                resolve();
            };
        });
    }

    /**
     * Wait for status to stop being 3 (initializing)
     */
    initDone() {
        let store = this;
        return new Promise(function (resolve, reject) {
            (function waitForInit() {
                if (store.status != 3) return resolve();
                setTimeout(waitForInit, 10);
            })();
        });
    }
    /**
     * Check if db has been initialized, if not initialize it
     */
    async checkInit() {
        try {
            if (this.status == 0) await this.initDB();
            if (this.status == 3) await this.initDone();
            if (this.status == 2 || !this.db) return Promise.reject();
            return Promise.resolve();
        }
        catch (e) {
            console.error("Error while initializing IndexedDB");
            console.error(e);
            return Promise.reject();
        }
    }
    /**
     * Stores or update a mirror implementation in db
     * @param {} mirrorObj
     */
    storeWebsite(mirrorObj) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mirrors"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to store mirror " + mirrorObj.mirrorName + ". Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("mirrors");
                    let request = objectStore.put(mirrorObj);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
    }
    /**
     * Get mirrors list from store
     */
    getWebsites() {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mirrors"]);
                    let objectStore = transaction.objectStore("mirrors");
                    let mirrors = [];
                    objectStore.openCursor().onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            mirrors.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            resolve(mirrors);
                        }
                    };
                });
            });
    }

    // Accessors for mangas list (full list of mangas from mirror)
    /**
     * Store a list of mangas for a mirror implementation
     * @param {*} mirror
     * @param {*} list
     */
    storeListOfMangaForMirror(mirror, list) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangalists"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to store mangalists " + mirror + ". Error code : " + event.target.errorCode);
                    };
                    let objectStore = transaction.objectStore("mangalists");
                    let request = objectStore.put({
                        mirrorName: mirror,
                        list: list
                    });
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
    }
    /**
     * Get a list of manga stored from a mirror implementation
     * @param {*} mirror
     */
    getListOfMangaForMirror(mirror) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangalists"]);
                    let objectStore = transaction.objectStore("mangalists");

                    let objectStoreRequest = objectStore.get(mirror);

                    objectStoreRequest.onsuccess = function (event) {
                        let obj = objectStoreRequest.result;
                        resolve(obj ? obj.list : obj);
                    };
                    objectStoreRequest.onerror = function (event) {
                        resolve([]);
                    }
                });
            });
    }
    /**
     * Get how many lists and manga names are stored
     */
    getListsOfMangaStats() {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangalists"]);
                    let objectStore = transaction.objectStore("mangalists");
                    let stat = {nb: 0, nbmangas: 0}
                    objectStore.openCursor().onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            stat.nb++;
                            stat.nbmangas += cursor.value.list.length;
                            cursor.continue();
                        }
                        else {
                            resolve(stat);
                        }
                    };
                });
            });
    }
    /**
     * Clear all stored lists of mangas for mirror implementations
     */
    deleteAllListOfManga() {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangalists"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to clear mangalists. Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("mangalists");
                    let objectStoreRequest = objectStore.clear();
                    objectStoreRequest.onsuccess = function (event) {
                        resolve();
                    };
                });
            });
    }
    // add an entry
    storeManga(manga) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangas"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to store manga " + manga.key + ". Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("mangas");
                    let request = objectStore.put(manga);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
    }
    // deletes an entry
    deleteManga(key) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangas"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to delete manga " + key + ". Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("mangas");
                    let request = objectStore.delete(key);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
    }
    // update an existing entry
    findAndUpdate(manga) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangas"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to store manga " + manga.key + ". Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("mangas");
                    let request = objectStore.get(manga.key);
                    request.onsuccess = function (event) {
                        if(event.target.result) {
                            store.storeManga(manga)
                            resolve(event.target.result)
                        } else {
                            reject("Impossible to update manga "+ manga.key + ". Couldn't find a matching entry")
                        }
                    };
                });
            });   
    }
    /**
     * Return the stored list of manga (reading list)
     */
    getMangaList() {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["mangas"]);
                    let objectStore = transaction.objectStore("mangas");
                    let mangas = [];
                    objectStore.openCursor().onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            mangas.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            resolve(mangas);
                        }
                    };
                });
            });
    }
    /**
     * Store a bookmark entry
     * @param {*} bm {url, type (0: chapter, 1: scan), mgkey, title}
     */
    storeBookmark(bm) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["bookmarks"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to store bookmarks " + bm.url + ". Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("bookmarks");
                    if (!bm.key) {
                        bm.key = utils.mangaKey(bm.chapUrl, bm.mirror) + (bm.scanUrl ? "_" + utils.mangaKey(bm.scanUrl, bm.mirror) : "")
                    }
                    let request = objectStore.put(bm);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
    }
    /**
     * Get all bookmarks
     * @param {*} bm
     */
    getBookmarks() {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["bookmarks"]);
                    let objectStore = transaction.objectStore("bookmarks");
                    let bms = []
                    objectStore.openCursor().onsuccess = function (event) {
                        let cursor = event.target.result;
                        if (cursor) {
                            bms.push(cursor.value);
                            cursor.continue();
                        }
                        else {
                            resolve(bms);
                        }
                    };
                });
            });
    }
    /**
     * Delete a bookmark
     * @param {*} bm
     */
    deleteBookmark(key) {
        let store = this;
        return this.checkInit()
            .then(() => {
                return new Promise((resolve, result) => {
                    let transaction = store.db.transaction(["bookmarks"], "readwrite");

                    transaction.onerror = function (event) {
                        reject("Impossible to delete bookmarks " + key + ". Error code : " + event.target.errorCode);
                    };

                    let objectStore = transaction.objectStore("bookmarks");
                    let request = objectStore.delete(key);
                    request.onsuccess = function (event) {
                        resolve(event.target.result);
                    };
                });
            });
    }
}
export default new StoreDB();
