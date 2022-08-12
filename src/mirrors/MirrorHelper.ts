import browser from "webextension-polyfill"

import CryptoJS from "crypto-js"

interface LoadOptions {
    /** Do not sent content type **/
    nocontenttype?: boolean

    /** true to prevent page to be loaded from cache **/
    nocache?: boolean

    /** true to prevent images in page to be loaded **/
    preventimages?: boolean

    /** true to send message using POST **/
    post?: boolean

    /** data: object to send in accordance with its dataType **/
    data?: Record<string, unknown> | string

    crossdomain?: boolean

    contentType?: string

    headers?: { [k: string]: string }

    credentials?: RequestCredentials
}

type StateOptions = Record<string, string | undefined | null | number>

/**
 * Abstract common functionality that needs to handed by the reader
 */
export class MirrorHelper {
    constructor(private readonly options: StateOptions) {}

    crypto = CryptoJS

    /**
     * Loads a page and return an element in which page is loaded
     */
    public async loadPage(url: string, options: LoadOptions = {}): Promise<string> {
        const config = this.getConfig(options)
        const response = await fetch(url, config)

        let text = await response.text()
        if (options.preventimages) {
            text = text.replace(/<img/gi, "<noload")
        }
        return text
    }

    public async loadJson(url: string, options: LoadOptions = {}) {
        const config: RequestInit = {
            cache: options.nocache ? "no-cache" : "default",
            method: options.post ? "post" : "get",
            mode: options.crossdomain ? "no-cors" : "same-origin",
            headers: this.getDefaultHeaders(options, { "Content-Type": "application/json" })
        }

        const response = await fetch(url, config)

        // Manually try to parse json as original method
        const data = await response.text()

        try {
            return JSON.parse(data)
        } catch (e) {
            return data
        }
    }

    private getConfig(options: LoadOptions) {
        const config: RequestInit = {
            credentials: options.credentials,
            cache: options.nocache ? "no-cache" : "default",
            method: options.post ? "post" : "get",
            mode: options.crossdomain ? "no-cors" : "same-origin",
            headers: this.getDefaultHeaders(options),
            body: options.data ? JSON.stringify(options.data) : undefined
        }
        return config
    }

    private getDefaultHeaders(options: LoadOptions, defaults: Record<string, string> = {}): Record<string, string> {
        const header = { ...defaults, ...options.headers }

        if (options.nocontenttype) {
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
        let rx = new RegExp(
            "(var|let|const)\\s+" + varname + "\\s*=\\s*([0-9]+|\\\"|\\'|\\{|\\[|JSON\\s*\\.\\s*parse\\()",
            "gmi"
        )
        let match = rx.exec(sc)
        if (match) {
            let ind = match.index
            let varchar = match[2]
            let start = sc.indexOf(varchar, ind) + 1
            if (varchar.match(/[0-9]+/)) {
                res = Number(varchar)
            } else {
                if (varchar === '"' || varchar === "'") {
                    // var is a string
                    let found = false,
                        curpos = start,
                        prevbs = false
                    while (!found) {
                        let c = sc.charAt(curpos++)
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
                        openings = 1,
                        opening = varchar === "JSON.parse(" ? "(" : varchar,
                        opposite = varchar === "[" ? "]" : varchar === "{" ? "}" : ")"
                    while (openings > 0 && curpos < sc.length) {
                        let c = sc.charAt(curpos++)
                        if (c === opening) openings++
                        if (c === opposite) openings--
                    }
                    let toparse = sc.substring(start - 1 + varchar.length - 1, curpos)
                    if (toparse.match(/atob\s*\(/g)) {
                        // if data to parse is encoded using btoa
                        let m = /(?:'|").*(?:'|")/g.exec(toparse)
                        toparse = atob(m[0].substring(1, m[0].length - 1))
                    }
                    res = JSON.parse(toparse)
                }
            }
        }
        return res
    }

    /**
     * Set a cookie on a domain
     */
    async setCookie(setCookieObj) {
        if (this.options.allowcookies) {
            await browser.cookies.set(setCookieObj)
        }
    }

    getOption(option) {
        return this.options[option] || ""
    }
}

let instance: MirrorHelper
export const getMirrorHelper = (options: StateOptions) => {
    if (!instance) {
        instance = new MirrorHelper(options)
    }
    return instance
}
