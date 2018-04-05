
import Snapping from "@/includes/Snapping.js"

export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id;
    let store = vnode.context.$store;
    let drag = false, dragged = false
    let data = {}

    let snap = !binding.modifiers.nosnap
    let pointSnap = binding.modifiers.point

    let object = binding.value;
    let useObject = object && true;

    el.addEventListener("mousedown", event => {
      if (!useObject) store.commit("selectObject", id);
      drag = true;
      dragged = false;
      let p = store.getters.getLocalPosition(event)
      let o = useObject ? object : store.getters.getObjectById(id)
      data = {
        x: o.x - p.x,
        y: o.y - p.y,
        o
      }
      event.stopPropagation();
    })
    document.addEventListener("mousemove", event => {
      if (!drag) return
      dragged = true;
      let p = store.getters.getLocalPosition(event)

      let o = {x: data.x + p.x, y: data.y + p.y}

      if (snap && !event.ctrlKey) {
        if (pointSnap) {
          let point = Snapping.getPoint(id, o)
          o.x = point.x
          o.y = point.y
        } else {
          let {start, end} = Snapping.get(id, o, {x: o.x + data.o.w, y: o.y + data.o.h})

          if (start.x == o.x) {
            o.x = end.x - data.o.w
          } else if (end.x == o.x + data.o.w) {
            o.x = start.x
          } else {
            if (Math.abs(start.x - o.x) < Math.abs(end.x - (o.x + data.o.w))) {
              o.x = start.x
            } else {
              o.x = end.x - data.o.w
            }
          }

          if (start.y == o.y) {
            o.y = end.y - data.o.h
          } else if (end.y == o.y + data.o.h) {
            o.y = start.y
          } else {
            if (Math.abs(start.y - o.y) < Math.abs(end.y - (o.y + data.o.h))) {
              o.y = start.y
            } else {
              o.y = end.y - data.o.h
            }
          }
        }
      }

      if (useObject) {
        if (object.update)
          object.update(o)
        else {
          object.x = o.x
          object.y = o.y
        }
      } else {
        store.commit("moveObject", {
          id, x: o.x, y: o.y
        })
      }
    })
    document.addEventListener("mouseup", event => {
      if (dragged) {
        if (!useObject)
          store.commit("putObject", {id})
        else if (object.put)
          object.put()
        event.stopPropagation()
      }
      dragged = false;
      drag = false;
      Snapping.close()
    }, true)
    el.addEventListener("click", (event) => {
      event.stopPropagation()
    })
  }
}
