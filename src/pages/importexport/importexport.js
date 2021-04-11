import 'vuetify/dist/vuetify.min.css';

import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from '../../store';
import vuetifyOptions from '../vuetifyOptions';

(async function() {

  window['AMR_STORE'] = store


  // Load options in store before everything
  await store.dispatch("getStateFromReference", {
    module: "options",
    mutation: "extendOptions"
  });

  // Load vue
  Vue.config.productionTip = false
  Vue.use(Vuetify)
  vuetifyOptions.theme.dark = window['AMR_STORE'].state.options.dark === 1
  new Vue({
    el: '#app',
    store,
    vuetify: new Vuetify(vuetifyOptions),

    render: h => h(App)
  });
})();
