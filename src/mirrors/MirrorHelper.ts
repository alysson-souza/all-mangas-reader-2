import browser, { Cookies } from "webextension-polyfill"
import CryptoJS from "crypto-js"

export interface LoadOptions {
    /** @deprecated Do not sent content type **/
    nocontenttype?: boolean

    /** true to prevent page to be loaded from cache **/
    nocache?: boolean

    /** true to prevent images in page to be loaded **/
    preventimages?: boolean

    /**
     * @deprecated use method instead
     * true to send message using POST
     **/
    post?: boolean

    method?: "GET" | "PATCH" | "POST" | "DELETE"

    /** data: object to send in accordance with its dataType **/
    data?: Record<string, unknown> | string | URLSearchParams | FormData

    referrer?: string

    crossdomain?: boolean

    headers?: { [k: string]: string }

    credentials?: RequestCredentials

    redirect?: RequestRedirect

    timeoutInMs?: number
}

type StateOptions = Record<string, string | undefined | null | number>

export type JsonOptions = Omit<LoadOptions, "preventimages">

/**
 * Abstract common functionality that needs to handed by the reader
 */
export class MirrorHelper {
    constructor(private options: StateOptions) {}

    crypto = CryptoJS

    /**
     * Loads a page and return an element in which page is loaded
     */
    public async loadPage(url: string, options: LoadOptions = {}): Promise<string> {
        const config = this.getConfig(options)
        const response = await fetch(url, config)

        if (!response.ok) {
            const message = `Failed to load manga list from url ${url}`
            this.logError("loadPage", message, url, config)
            throw new Error(message)
        }

        let text = await response.text()
        if (options.preventimages) {
            text = text.replace(/<img/gi, "<noload")
        }
        return text
    }

    /**
     * This method was really miss used in a lot of places in previous implementations
     * where it was not loading json at all, but instead text....
     */
    public async loadJson(url: string, options?: JsonOptions) {
        const config = this.getConfig(options, { "Content-Type": "application/json" })
        const response = await fetch(url, config)

        if (!response.ok) {
            const message = `Failed to load manga list from url ${url}`
            this.logError("loadJson", message, url, config)
            throw new Error(message)
        }

        // Manually try to parse json as original method
        const data = await response.text()

        try {
            return JSON.parse(data)
        } catch (e) {
            console.error(e)
            return data
        }
    }

    private logError(fn: string, message: string, url: string, config: RequestInit) {
        console.error({
            fn,
            message,
            url,
            method: config.method,
            cache: config.cache,
            body: config.body ? config.body.toString() : config.body
        })
    }

    private getConfig(options: LoadOptions = {}, defaultHeaders?: Record<string, string>): RequestInit {
        return {
            credentials: options.credentials,
            cache: options.nocache ? "no-cache" : "default",
            method: options.post ? "POST" : options.method ?? "GET",
            mode: options.crossdomain ? "no-cors" : "same-origin",
            headers: this.getDefaultHeaders(options, defaultHeaders),
            body: this.getData(options),
            redirect: options.redirect,
            signal: AbortSignal.timeout(options.timeoutInMs ?? 60000)
        }
    }

    private getData(options: LoadOptions): BodyInit | undefined {
        if (options.data instanceof URLSearchParams) {
            return options.data
        }

        if (options.data instanceof FormData) {
            return options.data
        }

        if (typeof options.data === "object") {
            return JSON.stringify(options.data)
        }

        if (typeof options.data === "string") {
            return options.data
        }

        // In theory should never reach this
        return options.data ? JSON.stringify(options.data) : undefined
    }

    private getDefaultHeaders(options: LoadOptions, defaults: Record<string, string> = {}): Record<string, string> {
        const header = { ...defaults, ...options.headers }

        if (options.data instanceof URLSearchParams) {
            // Must be  application/x-www-form-urlencoded
            header["Content-Type"] = "application/x-www-form-urlencoded"
        } else if (options.nocontenttype) {
            delete header["Content-Type"]
        }

        return header
    }

    /**
     * @TODO Don't think we want to call this or use this anymore
     * @deprecated
     **/
    getVariable(variableName: string, doc: Document) {
        const textDom = doc.getElementById("__amr_text_dom__").innerText
        return this.getVariableFromScript(variableName, textDom)
    }

    /**
     * No idea what magic is this...
     * @TODO Need to get rid of this somehow
     */
    public getVariableFromScript = function (varname: string, sc: string) {
        let res = undefined
        const rx = new RegExp(
            "(var|let|const)\\s+" + varname + "\\s*=\\s*([0-9]+|\\\"|\\'|\\{|\\[|JSON\\s*\\.\\s*parse\\()",
            "gmi"
        )
        const match = rx.exec(sc)
        if (match) {
            const ind = match.index
            const varchar = match[2]
            const start = sc.indexOf(varchar, ind) + 1
            if (varchar.match(/[0-9]+/)) {
                res = Number(varchar)
            } else {
                if (varchar === '"' || varchar === "'") {
                    // var is a string
                    let found = false,
                        curpos = start,
                        prevbs = false
                    while (!found) {
                        const c = sc.charAt(curpos++)
                        if (c === varchar && !prevbs) {
                            found = true
                            break
                        }
                        prevbs = c === "\\"
                    }
                    res = sc.substring(start, curpos - 1)
                } else {
                    // if (varchar === '[' || varchar === "{" || varchar === 'JSON.parse(') { // var is object or array or parsable
                    let curpos = start + varchar.length - 1,
                        openings = 1
                    const opening = varchar === "JSON.parse(" ? "(" : varchar,
                        opposite = varchar === "[" ? "]" : varchar === "{" ? "}" : ")"
                    while (openings > 0 && curpos < sc.length) {
                        const c = sc.charAt(curpos++)
                        if (c === opening) openings++
                        if (c === opposite) openings--
                    }
                    let toparse = sc.substring(start - 1 + varchar.length - 1, curpos)
                    if (toparse.match(/atob\s*\(/g)) {
                        // if data to parse is encoded using btoa
                        const m = /(?:'|").*(?:'|")/g.exec(toparse)
                        toparse = atob(m[0].substring(1, m[0].length - 1))
                    }
                    res = JSON.parse(toparse)
                }
            }
        }
        return res
    }

    /**
     *  This is used to produce images to fake novels being series to read. Hacky but easier than rewriting amr to support text and images
     *
     * @param lines An array of text lines to produce the novel images
     * @returns
     */
    public async createImagesFromText(lines: string[]): Promise<string[]> {
        const linesProcessed = []
        const images = []
        const largeText = this.getOption("novelLargePrint") === 1
        const lineLengthBeforeWrap = largeText ? 80 : 140 // Number of characters to split the lines up for
        const wrap = (s, w) => s.replace(new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"), "$1:|:")

        for (const line of lines) {
            if (line.length > lineLengthBeforeWrap) {
                const parts = this.wrapText(line, lineLengthBeforeWrap)
                // console.debug('Line Wrap detected', line, parts)

                linesProcessed.push(...parts)
            } else {
                linesProcessed.push(line)
            }
        }

        for (const line of linesProcessed) {
            images.push(await this.createImage(line))
        }

        return images
    }

    /**
     *  This function is for wrapping novel text so that it does not over-run on the images
     *
     * @param string Input string to wrap
     * @param width  Max number of characters before a string is wrapped. This will find the first space before the max width
     * @returns
     */
    private wrapText(string: string, width: number): string[] {
        return string.replace(new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, "g"), "$1:|:").split(":|:")
    }

    /**
     *  This function actually draws the image and returns a base64 encoded string to be used as the image src
     *
     * @param text Text to be drawn on the image
     * @returns
     */
    private async createImage(text: string) {
        const dark = this.getOption("novelDark") === 1
        const largeText = this.getOption("novelLargePrint") === 1
        const height = largeText ? 45 : 32
        const canvas = new OffscreenCanvas(1000, height)
        const context = canvas.getContext("2d")

        context.rect(0, 0, largeText ? 1200 : 1000, height)
        context.fillStyle = dark ? "black" : "ghostwhite"
        context.fill()

        context.font = `${largeText ? "25" : "15"}px Helvetica`
        context.fillStyle = dark ? "ghostwhite" : "black"
        context.fillText(text, 7, height - (largeText ? 15 : 7))

        const blob = await canvas.convertToBlob()
        const base64String = await new Promise(resolve => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.readAsDataURL(blob)
        })

        return base64String
    }

    /**
     * Set a cookie on a domain
     */
    async setCookie(setCookieObj: Cookies.SetDetailsType) {
        if (this.options.allowcookies) {
            await browser.cookies.set(setCookieObj)
        }
    }

    async getCookie(details: Cookies.GetDetailsType) {
        if (this.options.allowcookies) {
            return browser.cookies.get(details)
        }
    }

    getOption(option) {
        return this.options[option] || ""
    }

    setOptions(options) {
        this.options = options
    }
}

let instance: MirrorHelper
export const getMirrorHelper = (options: StateOptions) => {
    if (!instance) {
        instance = new MirrorHelper(options)
    }
    return instance
}
