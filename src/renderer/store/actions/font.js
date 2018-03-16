
import {showOpenDialog} from "../helpers.js"

export default {
  async loadNewFont({state, getters, commit}) {
    let file = await showOpenDialog({filters: [{name: "Fonts", extensions: ['ttf', 'woff', 'woff2']}]})
    let font = new Font({file, title: file.substring(file.lastIndexOf("/")+1, file.lastIndexOf("."))})
    
    try {
      font.font = await loadOpentypeFont(file)
      commit("addFont", font);
    } catch (err) {
      //TODO notification "This Font cannot be used!"
    }
  }
}
