import 'vuetify/dist/vuetify.min.css';
import './popup.css';

import 'regenerator-runtime/runtime';
import browser from "webextension-polyfill";
import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from './../store';

Vue.config.productionTip = false
Vue.use(Vuetify)

new Vue({
  el: '#app',
  store,
  
  render: h => h(App)
});
