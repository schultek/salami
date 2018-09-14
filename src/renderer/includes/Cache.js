
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
      try {
        let parts = copied.object.title.split(" ");
        let num = parseInt(parts.pop());
        parts.push(num+1)
        let newT = parts.join(" ");
        console.log(parts, num, newT);
        copied.object.title = newT;
      } catch (e) {
        console.error(e);
      }
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
