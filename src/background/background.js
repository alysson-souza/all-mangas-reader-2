import Handler from './handler';
import IconHelper from '../amr/icon-helper';
import store from '../store';
import * as utils from '../amr/utils';
import amrUpdater from '../amr/amr-updater';
import amrInit from '../amr/amr-init';

// Blue icon while loading
IconHelper.setBlueIcon();

// Initialize store
(async () => {
    /**
     * Initialize AMR options from locaStorage
     */
    utils.debug("Initialize options");
    await store.dispatch('initOptions');
    
    /**
     * Initialize mirrors list in store from DB or repo
     */
    utils.debug("Initialize mirrors");
    await store.dispatch('initMirrors');

    /**
     * Initialize manga list in store from DB
     */
    utils.debug("Initialize mangas");
    await store.dispatch('initMangasFromDB');

    /**
     * Initiliaze extension versioning
     */
    amrInit()
    
    // set icon and badge
    amrUpdater.refreshBadgeAndIcon();
    /**
     * If option update chapters lists on startup --> do it
     */
    if (store.state.options.checkmgstart === 1) {
        store.dispatch("updateChaptersLists", {force: false}); // force to false to avoid updating if not necessary
    }

    // Starts message handling
    utils.debug("Initialize message handler");
    Handler.handle();

    // Check if we need to refresh chapters lists, mirrors lists and launch automatic checker
    amrUpdater.load();

    /**
     * The function below increments the reading of each manga in the list from a chapter each 2 seconds
     * You can observe that when you open the popup, these modifications are propagated in real time to the popup
     * These modifications are going down to the database and propagated to all store instances (open pages of the extension)
     */
    /*
    function setNextChapterAuto() {
        for (let mg of store.state.mangas.all) {
            let cur = mg.listChaps.findIndex(arr => arr[1] === mg.lastChapterReadURL);
            if (cur == 1) {
                store.dispatch('resetManga', {url: mg.url})
            } else {
                store.dispatch('readManga', {
                    "url": mg.url,
                    "mirror": mg.mirror,
                    "lastChapterReadName": mg.listChaps[cur - 1][0],
                    "lastChapterReadURL": mg.listChaps[cur - 1][1],
                    "name": mg.name
                })
            }
        }
        setTimeout(setNextChapterAuto, 2000);
    }
    setTimeout(setNextChapterAuto, 2000);*/
})()