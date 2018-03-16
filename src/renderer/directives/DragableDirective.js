
export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id;
    let store = vnode.context.$store;
    let drag = false, dragged = false
    let data = {}

    let object = binding.value;

    let useObject = object && true;

    el.addEventListener("mousedown", event => {
      if (store.state.selectedTool != "select") return
      if (!useObject) store.commit("selectObject", id);
      drag = true;
      dragged = false;
      let p = store.getters.getLocalPosition(event)
      let o = useObject ? object : store.getters.getObjectById(id)
      data = {
        x: o.x - p.x,
        y: o.y - p.y
      }
    })
    document.addEventListener("mousemove", event => {
      if (!drag) return
      dragged = true;
      let p = store.getters.getLocalPosition(event)
      if (useObject) {
        object.x = data.x + p.x
        object.y = data.y + p.y
      } else {
        store.commit("moveObject", {
          id,
          x: data.x + p.x,
          y: data.y + p.y,
        })
      }
    })
    document.addEventListener("mouseup", event => {
      if (dragged && !useObject) {
        store.commit("putObject", {id})
      }
      dragged = false;
      drag = false;
    })
    el.addEventListener("click", (event) => {
      event.stopPropagation()
    })
  }
}
