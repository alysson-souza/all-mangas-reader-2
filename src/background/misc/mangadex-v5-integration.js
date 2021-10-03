
export class Mangadex {
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
    this.requests = 0
    this.mangadexIntegrationEnable === mangadexIntegrationEnable
    this.mangadexValidCredentials === mangadexValidCredentials
    this.token = {
      session: [mangadexToken, mangadexTokenExpire],
      refresh: [mangadexRefresh, mangadexRefreshExpire]
    }
    this.dispatch = dispatch
    if(Date.now() > this.token.refresh[1]) {
      (async () => await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 }))
    }
    else if(Date.now() > this.token.session[1]) {
      (async () => await this.refreshToken())
    }
  }

  async wait() {
    this.requests = this.requests+1
    const time = this.requests*180
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
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 });
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
   * @param {*} json
   * @param {Boolean} isRenew 
   */
  async propagate(json, isRenew = false) {
    if(json.result === 'ok') {
      const in13min = Date.now() + (60*1000*13) // 2min margin
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 1 });
      await this.dispatch("setOption", { key: 'mangadexToken', value: json.token.session });
      await this.dispatch("setOption", { key: 'mangadexTokenExpire', value: in13min });
      await this.dispatch("setOption", { key: 'mangadexRefresh', value: json.token.refresh });
      this.token.session = [json.token.session, in13min]
      return true
    } else {
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 });
      this.mangadexValidCredentials = false
      return false
    }
  }
  /**
   * helper to interact w/ mangadex API
   * @param {String} path
   * @param {String} method GET|POST|PUT|DELETE
   * @param {Object} obj
   */
   async MD(path, method, obj) {
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
      body: obj ? JSON.stringify(obj) : undefined
    })
    return req.json()
  }

  async getFollows() {
      let res = []
      // fetching for a max of 10.000 results
      for(const [page] of Array(100).entries()) {
        const resp = await this.MD(`/user/follows/manga?limit=100&offset=${page * 100}`, 'GET')
        const current = parseInt(resp.limit) + parseInt(resp.offset)
        const total = parseInt(resp.total)
        res = res.concat(resp.data)
        if(current >= total) break;
      }
      const mapped = res.map(async r => {
        const lang = await this.getAvailableLanguages(r.id)
        return {
          id: r.id,
          title: r.attributes.title.en || Object.entries(r.attributes.title)[0][1],
          lang: lang.sort(function(a, b) {
            var textA = a.name.toLocaleUpperCase();
            var textB = b.name.toLocaleUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          })
        }
      })
      return (await Promise.allSettled(mapped)).filter(p => p.status === "fulfilled").map(v => v.value).sort((a, b) => {
        var textA = a.title.toLocaleUpperCase();
        var textB = b.title.toLocaleUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
      })
  }
  async getAvailableLanguages(id) {
    const res = []
    for(const [page] of Array(500).entries()) {
      const resp = await this.MD(`/manga/${id}/feed?limit=100&offset=${page * 100}&order[chapter]=asc`, 'GET')
      const current = parseInt(resp.limit) + parseInt(resp.offset)
      const total = parseInt(resp.total)
      for(const data of resp.data) {
        res.push({ name: data.attributes.translatedLanguage, url: `https://mangadex.org/chapter/${data.id}` })
      }
      if(current >= total) break;
    }
    return res.filter((thing, index, self) =>
      index === self.findIndex((t) => (
        t.name === thing.name
      ))
    )
  }
  /**
   * 
   * @param {String} mg 
   */
  async markAsRead(chap) {
    chap = chap.match(/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/)[0]
    return this.MD(`/chapter/${chap}/read`, 'POST')
  }
}