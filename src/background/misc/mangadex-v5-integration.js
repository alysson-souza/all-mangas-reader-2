
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
    this.enable = mangadexIntegrationEnable === 1 && mangadexValidCredentials === 1
    this.token = {
      session: [mangadexToken, mangadexTokenExpire],
      refresh: [mangadexRefresh, mangadexRefreshExpire]
    }
    this.dispatch = dispatch
    return (async() => {
      await this.verifyTokens()
      return this
    })
  }

  async verifyTokens() {
    if(Date.now() > this.token.refresh[1]) {
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 });
    } else if(Date.now() > this.token.session[1]) {
      await this.refreshToken()
    }
    return new Promise(resolve => resolve(this))
  }

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
      await this.propagate(await req.json())
    }
  }

  /**
   * 
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
    } else {
      await this.dispatch("setOption", { key: 'mangadexValidCredentials', value: 0 });
      this.mangadexValidCredentials = false
    }
  }
}