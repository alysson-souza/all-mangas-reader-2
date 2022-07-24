import "./popup.css"

import browser from "webextension-polyfill"
import Vue from "vue"
import Vuetify from "vuetify/lib"
import App from "./App.vue"
import store from "../../store"
import vuetifyOptions from "../vuetifyOptions"
import * as util from "../utils"
import { OptionStorage } from "../../shared/OptionStorage"
// import 'vuetify/src/stylus/main.styl'

const init = async () => {
    globalThis["AMR_STORE"] = store

    // Load options in store before everything
    const optionStore = new OptionStorage()
    const options = await optionStore.getVueOptions()

    store.commit("extendOptions", options)

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
    vuetifyOptions.theme.dark = store.state.options.dark === 1
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
