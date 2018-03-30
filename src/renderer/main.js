import Vue from 'vue'
import App from './App'
import Overlay from "./components/Overlay.vue"
import Vuex from 'vuex'
import VueElectron from 'vue-electron'

import Notification from "vue-notification"

import {store} from "./store/index.js"
import directives from "./directives/index.js"

import fs from "mz/fs"
import path from "path"

import {ipcRenderer} from "electron"

import {setNotify} from "@/functions"
import Snapping from "@/includes/Snapping.js"
import MenuCommands from "@/includes/MenuCommands.js"

Vue.use(VueElectron);
Vue.use(Notification);

// Vue.config.productionTip = false

new Vue({
  components: { App, Overlay },
  template: '<div><App/><Overlay ref="overlay"/></div>',
  mounted() {
    setNotify(this.$notify.bind(this))
    Snapping.init(this.$store);
    MenuCommands.init(this.$store);
    this.$store.dispatch("init").then(
      this.$refs.overlay.fadeOut
    )
  },
  store
}).$mount('#app')

ipcRenderer.on("touchbar", (e, m) => {
  console.log(m)
})
