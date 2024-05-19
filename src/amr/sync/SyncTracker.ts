import { DispatchMethod } from "../../types/action"
import { ThrottleError } from "../storage/error/ToManyRequests"
import { AppLogger } from "../../shared/AppLogger"
import { LastSync, LastSyncError } from "../../types/common"
import { NotificationManager } from "../notifications"
import { AppOptions } from "../../shared/OptionStorage"

type ErrorContext = { provider: "gist" }

export class SyncTracker {
    /**
     * Minimum difference in milliseconds between two error notifications
     * Currently set to 24 hour
     */
    private minDiffInMs = 1000 * 60 * 60 * 24

    constructor(
        private readonly logger: AppLogger,
        private readonly options: AppOptions,
        private readonly dispatch: DispatchMethod,
        private readonly notificationManager: NotificationManager | undefined
    ) {}

    public async triggerLastSyncError(e: unknown, context: ErrorContext = { provider: "gist" }) {
        if (e instanceof Error) {
            const lastSync = this.getLastSync(context, e)
            await this.dispatch("lastSync", lastSync).catch(this.logger.error)
            await this.triggerNotification(lastSync)
            return
        }

        this.logger.error(new Error("Unknown error type", { cause: e }))
    }

    private getLastSync(context: ErrorContext, e: Error): LastSync {
        if (e instanceof ThrottleError) {
            return {
                status: "error",
                provider: context.provider,
                date: new Date().toISOString(),
                errorDetails: {
                    type: "rate-limit",
                    message: e.message,
                    context: {
                        retryAfter: e.getRetryAfterDate().toISOString()
                    }
                }
            }
        }

        return {
            status: "error",
            provider: context.provider,
            date: new Date().toISOString(),
            errorDetails: {
                type: "api",
                message: e.message
            }
        }
    }

    private async triggerNotification(syncUpdate: LastSync) {
        if (syncUpdate.status !== "error" || !this.shouldTrigger(syncUpdate)) {
            return false
        }

        await this.notificationManager?.triggerNotification({
            title: syncUpdate.errorDetails.type === "rate-limit" ? "Rate limit reached" : "Sync Manager Error",
            message: syncUpdate.errorDetails.message,
            contextMessage: `Provider: ${syncUpdate.provider}`
        })

        await this.dispatch("setOption", {
            key: "lastSyncErrorNotificationTs",
            value: Date.now()
        })
    }

    private shouldTrigger(syncError: LastSyncError) {
        const diff = new Date(syncError.date).getTime() - this.options.lastSyncErrorNotificationTs
        // Ensure we are not spamming users
        return diff > this.minDiffInMs
    }
}
