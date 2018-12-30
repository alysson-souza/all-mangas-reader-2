import store from '../../store'
import storedb from '../storedb'

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

    syncLocal(mangaUpdates) {
        const storeUpdates = mangaUpdates.map(manga => {
            if (manga.deleted === 1) {
                return this.vuexStore.dispatch('deleteManga', { key: manga.key })
            }

            // fromSite 1 ensure ts and last chapters read are updated
            return this.vuexStore.dispatch('readManga', { ...manga, fromSite: 1, isSync: 1 })
        })

        return Promise.all(storeUpdates);
    }
}

export const createLocalStorage = () => new LocalStorage(storedb, store)

