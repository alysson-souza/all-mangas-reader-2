import store from '../store';

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
            case "deleteBookmark": //TODO
                return Promise.resolve({});
            case "addUpdateBookmark": //TODO
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
        return store.state.bookmarks.all.find(
            bm => 
                obj.mirror === bm.mirror && 
                obj.url === bm.url && 
                obj.chapUrl === bm.chapUrl && 
                obj.type === bm.type &&
                (obj.type === "chapter" ||
                    (obj.scanUrl === bm.scanUrl || encodeURI(obj.scanUrl) === bm.scanUrl)
                )
            )
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
        if (bm === undefined) {
            // adds a new bookmark
            store.dispatch("createBookmark", {
                mirror : obj.mirror,
                url : obj.url,
                chapUrl : obj.chapUrl,
                type : obj.type,
                name : obj.name,
                chapName : obj.chapName,
                scanUrl : obj.scanUrl,
                scanName : obj.scanName,
                note : obj.note
            })
        } else {
            // update bookmark note
            store.dispatch("updateBookmarkNote", obj.note);
        }
    }
}
export default (new HandleBookmarks)