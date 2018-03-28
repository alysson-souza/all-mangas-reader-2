import Handler from './handler';
import IconHelper from './icon-helper';
import store from '../store';
import * as utils from '../amr/utils';

// Initialize store
(async () => {
    // Set blue icon until AMR is loaded
    IconHelper.setBlueIcon();
    // Turn icon back to normal when mirrors loaded
    document.addEventListener("mirrorsLoaded", () => IconHelper.resetIcon());

    /**
     * Initialize AMR options from locaStorage
     */
    utils.debug("Initialize options");
    await store.dispatch('initOptions');

    /**
     * Initialize mirrors list in store from DB
     */
    utils.debug("Initialize mirrors");
    await store.dispatch('initMirrors');

    /**
     * Initialize manga list in store from DB
     */
    utils.debug("Initialize mangas");
    await store.dispatch('initMangasFromDB');

    // Starts message handling
    utils.debug("Initialize message handler");
    Handler.handle();

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