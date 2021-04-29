import browser from "webextension-polyfill";
import statsEvents from '../amr/stats-events';
import saveAs from 'file-saver';
import JSZip from 'jszip';
import mime from 'mime-db';

class HandleMisc {
    handle(message, sender) {
        switch (message.action) {
            // get options array
            case "opentab":
                browser.tabs.create({
                    "url": message.url
                });
                return Promise.resolve();
            case "mirrorInfos":
                let mirror = window['AMR_STORE'].state.mirrors.all.find(mir => mir.mirrorName === message.name)
                return Promise.resolve({ // can't send a vuex object through js instances on Firefox --> convert
                    activated: mirror.activated,
                    domains: mirror.domains,
                    home: mirror.home,
                    languages: mirror.languages,
                    mirrorIcon: mirror.mirrorIcon,
                    mirrorName: mirror.mirrorName
                });
            case "reloadStats":
                return Promise.resolve(statsEvents.reloadStats())
            case "DownloadAMR":
                return this.DownloadAMR(message)
            case "DownloadChapter":
                return this.DownloadChapter(message)
        }
    }

    async DownloadChapter(message) {
        let urls = message.urls
        let zip = new JSZip();
        let name = message.seriesName + ' - ' + message.chapterName
        await Promise.all(urls.map(async (url,int) =>{
            let data = await fetch(url,message.requestOptions).then(data => data.blob())
            console.log('hi')
            let imgData = new File([data], 'filename.jpg');
            return zip.file(int+'.'+mime[data.type].extensions[0], imgData,  {binary:true});
        }));
        let content = await zip.generateAsync({type:'blob'})
        saveAs(content, name);
        return Promise.resolve()
    }
    async DownloadAMR(message) {
        let url = 'https://release.allmangasreader.com/all-mangas-reader-latest.crx';
        let filename = 'all-mangas-reader-latest.zip'
        if(message.beta) {
            url = 'https://release.allmangasreader.com/all-mangas-reader-beta-latest.crx';
            filename = 'all-mangas-reader-beta-latest.zip'
        }
        return fetch(url).then(data => saveAs(data.blob(), filename))
    }
}
export default (new HandleMisc)