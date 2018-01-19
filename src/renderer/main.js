import Vue from 'vue'
import App from './App'
import Vuex from 'vuex'
import VueElectron from 'vue-electron'

import 'vue-awesome/icons'
import Icon from 'vue-awesome'

import {store} from "./store/index.js"
import directives from "./directives/index.js"

import fs from "mz/fs"


Vue.use(VueElectron);
Vue.component('icon', Icon)

function loadIcon(name, url, r) {
  let icon = fs.readFileSync(url, 'utf-8')
  Icon.register({
    [name]: {
      width: r, height: r,
      raw: icon
    }
  })
}

loadIcon("layers", "./src/renderer/assets/layers.svg", 55)
loadIcon("layouts", "./src/renderer/assets/layouts.svg", 490)

// Vue.config.productionTip = false

new Vue({
  components: { App },
  template: '<App/>',
  store
}).$mount('#app')

store.dispatch("init")

/*TODO

shortcuts
linking
copy layers
no double dialogs
live server
undo
detect unsaved changes
write promise webworker wrapper

*/
