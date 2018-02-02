
export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id;
    let store = vnode.context.$store;
    let drag = false;
    let data = {}

    el.addEventListener("mousedown", event => {
      if (store.state.selectedTool != "select") return
      drag = true;

      let p = store.getters.getLocalPosition(event)
      let object = store.getters.getObjectById(id)
      let m = {
        x: object.x + (object.w || 0) / 2,
        y: object.y + (object.h || 0) / 2
      }

      data = {
        rot: Math.atan2(m.y-p.y, m.x-p.x)*360/Math.PI/2-object.rot
      }

      event.stopPropagation();
    })
    document.addEventListener("mousemove", event => {
      if (!drag) return

      let p = store.getters.getLocalPosition(event)
      let object = store.getters.getObjectById(id)
      let m = {
        x: object.x + (object.w || 0) / 2,
        y: object.y + (object.h || 0) / 2
      }

      store.commit("rotateObject", {
        id,
        rot: Math.atan2(m.y-p.y, m.x-p.x)*360/Math.PI/2-data.rot
      })
    })
    document.addEventListener("mouseup", event => {
      if (drag)
        store.commit("putObject", {id})
      drag = false;
    })
  }
}
