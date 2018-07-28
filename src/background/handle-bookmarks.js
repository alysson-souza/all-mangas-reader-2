import store from '../store';
import * as utils from '../amr/utils';

class HandleBookmarks {
    handle(message, sender) {
        switch (message.action) {
            case "getBookmarkNote":
                let noteBM = this.getBookmark(message);
                return Promise.resolve({
                    isBooked: noteBM.booked,
                    note: noteBM.note,
                    scanSrc: noteBM.scanSrc
                });
            case "deleteBookmark":
                this.deleteBookmark(message);
                return Promise.resolve({});
            case "addUpdateBookmark":
                this.addBookmark(message);
                return Promise.resolve({});
            case "createContextMenu": //TODO
                return Promise.resolve({});
        }
    }

    /**
     * Find a bookmark from store
     * @param {*} obj 
     */
    findBookmark(obj) {
        let key = utils.mangaKey(obj.chapUrl) + (obj.scanUrl ? "_" + utils.mangaKey(obj.scanUrl): "")
        return store.state.bookmarks.all.find(bookmark => bookmark.key === key)
    }
    /**
     * Retrieve a stored bookmark
     * @param {*} obj 
     */
    getBookmark(obj) {
        let bm = this.findBookmark(obj);
        if (bm !== undefined) {
            if (obj.type === "chapter") {
                return {
                    booked : true,
                    note : bm.note
                }
            } else {
                return {
                    booked : true,
                    note : bm.note,
                    scanSrc : obj.scanUrl
                }
            }
        }
        return {
            booked : false,
            note : ""
        }
    }

    /**
     * Adds a bookmark in store
     * @param {*} obj 
     */
    addBookmark(obj) {
        let bm = this.findBookmark(obj);
        let tosave = {
            mirror : obj.mirror,
            url : obj.url,
            chapUrl : obj.chapUrl,
            type : obj.type,
            name : obj.name,
            chapName : obj.chapName,
            scanUrl : obj.scanUrl,
            scanName : obj.scanName,
            note : obj.note
        };
        if (bm === undefined) {
            // adds a new bookmark
            store.dispatch("createBookmark", tosave)
        } else {
            // update bookmark note
            store.dispatch("updateBookmarkNote", tosave);
        }
    }

    /**
     * Deletes a bookmark from store
     * @param {*} obj 
     */
    deleteBookmark(obj) {
        // adds a new bookmark
        store.dispatch("deleteBookmark", {
            chapUrl : obj.chapUrl,
            scanUrl : obj.scanUrl
        })
    }
}
export default (new HandleBookmarks)