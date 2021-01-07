import 'vuetify/dist/vuetify.min.css';
import './bookmarks.css';

import browser from "webextension-polyfill";
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from '../../store';
import theme from '../theme';

(async function() {
  // Load vue
  Vue.config.productionTip = false
  Vue.use(Vuetify, {theme: theme, iconfont: 'mdi'})
  window['AMR_STORE'] = store
  new Vue({
    el: '#app',
    store,
    
    render: h => h(App)
  });
})();