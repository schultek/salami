
let store = null, copied = null;

export default {
  init(st) {
    store = st;
  },
  copy() {
    if (store.state.selectedObject) {
      let obj = store.getters.getObjectById(store.state.selectedObject)
      let type = store.getters.getObjectTypeById(store.state.selectedObject)
      copied = {type, object: obj.toObj()}
      delete copied.object.id
    }
  },
  paste() {
    if (copied) {
      let obj = store.getters.getNewObjectByType(copied.type, copied.object)
      store.commit("addObject", obj)
      store.commit("selectObject", obj.id)
    }
  },
  cut() {
    this.copy();
    this.delete();
  },
  delete() {
    if (store.state.selectedObject) {
      store.dispatch("removeObject", store.state.selectedObject)
    }
  }
}
