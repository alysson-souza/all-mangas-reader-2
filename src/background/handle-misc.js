import browser from "webextension-polyfill";

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
                return Promise.resolve(/*statsEvents.reloadStats()*/)
            case "DownloadAMR":
                return this.DownloadAMR(message)
        }
    }
    async DownloadAMR(message) {
        let url = 'https://release.allmangasreader.com/all-mangas-reader-latest.crx';
        let filename = navigator.platform === 'Win32' ? 'all-mangas-reader-latest.7z' : 'all-mangas-reader-latest.zip'
        if(message.beta) {
            url = 'https://release.allmangasreader.com/all-mangas-reader-beta-latest.crx';
            filename = navigator.platform === 'Win32' ? 'all-mangas-reader-beta-latest.7z' : 'all-mangas-reader-beta-latest.zip'

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