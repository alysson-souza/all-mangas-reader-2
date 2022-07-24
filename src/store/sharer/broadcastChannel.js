const DEFAULT_CHANNEL = "vuex-shared-mutations"

const globalObj = typeof globalThis.window !== "undefined" ? globalThis.window : globalThis

export default class BroadcastChannelStrategy {
    static available(BroadcastChannelImpl = globalObj.BroadcastChannel) {
        return !(typeof BroadcastChannelImpl !== "function")
    }

    constructor(options = {}) {
        const BroadcastChannelImpl = options.BroadcastChannel || globalObj.BroadcastChannel
        const key = options.key || DEFAULT_CHANNEL

        if (!this.constructor.available(BroadcastChannelImpl)) {
            throw new Error("Broadcast strategy not available")
        }

        this.channel = new BroadcastChannelImpl(key)
    }

    addEventListener(fn) {
        this.channel.addEventListener("message", e => {
            fn(e.data)
        })
    }

    share(message) {
        return this.channel.postMessage(message)
    }
}
