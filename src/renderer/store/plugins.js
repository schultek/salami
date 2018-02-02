
export default [
  store => store.subscribe((mutation, state) => {
    if (["updateObject", "putObject"].indexOf(mutation.type) >= 0) {
      let o = store.getters.getObjectById(mutation.payload.id)
      if (o.is == "cpart" || (o.is == "form" && o.ownRenderer)) {
        store.dispatch("generateLayerPath", o.id)
      } else if (o.is == "form") {
        let i = store.state.objects.indexOf(o);
        store.state.objects
          .filter(el => el.is == "cpart" || (el.is == "form" && el.ownRenderer))
          .filter((el, j) => j < i)
          .forEach(el => store.dispatch("generateLayerPath", el.id))
      } else if (o.is == "curve" || o.is == "image") {
        state.objects.filter(store.getters.isSublayer)
          .filter(el => el.render[o.is] == o.id)
          .forEach(el => store.dispatch("generateLayerPath", el.id))
      } else if (o.is == "text") {
        store.dispatch("generateTextPath", o.id)
      } else if (o.is == "machine") {
        store.getters.getObjectsByType.layers
          .forEach(el => store.dispatch("generateLayerPath", el.id))
        store.getters.getObjectsByType.curves
          .forEach(el => store.dispatch("generateCurvePaths", el.id))
      }
    }
  }),
  store => store.subscribe((mutation, state) => {
    if (["updateObject", "moveObject"].indexOf(mutation.type) >= 0) {
      let o = store.getters.getObjectById(mutation.payload.id)
      if (o.is == "curve")
        store.dispatch("generateCurvePaths", o.id)
    }
    if (mutation.type == "updateLayerOrder") {
      store.getters.getObjectsByType.layers.forEach(l => {
        store.dispatch("generateLayerPath", l.id)
      })
    }
  }),
  store => store.subscribe((mutation, state) => {
    if (mutation.type == "addObject") {
      if (mutation.payload.is == "cpart" || (mutation.payload.is == "form" && mutation.payload.ownRenderer)) {
        store.dispatch("generateLayerPath", mutation.payload.id)
      } else if (mutation.payload.is == "form") {
        let o = store.getters.getObjectById(mutation.payload.id);
        let i = store.state.objects.indexOf(o);
        store.state.objects
          .filter(el => el.is == "cpart" || (el.is == "form" && el.ownRenderer))
          .filter(el => store.state.objects.indexOf(el) < i)
          .forEach(el => store.dispatch("generateLayerPath", el.id))
      }else if (mutation.payload.is == "text") {
        store.dispatch("generateTextPath", mutation.payload.id)
      } else if (mutation.payload.is == "curve") {
        store.dispatch("generateCurvePaths", mutation.payload.id)
      }
    }
  }),
  store => store.subscribe((mutation, state) => {
    if (mutation.type == "translateProject" || mutation.type == "zoomProject") {
      store.commit("setCentered", false)
    }
    if (mutation.type == "selectObject" && store.state.centered) {
      setTimeout(() => store.dispatch("centerProject", {withSidebar: true}), 10)
    }
  })
]
