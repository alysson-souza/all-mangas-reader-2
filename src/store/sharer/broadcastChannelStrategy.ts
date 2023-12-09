import { ShareStrategy } from "./Strategy"

export default class BroadcastChannelStrategy implements ShareStrategy {
    private channel: globalThis.BroadcastChannel

    static available(BroadcastChannelImpl = globalThis.BroadcastChannel) {
        return !(typeof BroadcastChannelImpl !== "function")
    }

    constructor({ key = "vuex-shared-mutations" }: { key?: string } = {}) {
        if (!BroadcastChannelStrategy.available(globalThis.BroadcastChannel)) {
            throw new Error("Broadcast strategy not available")
        }
        this.channel = new globalThis.BroadcastChannel(key)
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
