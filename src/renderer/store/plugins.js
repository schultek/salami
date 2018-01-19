
export default [
  store => {
    store.subscribe((mutation, state) => {
      if (["updateObject", "moveObject", "rotateObject", "resizeObject"].indexOf(mutation.type) >= 0) {
        let o = store.getters.getObjectById(mutation.payload.id)
        if (o.is == "cpart" || o.is == "form") {
          store.dispatch("generateLayerPath", o.id)
        } else if (o.is == "curve" || o.is == "image") {
          state.objects.filter(store.getters.isSublayer)
            .filter(el => el.render[o.is] == o.id)
            .forEach(el => store.dispatch("generateLayerPath", el.id))
        } else if (o.is == "text") {
          store.dispatch("generateTextPath", o.id)
        } else if (o.is == "machine") {
          store.getters.getObjectsByType.layers
            .filter(el => el.is == "cpart")
            .forEach(el => store.dispatch("generateLayerPath", el.id))
        }
        if (o.is == "curve") {
          store.dispatch("generateCurvePaths", o.id)
        } else if (o.is == "machine") {
          store.getters.getObjectsByType.curves
            .forEach(el => store.dispatch("generateCurvePaths", el.id))
        }
      }
      if (mutation.type == "addObject") {
        if (mutation.payload.is == "cpart") {
          store.dispatch("generateLayerPath", mutation.payload.id)
        } else if (mutation.payload.is == "text") {
          store.dispatch("generateTextPath", mutation.payload.id)
        } else if (mutation.payload.is == "curve") {
          store.dispatch("generateCurvePaths", mutation.payload.id)
        }
      }
    })
  },
  store => {
    store.subscribe((mutation, state) => {
      if (state.project.autoAdjustMachine &&
        ["updateObject", "moveObject", "resizeObject"].indexOf(mutation.type) >= 0) {
          store.dispatch("adjustMachine")
        }
    })
  }
]
