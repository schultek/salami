
import {showOpenDialog, loadOpentypeFont} from "../helpers.js"
import {Font} from "@/models.js"

export default {
  async loadNewFont({state, commit, dispatch, getters}, id) {
    let file = await showOpenDialog({filters: [{name: "Fonts", extensions: ['ttf', 'woff', 'woff2']}]})
    if (!file) return;
    let font = getters.getNewObjectByType("font", {file, onError: err => dispatch("fontError", err)})
    commit("addObject", font)
    if (id && state.fonts.find(f => f.id == font.id)) {
      commit("updateObject", {id, font: font.id})
    }
  },
  fontError({state, commit}, err) {
    console.warn("This Font cannot be used!", err)
    //TODO notification "This Font cannot be used!"
  }
}
