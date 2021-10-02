export default class Storage {
  constructor(isdb, interval = 30*1000) {
    this.retryDate = new Date()
    this.interval = interval
    this.isdb = isdb
    this.requests = 0
    this.delay = 500
  }
  async wait() {
    return new Promise((resolve) => {
      this.requests = this.requests + 1
      setTimeout(() => {
        this.decrementReqs()
        resolve()
      }, this.delay*this.requests)
    })
  }

  decrementReqs() {
    this.requests = this.requests - 1
    if(this.requests < 0) this.requests = 0
  }
}