import browser from "webextension-polyfill";

class Notification {
    /**
     * Create a notification when a new chapter is released on a manga
     * @param {} mg manga to notify for
     */
    notifyNewChapter(mg) {
        if (mg.read === 0 && (store.state.options.shownotifications === 1)) {
            let urls = mg.listChaps.map(chap => chap[1]);
            let mangaData = {
                name: mg.name,
                mirror: mg.mirror,
                url: urls[urls.indexOf(mg.lastChapterReadURL) - 1]
            };
            // Notification data added to letiables to be used by the old or by the new notification API.
            let description = "... has new chapter(s) on " + mangaData.mirror + "! Click anywhere to open the next unread chapter.";
            let title = mangaData.name;
            let icon = browser.extension.getURL('icons/icon_32.png');
            let url = mangaData.url;
            if (browser.notifications) {
                // The new API have no notification object, so can't save data on it.
                // Hence, the URL must be saved under a global object, mapped by ID.
                // (no one would like to click a manga notification and ending up opening another manga)
                // For now, those global data is being saved here. But I think it would be better
                // to move it to another place for the sake of better code organization.
                // And because there are other notifications being opened elsewhere in the code too.
                // TODO probably a problem here, do not store additional fields on a manga from the store as vuex won't reflect it.
                // --> BETTER to store it on local singleton
                if (mg.notifications === undefined) {
                    mg.notifications = {};
                }
                if (mg.lastNotificationID === undefined) {
                    mg.lastNotificationID = 1;
                } else {
                    // lastNotificationID can, if the browser is open a sufficient amount of time
                    // and a lot of new manga chapters are found, grow beyond the number upper limit.
                    // But this is so unlikely to happen...
                    mg.lastNotificationID++;
                }
                mg.notifications["amr" + mg.lastNotificationID] = url;
                // Callback function to notification click.
                let notificationClickCallback = function (id) {
                    if (mg.notifications[id] !== undefined) {
                        browser.tabs.create({
                            "url": mg.notifications[id]
                        });
                        // It deletes the used URL to avoid unbounded object growing.
                        // Well, if the notification isn't clicked the said growing is not avoided.
                        // If this proves to be a issue a close callback should be added too.
                        delete mg.notifications[id];
                    }
                }, notificationCloseCallback = function (id) {
                    if (mg.notifications[id] !== undefined) delete mg.notifications[id];
                }
                let notificationOptions = {
                    type: "basic",
                    title: title,
                    message: description,
                    iconUrl: icon
                };
                // Add the callback to ALL notifications opened by AMR.
                // This can sure be a issue with another notifications AMR opens.
                browser.notifications.onClicked.addListener(notificationClickCallback);
                // To prevent the notification array from growing
                browser.notifications.onClosed.addListener(notificationCloseCallback);
                // And finally opens de notification. The third parameter is a creation callback,
                // which I think is not needed here.
                browser.notifications.create("amr" + mg.lastNotificationID, notificationOptions, function () { });
            }
        }
    }
}

export default (new Notification)