import browser from "webextension-polyfill";
import statsEvents from '../amr/stats-events';
import mimedb from 'mime-db';
import streamSaver from 'streamsaver'
import 'streamsaver/examples/zip-stream'

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
        let name = message.seriesName + ' - ' + message.chapterName
        const fileStream = streamSaver.createWriteStream(name)
        const readableZipStream = new ZIP({
            start(ctrl) {},
            async pull(ctrl) {
                let url = urls.shift()
                const res = await fetch(url)
                const stream = () => res.body
                let ext = 'jpg'
                const mime = res.headers.get('content-type')
                if(mime.indexOf('image') > -1) {
                    if(mimedb[mime].extensions) {
                        ext = mimedb[mime].extensions[0]
                    }
                } else {
                    const match = url.match(/(\.\w{2,4})(?![^?])/)
                    if(match) {
                        ext = match[1].replace('.', '')
                    }
                }
                const name = (urls.length+1)+'.'+ext
                ctrl.enqueue({name, stream})
                if(urls.length === 0) ctrl.close()
            }
        })

        if(window.WritableStream && readableZipStream.pipeTo) {
            return await readableZipStream.pipeTo(fileStream);
        }
        this.pump(fileStream.getWriter(), readableZipStream.getReader())
    }
    async DownloadAMR(message) {
        let url = 'https://release.allmangasreader.com/all-mangas-reader-latest.crx';
        let filename = 'all-mangas-reader-latest.zip'
        if(message.beta) {
            url = 'https://release.allmangasreader.com/all-mangas-reader-beta-latest.crx';
            filename = 'all-mangas-reader-beta-latest.zip'
        }
        const res = await fetch(url)
        const fileStream = streamSaver.createWriteStream(filename, {
            size: res.headers.get('content-length')
        })
        const readableStream = res.body
        if(window.WritableStream && readableStream.pipeTo) {
            return await readableStream.pipeTo(fileStream);
        }
        return this.pump(fileStream.getWriter(), res.body.getReader())
    }
    async pump(writer, reader) {
        const res = await reader.read()
        if(res.done) return await writer.close()
        await writer.write(res.value)
        return this.pump(writer, reader)
    }
}
export default (new HandleMisc)