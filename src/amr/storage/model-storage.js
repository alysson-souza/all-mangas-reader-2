export default class Storage {
    name = "BaseStorage"

    constructor(isdb, interval = 30 * 1000) {
        this.retryDate = new Date()
        this.interval = interval
        this.isdb = isdb
        this.requests = 0
        this.delay = 500
    }

    async wait(ms = 150) {
        this.requests = this.requests + 1
        const time = this.requests * ms
        return new Promise(resolve => {
            setTimeout(() => {
                this.resetRequests()
                resolve()
            }, time)
        })
    }

    resetRequests() {
        if (this.requests > 0) this.requests = this.requests - 1
    }
}
