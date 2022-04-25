/**
 * This class sends tracking information or statistical purposes
 * All tracking information are used to improve manga reading knowledge and are anonymous
 */
class StatsEvents {
    constructor() {
        // this.statsLoaded = false
        // window['_paq'] = window['_paq'] || [];
        // _paq.push(['setCustomUrl', this.getAdaptedUrl()]);
        // _paq.push(['trackPageView', this.getCurPage()]);
        // setTimeout(() => {
        //     var u="https://matomo.allmangasreader.com/";
        //     _paq.push(['setTrackerUrl', u+'piwik.php']);
        //     _paq.push(['setSiteId', '1']);
        //     if (window['AMR_STORE'].state.options.allowtracking === 1) {
        //         require("../stats/piwik")
        //         this.statsLoaded = true
        //     }
        // }, 0)
    }
    getCurPage() {
        // let lp = window.location.href.lastIndexOf("/");
        // return window.location.href.substring(lp + 1);
    }
    getAdaptedUrl() {
        return "https://ext.allmangasreader.com/" + this.getCurPage()
    }
    trackEvent(category, action, label) {
        // try {
        //     _paq.push(['trackEvent', category, action, label]);
        // } catch (e) {
        //     if (window['AMR_STORE'].state.options.debug === 1) {
        //         console.error("Error while recording statistics : ")
        //         console.error(e)
        //     }
        // }
    }
    trackReadManga(mg) {
        // this.trackEvent('ReadManga', mg.mirror, mg.name);
    }
    trackInstall(version, isbeta, navigator) {
        // this.trackEvent('Install', version, navigator);
    }
    trackUpdate(version, isbeta, navigator) {
        // this.trackEvent('Update', version, navigator);
    }
    reloadStats() {
        // if (window['AMR_STORE'].state.options.allowtracking && !this.statsLoaded) {
        //     require("../stats/piwik")
        // }
    }
}
export default new StatsEvents()
