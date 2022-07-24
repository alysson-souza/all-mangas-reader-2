import "./popup.css"

import browser from "webextension-polyfill"
import Vue from "vue"
import Vuetify from "vuetify/lib"
import App from "./App.vue"
import store from "../../store"
import vuetifyOptions from "../vuetifyOptions"
import * as util from "../utils"
// import 'vuetify/src/stylus/main.styl'

const init = async () => {
    window["AMR_STORE"] = store

    // Load options in store before everything
    await store.dispatch("getStateFromReference", {
        module: "options",
        mutation: "extendOptions"
    })

    let popup = true
    if (window.location.href.indexOf("mode=tab") >= 0) {
        popup = false
    }

    /** Open in new tab if required */
    if (store.state.options.newTab === 1 && popup) {
        browser.runtime.sendMessage({
            action: "opentab",
            url: "/pages/popup/popup.html?mode=tab"
        })
        window.close()
    }
    if (popup && !util.isSmallDevice()) {
        document.body.classList.add("popup")
        document.documentElement.style.fontSize = "14px"
    } else {
        document.documentElement.style["overflow-y"] = "auto"
        document.documentElement.style.fontSize = "16px"
    }
    // Load vue
    Vue.config.productionTip = false
    Vue.prototype.$isPopup = popup
    Vue.prototype.$eventBus = new Vue()
    Vue.use(Vuetify)
    vuetifyOptions.theme.dark = window["AMR_STORE"].state.options.dark === 1
    new Vue({
        el: "#app",
        store,
        vuetify: new Vuetify(vuetifyOptions),

        render: h => h(App)
    })

    async function waitForPopup(retries = 10, delay = 50) {
        const wait = ms => new Promise(func => setTimeout(func, ms))

        if (window.innerWidth !== 0 && window.innerHeight !== 0) {
            return Promise.resolve()
        }

        if (retries <= 0) {
            return
        }

        await wait(delay)

        // retry
        return waitForPopup(retries - 1, delay)
    }

    await waitForPopup()

    if (popup && [348, 425].includes(window.innerWidth)) {
        browser.runtime.sendMessage({
            action: "opentab",
            url: "/pages/popup/popup.html?mode=tab"
        })
        window.close()
    }
}
init()
