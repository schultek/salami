import Vue from 'vue'
import App from './App'
import Overlay from "./components/Overlay.vue"
import Vuex from 'vuex'
import VueElectron from 'vue-electron'

import Notification from "vue-notification"
import VModal from 'vue-js-modal'

import {store} from "./store/index.js"
import directives from "./directives/index.js"

import fs from "mz/fs"
import path from "path"

import {ipcRenderer} from "electron"

import {setNotify} from "@/functions"
import Snapping from "@/includes/Snapping.js"
import MenuCommands from "@/includes/MenuCommands.js"
import Cache from "@/includes/Cache.js"
import Modal from "@/includes/Modal.js"
import UserStore from "@/includes/UserStore.js"

Vue.use(VueElectron);
Vue.use(Notification);
Vue.use(VModal, {dialog: true})

// Vue.config.productionTip = false

new Vue({
  components: { App, Overlay },
  template: '<div><App/><Overlay ref="overlay"/></div>',
  mounted() {
    setNotify(this.$notify.bind(this))
    Modal.init(this.$store, this.$modal)
    Snapping.init(this.$store);
    MenuCommands.init(this.$store);
    UserStore.init(this.$store);
    Cache.init(this.$store);
    this.$store.dispatch("init").then(
      this.$refs.overlay.fadeOut
    )
  },
  store
}).$mount('#app')

ipcRenderer.on("touchbar", (e, m) => {
  console.log(m)
})
