import 'vuetify/dist/vuetify.min.css';
import './popup.css';

import browser from "webextension-polyfill";
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from '../../store';
import theme from '../theme';
import * as util from "../utils";

(async function() {
  // Load options in store before everything
  await store.dispatch("getStateFromReference", {
    module: "options",
    mutation: "extendOptions"
  });

  let popup = true;
  if (window.location.href.indexOf("mode=tab") >= 0) {
    popup = false;
  }

  /** Open in new tab if required */
  if (store.state.options.newTab === 1 && popup) {
    browser.runtime.sendMessage({
      action: "opentab",
      url: "/pages/popup/popup.html?mode=tab"
    });
  }
  if (popup && !util.isSmallDevice()) {
    document.body.classList.add("popup");
  } else {
    document.documentElement.style["overflow-y"] = "auto"
  }
  // Load vue
  Vue.config.productionTip = false
  Vue.use(Vuetify, {theme: theme, iconfont: 'mdi'})
  new Vue({
    el: '#app',
    store,
    
    render: h => h(App)
  });
})();