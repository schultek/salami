
export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id;
    let store = vnode.context.$store;
    let drag = false, dragged = false
    let data = {}

    el.addEventListener("mousedown", event => {
      if (store.state.selectedTool != "select") return
      store.commit("selectObject", id);
      drag = true;
      dragged = false;
      let p = store.getters.getLocalPosition(event)
      let o = store.getters.getObjectById(id)
      data = {
        x: o.x - p.x,
        y: o.y - p.y
      }
    })
    document.addEventListener("mousemove", event => {
      if (!drag) return
      dragged = true;
      let p = store.getters.getLocalPosition(event)
      store.commit("moveObject", {
        id,
        x: data.x + p.x,
        y: data.y + p.y,
      })
    })
    document.addEventListener("mouseup", event => {
      if (dragged) {
        store.commit("putObject", {id})
      }
      drag = false;
    })
    el.addEventListener("click", (event) => {
      event.stopPropagation()
    })
  }
}
