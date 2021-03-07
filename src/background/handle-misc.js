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
            case "DownloadChapter":
                return this.DownloadChapter(message)
        }
    }

    async DownloadChapter(message) {
    let urls = message.urls
    let zip = new JSZip();
    let name = message.name
    await Promise.all(urls.map(async (url,int) =>{
        let data = await fetch(url).then(data => data.blob())
        console.log('hi')
        let imgData = new File([data], 'filename.jpg');
        return zip.file(int+'.'+mime[data.type].extensions[0], imgData,  {binary:true});
    }));
    let content = await zip.generateAsync({type:'blob'})
    saveAs(content, name);
    return Promise.resolve()
    }
}
export default (new HandleMisc)