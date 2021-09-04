import storedb from '../storedb'
import * as syncUtils from '../sync/utils';

class LocalStorage {

    /**
     * @param {StoreDB} indexedDb
     * @param vuexStore
     */
    constructor(indexedDb, vuexStore) {
        this.indexedDb = indexedDb
        this.vuexStore = vuexStore
    }

    async loadMangaList() {
        return this.indexedDb.getMangaList();
    }
    dispatch(key, payload) {
        return this.vuexStore.dispatch(key, payload, true)
    }
    syncLocal(manga) {
        if(manga.delete === syncUtils.DELETED) {
            return this.vuexStore.dispatch('deleteManga', { key: manga.key }, true)
        }
        return this.vuexStore.dispatch('readManga', { ...manga, fromSite: 1, isSync: 1})
    }
}

export const createLocalStorage = (vuexStore) => new LocalStorage(storedb, vuexStore)

