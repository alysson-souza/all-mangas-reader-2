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
    commit(key, payload) {
        return this.vuexStore.commit(key, payload)
    }
    syncLocal(mangaUpdates) {
        const storeUpdates = mangaUpdates.map(manga => {
            if (manga.deleted === syncUtils.DELETED) {
                return this.vuexStore.dispatch('deleteManga', { key: manga.key })
            }

            // fromSite 1 ensure ts and last chapters read are updated
            return this.vuexStore.dispatch('readManga', { ...manga, fromSite: 1, isSync: 1 })
        })

        return Promise.all(storeUpdates);
    }
}

export const createLocalStorage = (vuexStore) => new LocalStorage(storedb, vuexStore)

