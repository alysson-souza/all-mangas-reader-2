import 'vuetify/dist/vuetify.min.css';
import './lab.css';

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

  // Load vue
  Vue.config.productionTip = false
  Vue.use(Vuetify, {theme: theme})
  new Vue({
    el: '#app',
    store,
    
    render: h => h(App)
  });
})();