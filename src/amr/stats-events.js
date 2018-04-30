import store from '../store';

class StatsEvents {
    constructor() {
        window.dataLayer = window.dataLayer || [];
        this.gtag('js', new Date());
        this.gtag('config', 'UA-118453067-1');
    }
    gtag() {
        dataLayer.push(arguments);
    }
    trackEvent(category, action, label) {
        try {
            this.gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
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