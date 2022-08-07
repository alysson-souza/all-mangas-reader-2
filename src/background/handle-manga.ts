import browser from "webextension-polyfill"
import storedb from "../amr/storedb"
import { afterHostURL, formatMangaName, mangaKey, matchDomain, serializeVuexObject } from "../shared/utils"
import * as cheerio from "cheerio"
import { AppManga, AppStore, ChapterData, InfoResult, Mirror, MirrorImplementation } from "../types/common"
import { AppLogger } from "../shared/AppLogger"
import { MirrorLoader } from "../mirrors/MirrorLoader"
import { OptionStorage } from "../shared/OptionStorage"

export class HandleManga {
    constructor(
        private store: AppStore,
        private logger: AppLogger,
        private mirrorLoader: MirrorLoader,
        private optionStorage: OptionStorage
    ) {}

    async handle(message: { key: string; action: string; url: string; mirror?: string }): Promise<unknown> {
        switch (message.action) {
            case "mangaExists": {
                const key = this.getMangaKey(message)
                return Promise.resolve(this.store.state.mangas.all.find(manga => manga.key === key) !== undefined)
            }
            case "mangaInfos": {
                const key = this.getMangaKey(message)
                const mg = this.store.state.mangas.all.find(manga => manga.key === key)
                return mg
                    ? {
                          key: mg.key,
                          read: mg.read /* Read top */,
                          display: mg.display /* Display mode of the old reader */,
                          layout: mg.layout /* Layout for the new reader */,
                          lastchapter: mg.lastChapterReadURL /* last read chapter (the most advanced one) */,
                          currentChapter: mg.currentChapter /* last read chapter, last chapter page opened */,
                          // @TODO seems lieke typo, was "mg.currentScanUrlm"
                          currentScanUrl: mg.currentScanUrl /* last viewed page in currentChapter */,
                          webtoon: mg.webtoon || false /* webtoon mode */,
                          displayName: mg.displayName,
                          zoom: mg.zoom || 100 /* zoom level */
                      }
                    : null
            }
            case "saveCurrentState":
                return this.store.dispatch("saveCurrentState", message)
            case "readManga":
                //count number of chapters read
                const nb = (await this.optionStorage.getKey("nb_read")) ?? 1
                const value = (typeof nb === "string" ? parseInt(nb) : nb) + 1
                await this.optionStorage.setKey("nb_read", value)
                this.logger.debug("Read manga " + message.url)
                // call store method to update reading list appropriately
                return this.store.dispatch("readManga", message)
            case "initMangasFromDB":
                return this.store.dispatch("initMangasFromDB", true)
            case "deleteManga":
                this.logger.debug("Delete manga key " + message.key)
                return this.store.dispatch("deleteManga", { key: message.key })
            //returns boolean telling if url is a chapter page, infos from page and list of images for prefetch of next chapter in content script
            case "getChapterData":
                return this.getChapterData(message)
            case "getImageUrlFromPageUrl":
                return this.getImageUrlFromPageUrl(message)
            case "markMangaReadTop":
                return this.store.dispatch("markMangaReadTop", message)
            case "markMangaUpdateTop":
                return this.store.dispatch("markMangaUpdateTop", message)
            case "setDisplayMode":
                return this.store.dispatch("setMangaDisplayMode", message)
            case "setLayoutMode":
                return this.store.dispatch("setMangaLayoutMode", message)
            case "setWebtoonMode":
                return this.store.dispatch("setMangaWebtoonMode", message)
            case "setZoomMode":
                return this.store.dispatch("setMangaZoomMode", message)
            case "setDisplayName":
                return this.store.dispatch("setMangaDisplayName", message)
            case "setMangaChapter":
                return this.store
                    .dispatch("resetManga", message) // reset reading to first chapter
                    .then(() => this.store.dispatch("readManga", message)) // set reading to current chapter
            case "resetManga":
                return this.store.dispatch("resetManga", { key: this.getMangaKey(message) })
            case "removeCategoryFromManga":
                return this.store.dispatch("removeCategoryFromManga", message)
            case "addCategoryToManga":
                return this.store.dispatch("addCategoryToManga", message)
            case "importSamples":
                return this.store.dispatch("importSamples")
            case "refreshMangas":
                return this.store.dispatch("refreshMangas", message)
            case "updateChaptersLists":
                // updates all mangas lists (do it in background if called from popup because it requires jQuery)
                return this.store.dispatch("updateChaptersLists") // update is forced by default (mangas are updated even if chapters has been found recently (less than a week ago) and the pause for a week option is checked) but is done manually by the user (this case is called from options page or for timers page)
            case "searchList":
                return this.searchList(message)
            case "getListChaps": {
                const key = this.getMangaKey(message)
                let mgch = this.store.state.mangas.all.find(mg => mg.key === key)
                if (mgch !== undefined) {
                    return Promise.resolve(mgch.listChaps)
                } else {
                    return Promise.resolve()
                }
            }
            case "loadListChaps":
                return this.loadListChaps(message)
            case "importMangas":
                return this.importMangas(message)
        }
    }

    getMangaKey(message: any) {
        if (!message.url) {
            return undefined
        }
        return mangaKey({
            url: message.url,
            mirror: message.mirror,
            language: message.language,
            rootState: this.store
        })
    }

    /**
     * Loads chapters list
     * @param {*} message
     */
    async loadListChaps(message) {
        const impl = await this.mirrorLoader.getImpl(message.mirror)
        return impl.getListChaps(message.url)
    }

    /**
     * Search mangas on a mirror from search phrase
     * @param {*} message
     */
    async searchList(message) {
        return new Promise(async resolve => {
            const impl = await this.mirrorLoader.getImpl(message.mirror)
            // check if mirror can list all mangas
            if (impl && impl.canListFullMangas) {
                // check if mirror list is in local db and filter
                const list = (await storedb.getListOfMangaForMirror(message.mirror)) as InfoResult[]
                if (list && list.length > 0) {
                    // filter entries on search phrase
                    resolve(this.resultSearchFromArray(this.filterSearchList(list, message.search), message.mirror))
                } else {
                    // retrieve from website
                    let mgs = await this.searchListRemote(message.search, impl)
                    // store result
                    storedb.storeListOfMangaForMirror(message.mirror, mgs)
                    // return filtered results
                    resolve(this.resultSearchFromArray(this.filterSearchList(mgs, message.search), message.mirror))
                }
            } else {
                // let website search
                resolve(this.resultSearchFromArray(await this.searchListRemote(message.search, impl), message.mirror))
            }
        })
    }
    /**
     * Convert array of array (standard result from implementation) in proper result
     */
    resultSearchFromArray(list: InfoResult[], mirror: Mirror) {
        return list.map(arr => ({ url: arr[1], name: arr[0], mirror: mirror }))
    }
    /**
     * Return entries matching the search phrase from a list of results
     */
    filterSearchList(list: InfoResult[], search: string) {
        return list.filter(arr => formatMangaName(arr[0]).indexOf(formatMangaName(search)) !== -1)
    }
    /**
     * Call search function from remote website
     */
    async searchListRemote(search: string, impl: MirrorImplementation) {
        return impl.getMangaList(search)
    }
    /**
     * wait for Cloudflare browser integrity check to be done
     */
    async waitForCloudflare(tabId: number) {
        if (!(await this.executeCheck(tabId))) {
            return
        }

        return new Promise((resolve, reject) => {
            let tries = 0
            const interval = setInterval(async () => {
                if (!(await this.executeCheck(tabId))) {
                    clearInterval(interval)
                    return resolve(true)
                }
                tries++
                if (tries >= 40) {
                    clearInterval(interval)
                    return reject(new Error("Failed to pass Cloudflare after 40 tries"))
                }
            }, 500)
        })
    }

    async executeCheck(tabId: number) {
        const [first] = await browser.scripting.executeScript({
            target: { tabId },
            func: function () {
                return document.body.innerText
            }
        })

        if (first.error) {
            throw first.error
        }

        return first.result.match(/checking your browser before accessing/gim)
    }

    /**
     * Test if the url matches a mirror implementation.
     * If so, inject content script to transform the page and the mirror implementation inside the tab
     */
    async matchUrlAndLoadScripts(url: string, tabId: number) {
        const mir = this.getMir(url)
        if (mir === null) {
            return mir
        }

        this.logger.debug({
            url,
            tab: tabId,
            mir: mir.domains,
            chapter: mir.chapter_url
        })
        // check if we need to load preload (it could be annoying to have preload on each pages of the website)
        // websites which provide a chapter_url regexp will have their chapters with a preload
        if (mir.chapter_url) {
            const parts = /\/(.*)\/(.*)/.exec(String(mir.chapter_url))
            // @TODO second part is suppose to be options?
            const chaprx = new RegExp(parts[1], parts[2])
            if (!chaprx.test("/" + afterHostURL(url))) {
                console.log("Not matching!", parts)
                return // returns if there is no match
            }
        }

        try {
            // wait for cloudflare browser integrity check if needed
            await this.waitForCloudflare(tabId)
        } catch (e) {
            this.logger.error(e)
            return
        }

        // Load amr preload
        let loading = []
        loading.push(
            browser.scripting.insertCSS({
                target: { tabId },
                files: ["/reader/pre-loader.css"]
            })
        )

        const bgColor = this.store.state.options.darkreader === 0 ? "white" : "#424242"
        const iconUrl = browser.runtime.getURL("/icons/icon_128.png")

        function initAmr(imgSrc, bgColor) {
            let cover = document.createElement("div")
            cover.id = "amr-loading-cover"
            cover.style.backgroundColor = bgColor
            let img = document.createElement("img")
            img.src = imgSrc
            cover.appendChild(img)

            document.body.appendChild(cover)
            setTimeout(() => {
                try {
                    // @ts-ignore
                    cover.parentNode.remove(cover)
                } catch (e) {}
            }, 5000)

            return {
                success: true,
                message: "Loaded AMR with bg: " + bgColor
            }
        }

        loading.push(
            browser.scripting.executeScript({
                target: { tabId },
                func: initAmr,
                args: [iconUrl, bgColor]
            })
        )
        await Promise.all(loading)

        // Inject content scripts in matched tab
        const [libResult] = await browser.scripting.executeScript({
            target: { tabId },
            files: ["/lib/jquery.min.js", "/reader/init-reading.js"]
        })
        this.logger.debug({ libResult })

        const [mirrorResult] = await browser.scripting.executeScript({
            target: { tabId },
            func: function (mirror) {
                return globalThis["amrLoadMirror"](mirror)
            },
            args: [mir]
        })
        this.logger.debug(mirrorResult)

        // doing that because content script is not vue aware,
        // the reactive vuex object needs to be converted to POJSO
        return serializeVuexObject(mir)
    }

    getMir(url): Mirror | null {
        const host = new URL(url).host
        for (let mir of this.store.state.mirrors.all) {
            if (mir.activated && mir.domains && !mir.disabled) {
                let wss = mir.domains
                for (let u of wss) {
                    if (matchDomain(host, u, this.store)) {
                        return mir
                    }
                }
            }
        }
        return null
    }

    /**
     * Send an event to the tab telling that url has been changed.
     * If it's done by AMR, nothing to do, if it's inner website navigation, load amr
     */
    async sendPushState(url: string, tabId: number) {
        if (url.includes("chrome://")) {
            return
        }
        browser.scripting
            .executeScript({
                target: { tabId },
                func: function () {
                    return globalThis["__armreader__"] === undefined
                }
            })
            .then(async result => {
                if (result[0]) {
                    return this.matchUrlAndLoadScripts(url, tabId)
                }
                return browser.scripting.executeScript({
                    target: { tabId },
                    func: function () {
                        if (typeof globalThis["onPushState"] === "function") {
                            globalThis["onPushState"]()
                        }
                    }
                })
            })
            .catch(this.logger.error)
    }
    /**
     * Return the list of images urls from a chapter
     * @param {*} message
     */
    async getChapterData(message) {
        return fetch(message.url)
            .then(async resp => {
                let htmlDocument = await resp.text()
                // loads the implementation code
                let impl = await this.mirrorLoader.getImpl(message.mirrorName)
                // Check if this is a chapter page
                let isChapter = impl.isCurrentPageAChapterPage(htmlDocument, message.url)
                let infos,
                    imagesUrl: string[] = []
                if (isChapter) {
                    try {
                        // Retrieve information relative to current chapter / manga read
                        infos = await impl.getCurrentPageInfo(htmlDocument, message.url)

                        // retrieve images to load
                        imagesUrl = await impl.getListImages(htmlDocument, message.url)
                    } catch (e) {
                        console.error("Error while loading infos and images from url " + message.url)
                        console.error(e)
                    }
                }
                const body = cheerio.load(htmlDocument)
                const title = body("title" as string).text()

                return <ChapterData>{
                    isChapter: !!isChapter,
                    infos: infos,
                    images: imagesUrl,
                    title: title
                }
            })
            .catch(e => {
                console.error("error while loading images from chapter " + message.url)
                console.error(e)
                return Promise.resolve({ images: null })
            })
    }

    private async getImageUrlFromPageUrl(message: { mirror?: string; url: string }) {
        if (!message.mirror) {
            throw new Error(`message.mirror is required to resolve image from page`)
        }

        const impl = await this.mirrorLoader.getImpl(message.mirror)
        return impl.getImageUrlFromPage(message.url)
    }

    /**
     * Imports a list of mangas (only the long async part is in there)
     * @param {*} message
     */
    async importMangas(message) {
        let importcat = message.importcat
        let imps = message.imports
        let cats = this.store.state.options.categoriesStates
        let catsToAdd = []
        if (imps.mangas && imps.mangas.length > 0) {
            // add default category if it does not existent
            if (importcat !== "") {
                if (-1 === cats.findIndex(cat => cat.name === importcat)) {
                    this.store.dispatch("addCategory", importcat)
                }
            }

            let readall = []
            let firstChapToImport = true
            for (let mg of imps.mangas) {
                // convert manga to something matching readManga requirements
                let readmg: Partial<AppManga> & { action?: string } = {
                    mirror: mg.m,
                    name: mg.n,
                    url: mg.u
                }
                if (mg.l) readmg.lastChapterReadURL = mg.l
                if (mg.r) readmg.read = mg.r
                if (mg.p) readmg.update = mg.p
                if (mg.d) readmg.display = mg.d
                if (mg.y) readmg.layout = mg.y
                if (mg.c) {
                    readmg.cats = mg.c
                    mg.c.forEach((cat: string) => {
                        if (-1 === cats.findIndex(c => c.name === cat) && !catsToAdd.includes(cat)) {
                            catsToAdd.push(cat)
                        }
                    })
                }
                if (mg.g) readmg.language = mg.g
                if (mg.dn) readmg.displayName = mg.dn
                if (mg.wt) readmg.webtoon = mg.wt
                if (mg.z) readmg.zoom = mg.z
                // add default category if specified
                if (importcat !== "") {
                    if (readmg.cats && readmg.cats.length > 0) readmg.cats.push(importcat)
                    else readmg.cats = [importcat]
                }
                readmg.action = "readManga"

                let mgimport = Promise.resolve(this.store.dispatch("readManga", readmg).catch(e => e))
                if (this.store.state.options.waitbetweenupdates === 0) {
                    if (this.store.state.options.savebandwidth === 1) {
                        await mgimport
                    } else {
                        readall.push(mgimport)
                    }
                } else {
                    if (firstChapToImport) {
                        await mgimport
                        firstChapToImport = false
                    } else {
                        await new Promise(resolve => {
                            setTimeout(async () => {
                                await mgimport
                                resolve(true)
                            }, 1000 * this.store.state.options.waitbetweenupdates)
                        })
                    }
                }
            }
            if (this.store.state.options.savebandwidth !== 1) {
                // read all mangas
                await Promise.all(readall)
            }

            if (catsToAdd.length > 0) {
                catsToAdd.forEach(cat => this.store.dispatch("addCategory", cat))
            }
        }
    }
}
