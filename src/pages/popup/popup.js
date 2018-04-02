import 'vuetify/dist/vuetify.min.css';
import './popup.css';

import 'regenerator-runtime/runtime';
import browser from "webextension-polyfill";
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from '../../store';
import theme from '../theme';

(async function() {
  // Load options in store before everything
  await store.dispatch("getStateFromReference", {
    module: "options",
    mutation: "extendOptions"
  });

  /** Open in new tab if required */
  if (store.state.options.newTab === 1 
    && window.location.href.indexOf("mode=tab") < 0) {
    browser.runtime.sendMessage({
      action: "opentab",
      url: "/pages/popup/popup.html?mode=tab"
    });
  }

  // Load vue
  Vue.config.productionTip = false
  Vue.use(Vuetify, {theme: theme})
  new Vue({
    el: '#app',
    store,
    
    render: h => h(App)
  });
})();