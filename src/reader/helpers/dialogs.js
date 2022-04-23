import util from "./util"
import { i18n } from "../../mixins/i18n-mixin"
import browser from "webextension-polyfill"

/**
 * Display tips
 *  - user can choose to display tips once a day or to stop it
 *  - button next go to next tip
 *  - saves previous tip and user preferences
 *  - force : force to display the popup (called on tips action button)
 * All the tips are retrieved from i18n starting by reader_tips_ followed with numbers starting from 1. Numbers must be consecutive
 */
export const handleTips = async function ($ref, force = false) {
    let display = true
    if (!force) {
        let lasttime = await util.getStorage("reader_tips_ts")
        let stopped = await util.getStorage("reader_tips_stop")
        if (stopped) display = false
        if (lasttime && Date.now() - parseInt(lasttime) < 24 * 60 * 60 * 1000) {
            display = false
        }
    }
    if (force) display = true
    if (display) {
        let lasttip = await util.getStorage("reader_tips_last")
        if (lasttip) lasttip = parseInt(lasttip)
        // load tips in i18n
        let tips = [],
            tip
        while ((tip = i18n("reader_tips_" + (tips.length + 1)))) {
            tips.push(tip)
        }
        // get the next tip
        let nextTip = async () => {
            if (!lasttip || lasttip + 1 > tips.length) lasttip = 0
            let nxttip = lasttip + 1
            await util.setStorage("reader_tips_last", "" + nxttip)
            lasttip = nxttip
            return tips[nxttip - 1] // lasttip is 1-based, tips array is 0-based
        }
        // Button to stop displaying tips
        let butstop = {
            title: i18n("reader_tips_stop"),
            color: "grey",
            click: async ({ agree }) => {
                await util.setStorage("reader_tips_stop", "true")
                agree()
            }
        }
        let butnexttip = {
            title: i18n("reader_tips_next"),
            color: "primary",
            click: async ({ changeMessage }) => {
                changeMessage(await nextTip())
            }
        }
        let butnexttomorrow = {
            title: i18n("reader_tips_next_tomorrow"),
            color: "primary",
            click: ({ agree }) => {
                agree()
            }
        }
        let butclose = {
            title: i18n("button_close"),
            color: "grey",
            click: ({ agree }) => {
                agree()
            }
        }
        let ntip = await nextTip()
        await $ref.open(i18n("reader_tips_title"), ntip, {
            cancel: false,
            buttons: force ? [butclose, butnexttip] : [butstop, butnexttip, butnexttomorrow]
        })
        await util.setStorage("reader_tips_ts", "" + Date.now())
    }
}

/**
 * Test if current browser is Firefox
 */
function isFirefox() {
    // Firefox 1.0+ (tested on Firefox 45 - 53)
    return typeof InstallTrigger !== "undefined"
}

/**
 * Display messages once in a while to give support to AMR
 *  - link to patreon
 *  - link to leave a comment on Firefox
 * @param {} $ref
 */
export const handleHelps = async function ($ref) {
    // number of read chapters with the extension since v2.1
    let nbread = await util.getStorage("nb_read")
    if (!nbread) return
    nbread = parseInt(nbread)

    /**
     * title : title of the dialog to display
     * message : message to display
     * action_name : name of the action button (other buttons are close and stop showing that)
     * action : what to do when clicked
     * id : to store the fact that we don't want the message
     * condition: a condition to respect to show that popup
     * importance: if multiple are eligible, the greater wins the battle, if multiple same, randomly chosen
     */
    let popups = [
        {
            // rate us on Firefox Addons
            title: i18n("reader_help_rate_title"),
            message: i18n("reader_help_rate_message"),
            action_name: i18n("reader_help_rate_action"),
            action: () => {
                browser.runtime.sendMessage({
                    action: "opentab",
                    url: "https://addons.mozilla.org/firefox/addon/all-mangas-reader/"
                })
            },
            id: "rate",
            importance: 1,
            condition: () => {
                return isFirefox() && nbread % 20 === 0
            }
        },
        {
            // patreon popup
            title: i18n("reader_help_patreon_title"),
            message: i18n("reader_help_patreon_message"),
            action_name: i18n("reader_help_patreon_action"),
            action: () => {
                browser.runtime.sendMessage({
                    action: "opentab",
                    url: "https://www.patreon.com/allmangasreader"
                })
            },
            id: "patreon",
            importance: 2,
            condition: () => nbread % 50 === 0
        },
        {
            // 1000 mangas read !!
            title: i18n("reader_help_1000_title", nbread),
            message: i18n("reader_help_1000_message", nbread),
            id: "1000",
            importance: 3,
            condition: () => nbread % 1000 === 0
        }
    ]

    let displayable_popups = [],
        topimp = 0
    for (let pop of popups) {
        if (await util.getStorage("dialog_" + pop.id + "_stop")) continue
        if (pop.condition()) {
            displayable_popups.push(pop)
            if (topimp < pop.importance) topimp = pop.importance
        }
    }
    if (displayable_popups.length === 0) return // no popup matching display conditions
    displayable_popups = displayable_popups.filter(pop => pop.importance === topimp) // keep top level popups
    // choose randomly among winners
    let to_display = displayable_popups[Math.floor(Math.random() * displayable_popups.length)]

    // Button to stop displaying this message
    let butstop = {
        title: i18n("reader_help_stop"),
        color: "grey",
        click: async ({ agree }) => {
            await util.setStorage("dialog_" + to_display.id + "_stop", "true")
            agree()
        }
    }
    // button to close message
    let butclose = {
        title: i18n("button_close"),
        color: "grey",
        click: ({ agree }) => {
            agree()
        }
    }
    let dispbuts = [butstop, butclose]
    if (to_display.action_name) {
        // custom dialog button
        let butcustom = {
            title: to_display.action_name,
            color: "primary",
            click: ({ agree }) => {
                to_display.action()
                agree()
            }
        }
        dispbuts.push(butcustom)
    }
    // display dialog
    await $ref.open(to_display.title, to_display.message, {
        cancel: false,
        buttons: dispbuts
    })
}
