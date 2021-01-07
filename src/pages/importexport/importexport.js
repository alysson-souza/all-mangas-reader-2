import 'vuetify/dist/vuetify.min.css';

import Vue from 'vue';
import Vuetify from 'vuetify';
import App from './App.vue';
import store from '../../store';
import theme from '../theme';

(async function() {

  window['AMR_STORE'] = store

  
  // Load options in store before everything
  await store.dispatch("getStateFromReference", {
    module: "options",
    mutation: "extendOptions"
  });

  // Load vue
  Vue.config.productionTip = false
  Vue.use(Vuetify, {theme: theme, iconfont: 'mdi'})
  new Vue({
    el: '#app',
    store,
    
    render: h => h(App)
  });
})();