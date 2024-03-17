import type { LastSync } from "./common"
import { Notifications } from "webextension-polyfill"

export type SearchListAction = { action: "searchList"; mirror: string; search: string }

export type BaseAction = { key: string; action: string; url: string; mirror?: string }

export type LastSyncAction = { action: "lastSync"; lastSync: LastSync }

export type TriggerNotificationAction = {
    action: "triggerNotification"
    notification: Notifications.CreateNotificationOptions
}

export type AllActions = SearchListAction | LastSyncAction | TriggerNotificationAction | BaseAction

export type DispatchMethod = (action: string, payload: unknown) => Promise<unknown>
