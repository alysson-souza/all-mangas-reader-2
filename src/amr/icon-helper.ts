import browser, { DeclarativeContent } from "webextension-polyfill"
import * as utils from "./utils"
import DefaultIcon from "../icons/icon_32.png"
import BwIcon from "../icons/icon_32_bw.png"
import { AppStore } from "../types/common"
import ImageDataType = DeclarativeContent.ImageDataType

/**
 * Class used to change AMR icon
 */
export class IconHelper {
    doEase = true
    canvas = new OffscreenCanvas(32, 32)

    animationFrames = 20
    animationSpeed = 50
    rotation = 0

    requireStop = false
    spinning = false

    iconSrc: string = DefaultIcon
    iconBwSrc: string = BwIcon

    private readonly width: number
    private readonly height: number
    private icon: ImageBitmap | undefined
    private bwIcon: ImageBitmap | undefined
    private canvasContext: OffscreenCanvasRenderingContext2D

    /**
     * Initialize canvas to draw icon on chrome which does not support animated svg as icon
     */
    constructor(private store: Pick<AppStore, "state" | "getters">) {
        this.width = 32
        this.height = 32

        this.canvasContext = this.canvas.getContext("2d")

        createImageBitmap(this.convertBase64ToUint8(this.iconSrc)).then(icon => {
            this.icon = icon
        })

        createImageBitmap(this.convertBase64ToUint8(this.iconBwSrc)).then(icon => {
            this.bwIcon = icon
        })
    }

    /**
     * Convert BASE64 to BLOB
     * @param base64Image Pass Base64 image data to convert into the BLOB
     */
    convertBase64ToUint8(base64Image: string) {
        // Split into two parts
        const parts = base64Image.split(";base64,")

        // Hold the content type
        const imageType = parts[0].split(":")[1]

        // Decode Base64 string
        const decodedData = globalThis.atob(parts[1])

        // Create UNIT8ARRAY of size same as row data length
        const uInt8Array = new Uint8Array(decodedData.length)

        // Insert all character code into uInt8Array
        for (let i = 0; i < decodedData.length; ++i) {
            uInt8Array[i] = decodedData.charCodeAt(i)
        }

        // Return BLOB image after conversion
        return new Blob([uInt8Array], { type: imageType })
    }

    updateBadge(nb) {
        if (utils.isFirefoxAndroid()) {
            return
        }
        browser.action.setBadgeText({ text: "" + nb })
        if (nb === 0) {
            // white text + grey background
            if (utils.isFirefox()) {
                browser.action.setBadgeTextColor({ color: "#ffffff" })
            }
            browser.action.setBadgeBackgroundColor({ color: "#646464" })
        } else {
            // white text + red background (same red as AMR icon)
            if (utils.isFirefox()) {
                browser.action.setBadgeTextColor({ color: "#ffffff" })
            }
            browser.action.setBadgeBackgroundColor({ color: "#bd0000" })
        }
    }

    resetBadge() {
        if (utils.isFirefoxAndroid()) {
            return
        }
        browser.action.setBadgeText({ text: "" })
    }

    /**
     * Set AMR icon to blue sharingan
     */
    setBlueIcon() {
        if (this.spinning) {
            return
        }
        if (utils.isFirefoxAndroid()) {
            return
        }
        browser.action.setIcon({ path: "/icons/icon_32_blue.png" })
    }

    /**
     * Set AMR icon to grayscale sharingan
     */
    setBWIcon() {
        if (this.spinning) {
            return
        }
        if (utils.isFirefoxAndroid()) {
            return
        }
        browser.action.setIcon({ path: "/icons/icon_32_bw.png" })
    }

    /**
     * Set AMR icon to default sharingan
     */
    resetIcon() {
        if (this.spinning) {
            return
        }
        if (utils.isFirefoxAndroid()) {
            return
        }
        browser.action.setIcon({ path: "/icons/icon_32.png" })
    }

    /**
     * Set AMR icon to spinning sharingan (normal or grayscale depending on options)
     */
    spinIcon() {
        if (utils.isFirefoxAndroid()) {
            return
        }
        this.waitSpinning()
        this.spinning = true
    }

    /**
     * Stop the spinning
     */
    stopSpinning() {
        this.requireStop = true
    }

    /**
     * Draw spinning sharingan on chrome
     * @param {*} doEase
     */
    drawIconAtRotation(doEase) {
        if (doEase == undefined) {
            doEase = false
        }

        if (!this.bwIcon || !this.icon) {
            return
        }

        this.canvasContext.save()
        this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.canvasContext.translate(this.canvas.width / 2, this.canvas.height / 2)
        this.canvasContext.rotate(2 * Math.PI * (doEase ? this.ease(this.rotation) : this.rotation))

        if (this.store.state.options.nocount == 1 && !this.store.getters.hasNewMangas) {
            this.canvasContext.drawImage(this.bwIcon, -this.canvas.width / 2, -this.canvas.height / 2)
        } else {
            this.canvasContext.drawImage(this.icon, -this.canvas.width / 2, -this.canvas.height / 2)
        }
        this.canvasContext.restore()
        browser.action.setIcon({
            imageData: this.canvasContext.getImageData(0, 0, this.canvas.width, this.canvas.height) as ImageDataType
        })
    }

    /**
     * Animation loop
     */
    waitSpinning() {
        this.rotation += 1 / this.animationFrames
        if (this.rotation > 1) {
            // stop the rotation once the turn is over
            if (this.requireStop) {
                this.requireStop = false
                this.spinning = false
                // update the badge and icon one last time
                this.refreshBadgeAndIcon()
                return
            }
            this.rotation = this.rotation - 1
            this.doEase = false
        }
        this.drawIconAtRotation(false)
        setTimeout(this.waitSpinning.bind(this), this.animationSpeed)
    }

    /**
     * Refresh badge and icon
     */
    refreshBadgeAndIcon() {
        let nbnew = this.store.getters.nbNewMangas
        if (this.store.state.options.nocount == 1) {
            this.resetBadge() // remove badge
            // display a grey badge if no new mangas
            if (nbnew > 0) {
                this.resetIcon()
            } else {
                this.setBWIcon()
            }
        } else {
            this.resetIcon()
            if (this.store.state.options.displayzero === 1) {
                this.updateBadge(nbnew)
            } else {
                if (nbnew == 0) {
                    this.resetBadge()
                } else {
                    this.updateBadge(nbnew)
                }
            }
        }
    }

    /**
     * Ease for rotation
     * @param {*} x
     */
    ease(x) {
        return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2
    }
}

let instance: IconHelper
export const getIconHelper = (store: AppStore) => {
    if (!instance) {
        instance = new IconHelper(store)
    }
    return instance
}
