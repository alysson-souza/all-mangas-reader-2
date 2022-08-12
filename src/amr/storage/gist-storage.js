import Storage from "./model-storage"
import { ThrottleError } from "./error/ToManyRequests"
import { SyncError } from "./error/SyncError"

export default class GistStorage extends Storage {
    constructor(config) {
        super(false)
        this.gistSyncGitID = config.gistSyncGitID
        this.gistSyncSecret = config.gistSyncSecret
        this.requests = 0
    }

    /**
     * @param {'GET' | 'PATCH'} method
     * @param {String} path
     * @param {object} [data]
     */
    async ax(method, path, data) {
        await this.wait()
        const url = `https://api.github.com/${path}`
        const response = await fetch(url, this.getConfig(method, data))

        if (response.ok) {
            return response.json()
        }
        if (response.headers.get("x-ratelimit-remaining") === "0") {
            // Set delay according to API response
            const timestamp = parseInt(response.headers["x-ratelimit-reset"]) * 1000
            throw new ThrottleError(response.data.message, new Date(timestamp))
        }

        const type = response.headers.get("content-type")
        if (type === "text/html") {
            throw new SyncError(await response.text(), response)
        }
        const errorData = await response.json()
        throw new SyncError(errorData.message, response)
    }

    /**
     *
     * @param method {'GET' | 'PATCH'}
     * @param data {object | undefined}
     * @returns {RequestInit}
     */
    getConfig(method, data = undefined) {
        return {
            body: data ? JSON.stringify(data) : undefined,
            method: method.toUpperCase(),
            headers: {
                accept: "application/vnd.github+json",
                "content-type": "application/json; charset=utf-8",
                "cache-control": "no-cache",
                authorization: `Bearer ${this.gistSyncSecret}`
            }
        }
    }

    async getAll() {
        if (!this.gistSyncGitID || !this.gistSyncSecret) {
            throw new Error("Missing credentials. Skipping update")
        }
        if (!this.gistSyncSecret.startsWith("ghp_")) {
            throw new Error("Missing PAT. Skipping update")
        }
        if (this.gistSyncSecret.length < 2) {
            throw new Error("Missing ID. Skipping update")
        }
        const request = await this.ax("GET", `gists/${this.gistSyncGitID}?cache=${Date.now()}`)

        const amr = request.files["amr.json"]
        console.log(amr)
        if (amr) {
            if (amr.truncated) {
                return this.ax("GET", amr.raw_url)
            } else {
                return JSON.parse(amr.content)
            }
        } else {
            await this.init()
            return this.getAll()
        }
    }

    async init() {
        await this.wait()
        const request = await this.ax("PATCH", `gists/${this.gistSyncGitID}`, this.getFileStruct("[]"))
        return JSON.parse(request.files["amr.json"].content)
    }

    async saveAll(content) {
        await this.wait()
        return this.ax("PATCH", `gists/${this.gistSyncGitID}`, this.getFileStruct(JSON.stringify(content)))
    }

    async delete(key, value) {
        const data = await this.getAll()
        const updates = data.map(manga => (manga.key === key ? value : manga))
        await this.wait()
        this.ax("PATCH", `gists/${this.gistSyncGitID}`, this.getFileStruct(JSON.stringify(updates))).catch(e => {
            if (e instanceof ThrottleError) {
                setTimeout(() => {
                    this.delete(key, value)
                }, e.getRetryAfterDate().getTime() - Date.now())
            }
            throw e
        })
    }

    getFileStruct(content) {
        return { files: { "amr.json": { content: content } } }
    }
}
