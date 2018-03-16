
import {Text} from "@/models.js"
import {curvePlugin} from "./renderPlugins.js"

export default [
  store => store.subscribe((mutation, state) => {
    if (["updateObject", "putObject", "addObject"].indexOf(mutation.type) >= 0) {
      let o = store.getters.getObjectById(mutation.payload.id)
      if (o instanceof Text) {
        store.dispatch("startTextRendering", o.id)
      } else {
        let toRender = store.getters.getRenderingIds(o.id)
        toRender.forEach(r => store.dispatch("startRendering", r))
      }
    }
    if (["updateRenderParams", "setIgnoredForms", "addRenderParams"].indexOf(mutation.type) >= 0) {
      store.dispatch("startRendering", mutation.payload.pId || mutation.payload.params.id)
    }
  }),
  store => store.subscribe((mutation, state) => {
    if (mutation.type == "updateLayerOrder") {
      let toRender = store.getters.getRenderingIds("machine")
      toRender.forEach(r => store.dispatch("startRendering", r))
    }
  }),
  store => store.subscribe((mutation, state) => {
    if (mutation.type == "selectObject" && store.state.centered) {
      setTimeout(() => store.dispatch("centerProject", {withSidebar: true}), 10)
    }
  }),
  curvePlugin
]
