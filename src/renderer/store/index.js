import Vue from 'vue'
import Vuex from 'vuex'

import state from './state.js'
import mutations from './mutations.js'
import actions from './actions.js'
import getters from "./getters.js"
import plugins from "./plugins.js"

Vue.use(Vuex)

export const store = new Vuex.Store({
  state, mutations, actions, getters, plugins,
  strict: true //TODO remove on production
})
