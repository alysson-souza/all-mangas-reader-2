import type { RootState } from "../types/common"

interface UpdateCheck {
    /** We are not supposed to run this at the moment **/
    shouldSkip: boolean
    /** Only used when shouldSkip true **/
    nextRunTimestamp: number

    /** Message for logging **/
    message: string
}

export function shouldDelayUpdate(rootState: RootState): UpdateCheck {
    if (rootState.options.isUpdatingChapterLists) {
        return {
            shouldSkip: true,
            message: "Skipping updating chapter list due to existing isUpdatingChapterLists in progress",
            nextRunTimestamp: 0
        }
    }

    // get sync and convert watchers
    const isSyncEnabled = rootState.options.syncEnabled || rootState.options.gistSyncEnabled
    const isSyncing = rootState.options.isSyncing === 1

    // retry later if sync or convert is running
    if (isSyncEnabled && isSyncing) {
        return {
            shouldSkip: true,
            message: "Skipping due to sync process running",
            nextRunTimestamp: Date.now() + 10 * 1000 // in 10s
        }
    }
    if (rootState.options.isConverting) {
        return {
            shouldSkip: true,
            message: "Skipping due to MangaDex v5 migration (conversion) process running",
            nextRunTimestamp: Date.now() + 60 * 1000
        }
    }
    // Not skipping, execute
    return { shouldSkip: false, message: "", nextRunTimestamp: 0 }
}
