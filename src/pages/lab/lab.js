import Vue from "vue"
import Vuetify from "vuetify/lib"
import App from "./App.vue"
import store from "../../store"
import vuetifyOptions from "../vuetifyOptions"

const init = async function () {
    // Load options in store before everything
    await store.dispatch("getStateFromReference", {
        module: "options",
        mutation: "extendOptions"
    })

    // Load vue
    Vue.config.productionTip = false
    Vue.use(Vuetify)
    vuetifyOptions.theme.dark = store.state.options.dark === 1
    new Vue({
        el: "#app",
        store,
        vuetify: new Vuetify(vuetifyOptions),

        render: h => h(App)
    })
}
init()
