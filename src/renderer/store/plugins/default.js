
import {Text} from "@/models.js"

export default [
  store => store.subscribe((mutation, state) => {
    if (["updateObject", "putObject", "addObject", "setTextRenderResult"].indexOf(mutation.type) >= 0) {
      let toRender = store.getters.getRenderingIds(mutation.payload.id)
      toRender.forEach(r => store.dispatch("startRendering", r))
    }
    if (["updateRenderParams", "setIgnoredForm", "addRenderParams"].indexOf(mutation.type) >= 0) {
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
    if (store.state.centered && mutation.type == "selectObject") {
      store.dispatch("centerProject", {withSidebar: true});
    }
  }),
  store => store.subscribe((mutation, state) => {
    if ((mutation.type == "selectObject" && mutation.payload != null) || (mutation.type == "selectTool" && mutation.payload != "select")) {
      store.commit("setFullPreview", false);
    }
  })
]
