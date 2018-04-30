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
    trackReadManga(mg) {
        this.trackEvent('ReadManga', mg.mirror, mg.name);
    }
    trackReadMangaChapter(mg) {
        this.trackEvent('ReadMangaChapter', mg.name, mg.lastChapterReadName);
    }
    trackReadTop(mg) {
        if (mg.read == 1) {
            this.trackEvent('SetReadState', mg.mirror, mg.name);
        } else {
            this.trackEvent('ReleaseReadState', mg.mirror, mg.name);
        }
    }
}
export default (new StatsEvents)