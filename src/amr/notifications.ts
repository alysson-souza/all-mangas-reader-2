import browser from "webextension-polyfill"
import i18n from "./i18n"
import { AppManga, AppStore } from "../types/common"
import { findNextChapter } from "../shared/utils"

/**
 * Manage browser notifications
 */
class Notification {
    // store current opened notifications
    private notifications = {}
    // last id of notification
    private currentId = 0

    constructor(private readonly store: AppStore) {}

    notificationClickCallback = (id: string | undefined) => {
        if (this.notifications[id] !== undefined) {
            browser.tabs.create({ url: this.notifications[id] }).catch(console.error)
            // It deletes the used URL to avoid unbounded object growing.
            // Well, if the notification isn't clicked the said growing is not avoided.
            // If this proves to be a issue a close callback should be added too.
            delete this.notifications[id]
        }
    }

    notificationCloseCallback = (id: string | undefined) => {
        if (this.notifications[id] !== undefined) {
            delete this.notifications[id]
        }
    }

    /**
     * Create a notification when a new chapter is released on a manga
     * @param {} mg manga to notify for
     */
    notifyNewChapter(mg: AppManga) {
        if (!browser.notifications) {
            console.error("Browser does not support notifications")
        }

        if (mg.read !== 0 || this.store.state.options.shownotifications !== 1) {
            return // Skipping
        }

        const chapter = findNextChapter(mg)
        const mangaData = {
            name: mg.displayName ? mg.displayName : mg.name,
            mirror: mg.mirror,
            url: chapter?.url
        }

        // The URL must be saved under a global object, mapped by ID.
        // (no one would like to click a manga notification and ending up opening another manga)
        const curId = this.currentId++
        this.notifications["amr_" + curId] = mangaData.url

        // opens the notification.
        browser.notifications
            .create("amr_" + curId, {
                type: "basic",
                title: mangaData.name,
                message: i18n("notif_message", mangaData.mirror),
                contextMessage: i18n("notif_message_chapter", chapter?.name ?? "— ⚠️"),
                iconUrl: browser.runtime.getURL("/icons/icon_32.png"),
                isClickable: !!chapter
            })
            .catch(e => {
                console.error(
                    new Error(`Failed to updated ${mangaData.name} notification for ${mangaData.mirror}`, { cause: e })
                )
            })

        //Auto close notification if required
        if (this.store.state.options.notificationtimer > 0) {
            setTimeout(function () {
                browser.notifications.clear("amr_" + curId)
            }, this.store.state.options.notificationtimer)
        }
    }
}

let instance: Notification
export const getNotifications = (store: AppStore) => {
    if (!instance) {
        instance = new Notification(store)
    }
    return instance
}
