import mirrorImpl from '../content/mirrorimpl';
import EventBus from "./EventBus";

/** 
 * This file handles Scans Loading, (unique scan and all scans from a chapter)
 * and keeps the state of the current chapter scans
 */

 /** Current chapter's scans state */
export const scansProvider = {
    /** Current shared state of scans */
    state: {
        scans: [], // list of scans [{url, loading, error, doublepage, scan HTMLImage}]
        progress: 0, // percentage (0 - 100) loaded of the whole chapter
        loaded: false, // top indicating all scans are loaded
    },

    /**
     * Init current state with a ScansProvider
     * @param {} scp the scans provider to load in current state
     */
    initWithProvider(scp) {
        this.state.scans = scp.scans
        // Listen to state change
        scp.onloadchapter = () => EventBus.$emit("chapter-loaded")
        scp.onloadscan = () => {
            // change progress when scan loads
            let nbloaded = this.state.scans.reduce((acc, sc) => acc + (sc.loading ? 0 : 1), 0)
            this.state.progress = Math.floor(nbloaded / this.state.scans.length * 100)
            this.state.loaded = nbloaded === this.state.scans.length
            EventBus.$emit("loaded-scan")
            if (this.state.scans.filter(sc => sc.thinscan).length > 0) {
                EventBus.$emit("thin-scan")
            }
        }
        // initailize state with provider values
        this.state.scans = scp.scans
        this.state.progress = scp.progress
        this.state.loaded = scp.loaded
        if (this.state.loaded) {
            if (this.state.scans.filter(sc => sc.thinscan).length > 0) {
                EventBus.$emit("thin-scan")
            }
            EventBus.$emit("chapter-loaded")
        }
    },

    /** Initialize state with a whole list of scans urls */
    init(scansUrl, inorder = false) {
        if (!scansUrl || scansUrl.length === 0) return

        let scp = new ScansLoader(scansUrl)
        this.initWithProvider(scp)

        // initialize scans
        scp.load(inorder)
    },
}

/**
 * Create a ScansLoader, which loads scans in background 
 */
export const ScansLoader = class {
    constructor(scansUrl) {
        this.scans = [] // list of scans [{url, loading, error, doublepage, scan HTMLImage}]
        this.loaded = false // top indicating all scans are loaded
        this.onloadchapter = () => {} // function to call when chapter is fully loaded
        this.onloadscan = () => {} // function to call when scan is loaded

        // initialize scans
        this.scans.push(...scansUrl.map(url => new ScanLoader(url)))
    }

    /** Load all scans */
    async load(inorder = false) {
        // we create a new Promise to encapsulate the scan's load function because we need to call onloadscan after each load unitarily. We can't use then() to chain the load because that will trigger the load promise and we want to be able to call it in order OR all at the same time)
        let pload = this.scans.map(sc => new Promise(async (resolve, reject) => { 
            await sc.load() // loads the scan
            this.onloadscan() // raise event to notify than the scan has been loaded (for example to update progress)
            resolve() // resolve current promise (in case scans are loaded in order, allows to load next scan)
        }))
        if (inorder) { // Load scans in their appearing order
            await pload.reduce((promise, func) =>
                promise.then(result => func.then(Array.prototype.concat.bind(result))),
                Promise.resolve([]))
        } else { // Load all scans at once
            await Promise.all(pload)
        }
        this.loaded = true // done loading scans
        this.onloadchapter() // raise an event to notify that chapter has been loaded
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
        this.thinscan = false /* is the scan super thin (height > 3 * width) */
        this.scan = document.createElement("img") /* Image containing the loaded scan, will be cloned to be displayed */
    }
    /** Loads the scan */
    load() {
        this.loading = true
        this.error = false

        // The code below introduce a loading error for a quarter of the scans
        // think about updating the this.url at the bottom of the function and replace it with just url
        /*let url = this.url
        if (Math.floor(Math.random() * 4) === 2) {
            console.log("introduce error for scan url " + this.url)
            url = 'https://www.mangareader.net/fakeimage.jpg' //introduce an error 25% of the time
        }*/

        return new Promise(async (resolve, reject) => {
            this.scan.addEventListener('load', () => {
                let img = this.scan
                if (!img) return
                /** Check if scan is double page */
                if (img.width > img.height) {
                    this.doublepage = true
                }
                if (img.height >= 3 * img.width) { // super thin scan, raise an event
                    this.thinscan = true
                }
                this.loading = false
                this.error = false
                resolve()
            })
            let manageError = (e) => {
                console.error("An error occurred while loading an image")
                console.error(e)
                this.loading = false
                this.error = true
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
                manageError(e)
            }
        })
    }
}