import storedb from "../storedb"
import * as syncUtils from "../sync/utils"

class LocalStorage {
    /**
     * @param {StoreDB} indexedDb
     * @param dispatch
     */
    constructor(indexedDb, dispatch) {
        this.indexedDb = indexedDb
        this.dispatch = dispatch
        this.requests = 0
    }

    async loadMangaList() {
        return this.indexedDb.getMangaList()
    }
    dispatch(key, payload) {
        return this.dispatch(key, payload, true)
    }
    syncLocal(manga) {
        this.requests = this.requests + 1
        setTimeout(() => {
            this.requests = this.requests - 1
            if (manga.delete === syncUtils.DELETED) {
                return this.dispatch("deleteManga", { key: manga.key }, true)
            }
            return this.dispatch("readManga", { ...manga, fromSite: 1, isSync: 1 })
        }, this.requests * 500)
    }
}

export const createLocalStorage = dispatch => new LocalStorage(storedb, dispatch)
