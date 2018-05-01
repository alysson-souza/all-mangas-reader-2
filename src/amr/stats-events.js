import store from '../store';

class StatsEvents {
    constructor() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
        
        ga('create', 'UA-118453067-1', 'auto');
        ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
        ga('require', 'displayfeatures');
        ga('send', 'pageview', this.getCurPage());
    }
    getCurPage() {
        let lp = window.location.href.lastIndexOf("/");
        return window.location.href.substring(lp);
    }
    trackEvent(category, action, label) {
        try {
            ga('send', 'event', category, action, label);
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