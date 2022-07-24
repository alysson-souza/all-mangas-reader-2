import BroadcastChannelStrategy from "./broadcastChannelStrategy"
import { ShareStrategy } from "./Strategy"
type PredicateFn = (props: { type: string }, state: unknown) => boolean

interface MutationConfig {
    strategy?: ShareStrategy
    predicate: string[] | PredicateFn
}

const getPredicate = (predicate: MutationConfig["predicate"]): PredicateFn => {
    if (typeof predicate === "function") {
        return predicate
    }
    return ({ type }) => predicate.includes(type)
}

/**
 * Taken from: https://github.com/xanf/vuex-shared-mutations
 * Modified to work with V3
 */
export default ({ predicate, strategy }: MutationConfig) => {
    if (!Array.isArray(predicate) && typeof predicate !== "function") {
        throw new Error("Either array of accepted mutations or predicate function must be supplied")
    }

    const predicateFn = getPredicate(predicate)

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
