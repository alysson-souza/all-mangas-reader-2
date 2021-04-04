import Axios from 'axios'
import Storage from './model-storage'
import { ThrottleError } from './error/ToManyRequests';

export default class GistStorage extends Storage {

  constructor(config) {
    super(false)
    this.gistSyncGitID = config.gistSyncGitID
    this.gistSyncSecret = config.gistSyncSecret
    this.axios = this.initAxios()
  }

  initAxios() {
    return Axios.create({
      baseURL: 'https://api.github.com/',
      headers: {
        'Authorization': `Bearer ${this.gistSyncSecret}`,
        'Cache-Control': 'no-cache'
      }
    })
  }

  reconfig(key, value) {
    this[key] = value
    this.axios = this.initAxios()
  }

  async getAll() {
    const request = await this.axios.get(`gists/${this.gistSyncGitID}`).catch(this.handleSyncError)
    const amr = request.data.files['amr.json']
    if(amr) {
      if(amr.truncated) {
        const content = await this.axios.get(amr.raw_url).catch(this.handleSyncError)
        return content.data
      } else {
        return JSON.parse(amr.content)
      }
    } else {
      await this.init()
      return this.getAll()
    }
  }

  async init() {
    const request = await this.axios.patch(`gists/${this.gistSyncGitID}`, this.getFileStruct('[]')).catch(this.handleSyncError)
    return JSON.parse(request.data.files['amr.json'].content)
  }

  async saveAll(content) {
    return this.axios.patch(`gists/${this.gistSyncGitID}`, this.getFileStruct(JSON.stringify(content))).catch(this.handleSyncError)
  }

  handleSyncError(e) {
    if(e.response.headers['x-ratelimit-remaining'] === "0") {
      // Set delay according to API response
      const timestamp = parseInt(e.response.headers['x-ratelimit-reset']) * 1000
      throw new ThrottleError(e.response.data.message, new Date(timestamp))
    }
    throw new Error(e.response.data.message)
  }

  async delete(key, value) {
    const data = await this.getAll()
    const updates = data.map(manga => manga.key === key ? value : manga)
    return this.saveAll(updates)
  }

  getFileStruct(content) {
    return { files: { 'amr.json' : { content: content } } }
  }
}
