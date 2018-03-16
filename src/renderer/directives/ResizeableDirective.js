
import {rotate} from "@/functions.js"

export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id
    let mode = binding.arg
    let store = vnode.context.$store
    let drag = false, dragged = false;
    let data = {}

    el.addEventListener("mousedown", event => {
      if (store.state.selectedTool != "select") return
      drag = true;
      dragged = false;
      data = store.getters.getLocalPosition(event)
      let obj = store.getters.getObjectById(id)
      data.pro = obj.w/obj.h

      event.stopPropagation();
    })

    document.addEventListener("mousemove", event => {
      if (!drag) return
      dragged = true;
      let p = store.getters.getLocalPosition(event)
      let object = store.getters.getObjectById(id)

      p = rotate(p, object, false);

      let start = {x: object.x, y: object.y};
      let end = {x: object.x+object.w, y: object.y+object.h};

      if (mode.includes("sy")) start.y = p.y;
      if (mode.includes("ex")) end.x = p.x;
      if (mode.includes("ey")) end.y = p.y;
      if (mode.includes("sx")) start.x = p.x;

      if (event.shiftKey && (mode.length == 4)) {
        let h = (end.x-start.x)/data.pro;
        if (mode.includes("sy")) {
          start.y = end.y - h;
        } else {
          end.y = start.y + h
        }
      }

      start = rotate(start, object, true);
      end = rotate(end, object, true);
      let mid = {x: (start.x+end.x)/2, y: (start.y+end.y)/2};
      start = rotate(start, object, false, mid);
      end = rotate(end, object, false, mid);

      let o = {
        id: object.id,
        x: start.x, y: start.y,
        w: end.x-start.x,
        h: end.y-start.y
      }

      if (o.w < 0) {
        o.x += o.w;
        o.w *= -1;
        mode = mode.replace(/sx/g, "tx").replace(/ex/g, "sx").replace(/tx/g, "ex");
      }
      if (o.h < 0) {
        o.y += o.h;
        o.h *= -1;
        mode = mode.replace(/sy/g, "ty").replace(/ey/g, "sy").replace(/ty/g, "ey");
      }

      store.commit("resizeObject", o)
    })

    document.addEventListener("mouseup", event => {
      if (dragged)
        store.commit("putObject", {id})
      drag = false;
    })
  }
}
