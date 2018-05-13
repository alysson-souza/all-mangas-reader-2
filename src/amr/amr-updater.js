import store from '../store';
import iconHelper from './icon-helper';

/**
 * This class is used to update periodically manga chapters lists and mirrors list
 */
class Updater {
    /**
     * Initialize refresh checkers
     */
    load() {
        this.checkChaptersUpdates();
        this.checkMirrorsUpdates();
    }
    /**
     * Check if we need to refresh chapters lists according to frequency every minutes
     */
    checkChaptersUpdates() {
        let lastUpdt = store.state.options.lastChaptersUpdate;
        let frequency = store.state.options.updatechap;
        if (lastUpdt + frequency < Date.now()) {
            // time to refresh !
            store.dispatch("updateChaptersLists", {force: false}); // force to false to avoid updating if not necessary
        }
        setTimeout(this.checkChaptersUpdates.bind(this), 60 * 1000); // check every minutes
    }
    /**
     * Check if we need to refresh mirrors lists according to frequency every minutes
     */
    checkMirrorsUpdates() {
        let lastUpdt = store.state.options.lastMirrorsUpdate;
        let frequency = store.state.options.updatemg;
        if (lastUpdt + frequency < Date.now()) {
            // time to refresh !
            store.dispatch("updateMirrorsLists");
        }
        setTimeout(this.checkMirrorsUpdates.bind(this), 60 * 1000); // check every minutes
    }

    /**
     * Refresh badge and icon 
     */
    refreshBadgeAndIcon() {
        let nbnew = store.getters.nbNewMangas;
        if (store.state.options.nocount == 1) {
            iconHelper.resetBadge(); // remove badge
            // display a grey badge if no new mangas
            if (nbnew > 0) iconHelper.resetIcon();
            else iconHelper.setBWIcon();
        } else {
            iconHelper.resetIcon();
            if (store.state.options.displayzero === 1) {
                iconHelper.updateBadge(nbnew);
            } else {
                if (nbnew == 0) iconHelper.resetBadge();
                else iconHelper.updateBadge(nbnew);
            }
        }
    }
}

export default (new Updater)