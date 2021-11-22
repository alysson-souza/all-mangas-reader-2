import { EventEmitter } from "events";
import { Buffer } from "buffer";
export class Mangadex extends EventEmitter {
/**
 * 
 * @param {Object} opts
 * @param {String} opts.mangadexToken
 * @param {Number} opts.mangadexTokenExpire
 * @param {String} opts.mangadexRefresh
 * @param {Number} opts.mangadexRefreshExpire
 * @param {Boolean} opts.mangadexIntegrationEnable
 * @param {Boolean} opts.mangadexValidCredentials
 * @param {Boolean} opts.mangadexUpdateReadStatus
 * @param {Function} dispatch 
 */
  constructor({
      mangadexToken,
      mangadexTokenExpire,
      mangadexRefresh,
      mangadexRefreshExpire,
      mangadexIntegrationEnable,
      mangadexValidCredentials
  }, dispatch) {
    super()
    this.requests = 0
    this.customList = undefined
    this.mangadexIntegrationEnable === mangadexIntegrationEnable
    this.mangadexValidCredentials === mangadexValidCredentials
    this.token = {
      session: [mangadexToken, mangadexTokenExpire],
      refresh: [mangadexRefresh, mangadexRefreshExpire]
    }
    this.dispatch = dispatch
    if(Date.now() > this.token.refresh[1]) {
      (async () => await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 }, {root: true}))
    }
    else if(Date.now() > this.token.session[1]) {
      (async () => await this.refreshToken())
    }
  }

  async wait(ms) {
    this.requests = this.requests+1
    const time = this.requests*ms
    return new Promise(resolve => {
      setTimeout(() => {
        this.resetRequests()
        resolve()
      }, time)
    })
  }

  resetRequests() {
    if(this.requests > 0) this.requests = this.requests - 1
  }

  async verifyTokens() {
    if(Date.now() > this.token.refresh[1]) {
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 }, {root: true});
      return false
    } else if(Date.now() > this.token.session[1]) {
      return this.refreshToken()
    }
    return true
  }
  /**
   * Refresh tokens
   */
  async refreshToken() {
    const req = await fetch("https://api.mangadex.org/auth/refresh", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({token: this.token.refresh[0]})
    })
    if(req.status === 200) {
      return await this.propagate(await req.json())
    }
    return false
  }
  /**
   * Propagate API results to the store
   * @param {Object} json parsed json from fetch
   */
  async propagate(json) {
    if(json.result === 'ok') {
      const in13min = Date.now() + (60*1000*13) // 2min margin
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 1 }, {root: true});
      await this.dispatch("setOption", { key: 'mangadexToken', value: json.token.session }, {root: true});
      await this.dispatch("setOption", { key: 'mangadexTokenExpire', value: in13min }, {root: true});
      await this.dispatch("setOption", { key: 'mangadexRefresh', value: json.token.refresh }, {root: true});
      this.token.session = [json.token.session, in13min]
      return true
    } else {
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 }, {root: true});
      this.mangadexValidCredentials = false
      return false
    }
  }
  /**
   * helper to interact w/ mangadex API
   * @param {String} path relative path
   * @param {String} method GET | POST | PUT | DELETE
   * @param {Object} body body content
   */
   async MD(path, method, body) {
    const isValid = await this.verifyTokens()
    if(!isValid) return {}
    await this.wait()
    const req = await fetch(`https://api.mangadex.org${path}`, {
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token.session[0]}`
      },
      body: body ? JSON.stringify(body) : undefined
    }).catch(() => this.MD(path, method, body))
    if(req.status > 201 && req.status < 400) {
      await this.wait(1000)
      return this.MD(path, method, body)
    }
    const json = await req.json()
    return json
  }

  /**
   * @param {Array<String>} inStore Array of mg.key in store
   * @param {String} searchLang Lang to search
   * @returns 
   */
  async getFollows(inStore) {
      let res = []
      // loop
      for(let page = 0; page <= 100000; page++) {
        const resp = await this.MD(`/user/follows/manga?limit=100&offset=${page * 100}`, 'GET')
        const current = parseInt(resp.limit) + parseInt(resp.offset)
        const total = parseInt(resp.total)
        res = res.concat(resp.data)
        this.emit('getFollows:list:progress', {total, current})
        if(current >= total) break;
      }

      const fullRes = []
      for(const r of res) {
        // get all chapters lists in all language
        const langs = await this.getAllchapters(r.id, inStore)
        // get read chapters
        const reads = (await this.MD(`/manga/${r.id}/read`, 'GET')).data
        // find the highest chapter's number read in any language
        let lastChaptersRead = -9999
        if(reads) {
          if(reads.length) {
            langs.forEach(l => {
              l.chapters.forEach(c => {
                if(reads.includes(c.id)) {
                  if(parseFloat(c.chapNum) > parseFloat(lastChaptersRead)) lastChaptersRead = c.chapNum
                }
              })
            })
          }
        }
        // keep the closest chapter, affects every language
        // eg. if last read RU = 10 and last read EN = 5, skip EN ahead to 10 or the "closest" last released chapter
        langs.forEach(l => {
          const lastRead = l.chapters.reduce((prev, curr) => {
            return (Math.abs(parseFloat(curr.chapNum) - parseFloat(lastChaptersRead)) < Math.abs(parseFloat(prev.chapNum) - parseFloat(lastChaptersRead)) ? curr : prev);
          })
          l.lastChapterReadName = lastRead.title
          l.lastChapterReadURL = lastRead.url
          l.chapters = l.chapters.map(c => [c.title, c.url])
        })
        // emit progress
        this.emit('getFollows:loading:progress')
        fullRes.push({
          key: `mangadexv5/title/${r.id}`,
          name: r.attributes.title.en || Object.entries(r.attributes.title)[0][1],
          url: `https://mangadex.org/title/${r.id}`,
          mirror: "MangaDex V5",
          langs:langs
        })
      }

      // Keep values of fulfilled promised, sort output by title, remove entries with empty langs
      return fullRes.sort((a, b) => {
        const textA = a.name.toLocaleUpperCase();
        const textB = b.name.toLocaleUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      })
      .filter(e=> e.langs.length)
  }
  /**
   * Get all chapters in all languages.
   * @param {String} id Manga id
   * @param {Array<String>} inStore Array of mg.key in store
   * @returns 
   */
  async getAllchapters(id, inStore) {
    const res = {}
    // loop
    for(let page = 0; page <= 100000; page++) {
      const resp = await this.MD(`/manga/${id}/feed?limit=100&offset=${page * 100}&order[chapter]=desc&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic`, 'GET')
      const current = parseInt(resp.limit) + parseInt(resp.offset)
      const total = parseInt(resp.total)
      
      for(const data of resp.data) {
        // same as mangadex-v5 implementation
        const titleParts = []
        if(data.attributes.chapter && data.attributes.chapter.length > 0) titleParts.push(data.attributes.chapter)
        if(data.attributes.title) titleParts.push(data.attributes.title)
        const lang = data.attributes.translatedLanguage
        const obj = {
          id: data.id,
          chapNum: data.attributes.chapter,
          title: titleParts.length > 0 ? titleParts.join(' - ') : 'Untitled',
          url: `https://mangadex.org/chapter/${data.id}`,
          date: new Date(data.attributes.publishAt).getTime()
        }
        // only add languages which aren't in store
        if(!inStore.find(m => m.includes(id+'_'+lang))) {
          if(!res[lang]) res[lang] = []
          res[lang].push(obj)
        }
      }
      // stop loop if API has no more results to offer
      if(current >= total) break;
    }


    // If there's multiple releases for the same chapter, keep the oldest (same as mangadex-v5 impl.)
    const mapped = []
    Object.keys(res).forEach(k => {
      const chapters = Object.values(res[k].reduce((a, {id, chapNum, title, url, date}) => {
        if (a[id]) {
          if (a[id].date > date) a[id] = {id, chapNum, title, url, date};
        } else a[id] = {id, chapNum, title, url, date};
        return a;
      }, {}));

      mapped.push({ code: k, chapters})
    })
    // sort languages alphabetically
    return mapped.sort((a, b) => a.code > b.code ? 1 : -1)
  }
  /**
   * Mark chapter as read.
   * @param {String} chap chapter id
   */
  async markAsRead(chap) {
    chap = chap.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/)[0]
    return this.MD(`/chapter/${chap}/read`, 'POST')
  }
  /**
   * Mark chapters as read.
   * @param {String} manga manga id
   * @param {String[]} chaps chapters id
   */
   async markAsReadBatch(manga, chaps) {
    const mangaId = manga.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0]
    let chapterIdsRead = []
    for(const [i, chap] of chaps.entries()) {
      const chapId = chap.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/)[0]
      chapterIdsRead.push(chapId)
      const size = Buffer.byteLength(JSON.stringify(chapterIdsRead)) / 1024
      if(size > 9 || i === chaps.length-1) {
        await this.MD(`/manga/${mangaId}/read`, 'POST', {chapterIdsRead})
        chapterIdsRead = []
      }
    }
  }
  /**
   * @param {string[]} ids mangas id
   */
  async exportToList(ids, fromOptionMenu = false) {
    ids = ids.map(id => id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0])
    const customListId = await this.getCustomList(fromOptionMenu)
    for(const [i, id] of ids.entries()) {
      if(fromOptionMenu) this.emit('exportToList:progress', { current: String(i+1), total: String(ids.length) })
      await this.MD(`/manga/${id}/list/${customListId}`, 'POST', {})
    }
    this.emit('exportToList:done')
  }

  async removeFromList(ids) {
    ids = ids.map(id => id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0])
    const customListId = await this.getCustomList()
    for(const id of ids) {
      await this.MD(`/manga/${id}/list/${customListId}`, 'DELETE', {})
    }
  }
  /**
   * @param {String[]} ids mg.key
   */
   async exportToFollows(ids, fromOptionMenu = false) {
    if(fromOptionMenu) this.emit('exportToFollows:start')
    ids = ids.map(id => id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0])
    for(const [i, id] of ids.entries()) {
      if(fromOptionMenu) this.emit('exportToFollows:progress', { current: String(i+1), total: String(ids.length) })
      await this.MD(`/manga/${id}/follow`, 'POST', {})
      await this.MD(`/manga/${id}/status`, 'POST', { status: 'reading' })
    }
    this.emit('exportToFollows:done')
  }
  /**
   * @param {String[]} ids mg.key
   */
   async removeFromFollows(ids) {
    ids = ids.map(id => id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)[0])
    for(const id of ids) {
      await this.MD(`/manga/${id}/follow`, 'POST', {})
      await this.MD(`/manga/${id}/status`, 'POST', { status: 'dropped' })
    }
  }
  /**
   * get customList id
   * @returns {Promise<String>}
   */
     async getCustomList(fromOptionMenu = false) {
      if(fromOptionMenu) this.emit('getCustomList:start')
      this.customList = this.customList || await this.findOrCreateCustomList()
      if(fromOptionMenu) this.emit('getCustomList:done')
      return this.customList
    }
  /**
   * fetch the api to find AMR customList id, create if none.
   * @returns {Promise<String>}
   */
  async findOrCreateCustomList() {
    let result;
    // search in API for a list named "AMR"
    for(let page = 0; page <= 100000; page++) {
      const resp = await this.MD(`/user/list?limit=100&offset=${page * 100}`, 'GET')
      const current = parseInt(resp.limit) + parseInt(resp.offset)
      const total = parseInt(resp.total)
      const exist = resp.data.find(r=>r.attributes.name === 'AMR')
      if(exist) {
        result = exist.id
        break;
      }
      if(current >= total) break;
    }

    // create customList if none where found
    if(!result) {
     return (await this.MD('/list', 'POST', {
        name: 'AMR',
        visibility: 'private'
      })).data.id
    }
    return result
  }
}
