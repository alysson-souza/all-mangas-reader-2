import browser from "webextension-polyfill"

import i18n from "./i18n"

/**
 * Managa browser notifications
 */
class Notification {
    constructor(store) {
        this.store = store
        // store current opened notifications
        this.notifications = {}
        // last id of notification
        this.currentId = 0

        // Callback function to notification click.
        let _self = this
        let notificationClickCallback = function (id) {
                if (_self.notifications[id] !== undefined) {
                    browser.tabs.create({
                        url: _self.notifications[id]
                    })
                    // It deletes the used URL to avoid unbounded object growing.
                    // Well, if the notification isn't clicked the said growing is not avoided.
                    // If this proves to be a issue a close callback should be added too.
                    delete _self.notifications[id]
                }
            },
            notificationCloseCallback = function (id) {
                if (_self.notifications[id] !== undefined) delete _self.notifications[id]
            }
        if (browser.notifications) {
            // Add the callback to ALL notifications opened by AMR.
            browser.notifications.onClicked.addListener(notificationClickCallback)
            // To prevent the notification array from growing
            browser.notifications.onClosed.addListener(notificationCloseCallback)
        }
    }
    /**
     * Create a notification when a new chapter is released on a manga
     * @param {} mg manga to notify for
     */
    notifyNewChapter(mg) {
        if (mg.read === 0 && this.store.state.options.shownotifications === 1) {
            let urls = mg.listChaps.map(chap => chap[1])
            let mangaData = {
                name: mg.displayName ? mg.displayName : mg.name,
                mirror: mg.mirror,
                url: urls[urls.indexOf(mg.lastChapterReadURL) - 1]
            }
            // Notification data added to letiables to be used by the old or by the new notification API.
            let description = i18n("notif_message", mangaData.mirror)
            let title = mangaData.name
            let icon = browser.runtime.getURL("/icons/icon_32.png")
            let url = mangaData.url
            if (browser.notifications) {
                // The new API have no notification object, so can't save data on it.
                // Hence, the URL must be saved under a global object, mapped by ID.
                // (no one would like to click a manga notification and ending up opening another manga)
                let curId = this.currentId++
                this.notifications["amr_" + curId] = url

                let notificationOptions = {
                    type: "basic",
                    title: title,
                    message: description,
                    iconUrl: icon
                }

                // opens the notification.
                browser.notifications.create("amr_" + curId, notificationOptions)
                //Auto close notification if required
                if (this.store.state.options.notificationtimer > 0) {
                    setTimeout(function () {
                        browser.notifications.clear("amr_" + curId)
                    }, this.store.state.options.notificationtimer)
                }
            }
        }
    }
}

let instance
export const getNotifications = store => {
    if (!instance) {
        instance = new Notification(store)
    }
    return instance
}
