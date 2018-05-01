import store from '../store';

/**
 * This class sends tracking information or statistical purposes
 * All tracking information are used to improve manga reading knowledge and are anonymous
 */
class StatsEvents {
    constructor() {
        window['_paq'] = window['_paq'] || [];
        _paq.push(['trackPageView', this.getCurPage()]);
        (function() {
            var u="https://matomo.allmangasreader.com/";
            _paq.push(['setTrackerUrl', u+'piwik.php']);
            _paq.push(['setSiteId', '1']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
        })();
    }
    getCurPage() {
        let lp = window.location.href.lastIndexOf("/");
        return window.location.href.substring(lp);
    }
    trackEvent(category, action, label) {
        try {
            _paq.push(['trackEvent', category, action, label]);
        } catch (e) {
            if (store.state.options.debug === 1) {
                console.error("Error while recording statistics : ")
                console.error(e)
            }
        }
    }
    trackResetManga(mg) {
        this.trackEvent('ResetManga', mg.mirror, mg.name);
    }
    trackAddManga(mg) {
        this.trackEvent('AddManga', mg.mirror, mg.name);
    }
    trackDeleteManga(mg) {
        this.trackEvent('DeleteManga', mg.mirror, mg.name);
    }
    trackReadManga(mg) {
        this.trackEvent('ReadManga', mg.mirror, mg.name);
    }
    trackReadMangaChapter(mg) {
        this.trackEvent('ReadMangaChapter', mg.name, mg.lastChapterReadName);
    }
    trackBeta(version) {
        this.trackEvent('Install', 'Beta Channel', version);
    }
    trackInstall(version) {
        this.trackEvent('Install', version);
    }
    trackActive(granularity, datestr) {
        this.trackEvent('Active', granularity, datestr);
    }
}
export default (new StatsEvents)