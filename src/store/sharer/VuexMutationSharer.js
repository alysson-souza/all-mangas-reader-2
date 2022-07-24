import BroadcastChannelStrategy from "./broadcastChannel"

/**
 * Taken from: https://github.com/xanf/vuex-shared-mutations
 * Modified to work with V3
 */
export default ({ predicate, strategy } = {}) => {
    if (!Array.isArray(predicate) && typeof predicate !== "function") {
        throw new Error("Either array of accepted mutations or predicate function must be supplied")
    }

    const predicateFn = typeof predicate === "function" ? predicate : ({ type }) => predicate.indexOf(type) !== -1

    let sharingInProgress = false
    const selectedStrategy = strategy || new BroadcastChannelStrategy()
    return store => {
        store.subscribe((mutation, state) => {
            if (sharingInProgress) {
                return Promise.resolve(false)
            }

            return Promise.resolve(predicateFn(mutation, state)).then(shouldShare => {
                if (!shouldShare) {
                    return
                }
                selectedStrategy.share(mutation)
            })
        })

        selectedStrategy.addEventListener(mutation => {
            try {
                sharingInProgress = true
                store.commit(mutation.type, mutation.payload)
            } finally {
                sharingInProgress = false
            }
            return "done"
        })
    }
}
