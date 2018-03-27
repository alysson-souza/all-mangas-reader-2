class StatsEvents {
    trackResetManga(mg) {
        try {
            _gaq.push(['_trackEvent', 'ResetManga', mg.mirror, mg.name]);
        } catch (e) { }
    }
    trackAddManga(mg) {
        try {
            _gaq.push(['_trackEvent', 'AddManga', mg.mirror, mg.name]);
        } catch (e) { }
    }
    trackReadManga(mg) {
        try {
            _gaq.push(['_trackEvent', 'ReadManga', mg.mirror, mg.name]);
        } catch (e) { }
    }
    trackReadMangaChapter(mg) {
        try {
            _gaq.push(['_trackEvent', 'ReadMangaChapter', mg.name, mg.lastChapterReadName]);
        } catch (e) { }
    }
    trackReadTop(mg) {
        try {
            if (mg.read == 1) {
                _gaq.push(['_trackEvent', 'SetReadState', mg.mirror, mg.name]);
            } else {
                _gaq.push(['_trackEvent', 'ReleaseReadState', mg.mirror, mg.name]);
            }
        } catch (e) { }
    }
}
export default (new StatsEvents)