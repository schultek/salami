
import {rotate} from "@/functions.js"

export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id
    let mode = binding.arg
    let store = vnode.context.$store
    let drag = false, dragged = false;
    let data = {}

    let object = binding.value;
    let proportion = object ? object.proportion : false
    let useObject = object && object.x

    vnode.mousedown = event => {
      if (!useObject) store.commit("selectObject", id);
      drag = true;
      dragged = false;
      data = store.getters.getLocalPosition(event)
      let o = useObject ? object : store.getters.getObjectById(id)
      data.o = {...o};
      data.center = {x: o.x+o.w/2, y: o.y+o.h/2}
      data.pro = o.w/o.h

      event.stopPropagation();
    }

    vnode.mousemove = event => {
      if (!drag) return
      dragged = true;
      let p = store.getters.getLocalPosition(event)

      if (!useObject)
        object = store.getters.getObjectById(id)

      p = rotate(p, data.o, false);

      let start = {x: data.o.x, y: data.o.y};
      let end = {x: data.o.x+data.o.w, y: data.o.y+data.o.h};

      if (mode.includes("sx")) start.x = p.x;
      if (mode.includes("sy")) start.y = p.y;
      if (mode.includes("ex")) end.x   = p.x;
      if (mode.includes("ey")) end.y   = p.y;


      if (!proportion && event.shiftKey && (mode.length == 4)) {
        let h = (end.x-start.x)/data.pro;
        if (mode.includes("sy")) {
          start.y = end.y - h;
        } else {
          end.y = start.y + h
        }
      }

      if (event.altKey) {
        if (mode.includes("sy"))
          end.y = data.center.y + (data.center.y - start.y)
        if (mode.includes("sx"))
          end.x = data.center.x + (data.center.x - start.x)
        if (mode.includes("ey"))
          start.y = data.center.y + (data.center.y - end.y)
        if (mode.includes("ex"))
          start.x = data.center.x + (data.center.x - end.x)
      }

      if (proportion) {
        if (mode.includes("sx") || mode.includes("ex")) {
          let h = proportion(end.x - start.x, undefined)
          if (mode.includes("sy"))
            start.y = end.y - h;
          else
            end.y = start.y + h
        } else {
          let w = proportion(undefined, end.y - start.y)
          end.x = start.x + w;
        }
      }

      start = rotate(start, data.o, true);
      end = rotate(end, data.o, true);
      let mid = {x: (start.x+end.x)/2, y: (start.y+end.y)/2};
      start = rotate(start, data.o, false, mid);
      end = rotate(end, data.o, false, mid);

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

      if (useObject) {
        if (object.update)
          object.update({
            x: o.x, y: o.y,
            w: o.w, h: o.h
          })
        else {
          object.x = o.x; object.y = o.y;
          object.w = o.w; object.h = o.h;
        }
      } else {
        store.commit("resizeObject", o)
      }

    }

    vnode.mouseup = event => {
      if (dragged && !useObject)
        store.commit("putObject", {id})
      dragged = false;
      drag = false;
    }

    el.addEventListener("mousedown", vnode.mousedown);
    document.addEventListener("mousemove", vnode.mousemove);
    document.addEventListener("mouseup", vnode.mouseup);
  },
  unbind(el, binding, vnode) {
    if (vnode.mousedown) el.removeEventListener("mousedown", vnode.mousedown)
    if (vnode.mousemove) document.removeEventListener("mousemove", vnode.mousemove)
    if (vnode.mouseup) document.removeEventListener("mouseup", vnode.mouseup)
  }
}
