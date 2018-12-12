import mirrorImpl from '../content/mirrorimpl';
import EventBus from "./EventBus";

export default {
    state: {
        scans: [], // list of scans [{url, loading, error, doublepage, scan HTMLImage}]
        progress: 0, // percentage (0 - 100) loaded of the whole chapter
        loaded: false, // top indicating all scans are loaded
    },

    /** Initialize state with a whole list of scans urls */
    init(scansUrl, inorder = false) {
        if (!scansUrl || scansUrl.length === 0) return

        this.state.scans = []
        this.state.progress = 0

        // change progress when scan loads
        EventBus.$on("loaded-scan", () => {
            let nbloaded = this.state.scans.reduce((acc, sc) => acc + sc.loading ? 0 : 1, 0)
            this.state.progress = Math.floor(nbloaded / scansUrl.length)
        })

        // initialize scans
        this.state.scans.push(...scansUrl.map(url => new ScanLoader(url)))
        this.load(inorder)
    },

    /** Load all scans */
    async load(inorder = false) {
        let pload = this.state.scans.map(sc => sc.load())
        if (inorder) {
            await pload.reduce((promise, func) =>
                promise.then(result => func().then(Array.prototype.concat.bind(result))),
                Promise.resolve([]))
        } else {
            await Promise.all(pload)
        }
        this.state.loaded = true
        EventBus.$emit("chapter-loaded")
    },

    /** Retrieve a scan */
    getScan(url) {
        return this.state.scans.find(sc => sc.url === url)
    }
}

/**
 * Handle a scan load, keeps original Image object to clone to insert scan somewhere
 */
class ScanLoader {
    /** Build the scan initial state */
    constructor(url) {
        this.url = url /* url of the image, not necessarily the url of the picture but the one used to retrieve the picture */
        this.loading = true /* is currently loading */
        this.error = false /* is the scan rendering error */
        this.doublepage = false /* is the scan a double page */
        this.scan = document.createElement("img") /* Image containing the loaded scan, will be cloned to be displayed */
    }
    /** Loads the scan */
    load() {
        this.loading = true
        this.error = false

        return new Promise(async (resolve, reject) => {
            this.scan.addEventListener('load', () => {
                let img = this.scan
                if (!img) return
                /** Check if scan is double page */
                if (img.width > img.height) {
                    this.doublepage = true
                }
                if (img.height >= 3 * img.width) { // super thin scan, raise an event
                    EventBus.$emit("thin-scan")
                }
                this.loading = false
                this.error = false
                EventBus.$emit("loaded-scan")
                resolve()
            })
            let manageError = (e) => {
                console.error("An error occurred while loading an image")
                console.error(e)
                this.loading = false
                this.error = true
                EventBus.$emit("loaded-scan")
                resolve()
            }
            this.scan.addEventListener('error', (e) => {
                manageError(e)
            })
            try {
                // Load the scan using implementation method
                await mirrorImpl.get().getImageFromPageAndWrite(
                    this.url.replace(/(^\w+:|^)/, ''),
                    this.scan)
            } catch(e) {
                console.error(e)
                manageError(e)
            }
        })
    }
}