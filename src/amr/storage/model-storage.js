export default class Storage {
  constructor(isdb, interval = 30*1000) {
    this.retryDate = new Date()
    this.interval = interval
    this.isdb = isdb
  }
}