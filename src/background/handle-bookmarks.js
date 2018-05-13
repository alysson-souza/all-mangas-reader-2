class HandleBookmarks {
    handle(message, sender) {
        switch (message.action) {
            // hide navigation bar --> keeps its state
            case "getBookmarkNote":
                return Promise.resolve({}); //TODO
            case "deleteBookmark": //TODO
                return Promise.resolve({});
            case "addUpdateBookmark": //TODO
                return Promise.resolve({});
            case "createContextMenu": //TODO
                return Promise.resolve({});
        }
    }
}
export default (new HandleBookmarks)