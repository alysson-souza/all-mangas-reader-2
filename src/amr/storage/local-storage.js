import store from '../../store'
import storedb from '../storedb'

class LocalStorage {

    constructor(indexedDb) {
        this.indexedDb = indexedDb
    }

    async loadMangaList() {
        return this.indexedDb.getMangaList();
    }

    syncLocal(mangaUpdates) {
        const storeUpdates = mangaUpdates.map(manga => {
            // fromSite 1 ensure ts and last chapters read are updated
            if (manga.deleted === 1) {
                return store.dispatch('deleteManga', { key: manga.key })
            }
            return store.dispatch('readManga', { ...manga, fromSite: 1 })
        })

        return Promise.all(storeUpdates);
    }
}


export const createLocalStorage = () => new LocalStorage(storedb)

