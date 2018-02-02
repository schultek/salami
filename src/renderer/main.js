import Vue from 'vue'
import App from './App'
import Overlay from "./components/Overlay.vue"
import Vuex from 'vuex'
import VueElectron from 'vue-electron'

import {store} from "./store/index.js"
import directives from "./directives/index.js"

import fs from "mz/fs"
import path from "path"

Vue.use(VueElectron);

// Vue.config.productionTip = false

new Vue({
  components: { App, Overlay },
  template: '<div><App/><Overlay ref="overlay"/></div>',
  mounted() {
    this.$store.dispatch("init").then(
      this.$refs.overlay.fadeOut
    )
  },
  store
}).$mount('#app')
