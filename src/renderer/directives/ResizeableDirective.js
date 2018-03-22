
import {rotate} from "@/functions.js"

import Snapping from "@/includes/Snapping"

export default {
  bind(el, binding, vnode) {
    let id = vnode.context.id
    let mode = binding.arg
    let store = vnode.context.$store
    let drag = false, dragged = false;
    let data = {}

    let object = binding.value;
    let proportion = object ? object.proportion : false
    let useObject = object && object.x !== undefined

    vnode.mousedown = event => {
      if (!useObject) store.commit("selectObject", id);
      drag = true;
      dragged = false;
      data = store.getters.getLocalPosition(event)
      let o = useObject ? object : store.getters.getObjectById(id)
      data.o = {...o};
      data.center = {x: o.x+o.w/2, y: o.y+o.h/2}
      data.pro = o.w/o.h || 1

      event.stopPropagation();
    }

    vnode.mousemove = event => {
      if (!drag) return
      dragged = true;
      let p = store.getters.getLocalPosition(event)

      p = rotate(p, data.o, false);

      let start = {x: data.o.x, y: data.o.y};
      let end = {x: data.o.x+data.o.w, y: data.o.y+data.o.h};

      if (mode.includes("sx")) start.x = p.x;
      if (mode.includes("sy")) start.y = p.y;
      if (mode.includes("ex")) end.x   = p.x;
      if (mode.includes("ey")) end.y   = p.y;

      let setW, setH

      let getW = () => end.x - start.x
      let getH = () => end.y - start.y

      if (event.altKey) {
        setW = (w) => {
          start.x = data.center.x - w/2
          end.x = data.center.x + w/2
        }
        setH = (h) => {
          start.y = data.center.y - h/2
          end.y = data.center.y + h/2
        }
        if (mode.includes("sy"))
          getH = () => (data.center.y - start.y) * 2
        if (mode.includes("sx"))
          getW = () => (data.center.x - start.x) * 2
        if (mode.includes("ey"))
          getH = () => (end.y - data.center.y) * 2
        if (mode.includes("ex"))
          getW = () => (end.x - data.center.x) * 2
      } else {
        setW = (w) => mode.includes("sx") ? start.x = end.x - w : end.x = start.x + w
        setH = (h) => mode.includes("sy") ? start.y = end.y - h : end.y = start.y + h
      }

      if (proportion) {
        let set_w = setW, set_h = setH
        setW = (w) => {
          set_w(w);
          let h = proportion(getW(), undefined)
          set_h(h)
        }
        setH = (h) => {
          set_h(h)
          let w = proportion(undefined, getH())
          set_w(w)
        }
      } else if (event.shiftKey && (mode.length == 4)) {
        let set_w = setW, set_h = setH
        setW = (w, force) => {
          let w_ = getH()*data.pro;
          if (force || w_ < w) {
            set_w(w)
            let h_ = getW()/data.pro;
            set_h(h_)
          } else {
            set_w(w_)
          }
        }
        setH = (h, force) => {
          let h_ = getW()/data.pro;
          if (force || h_ < h) {
            set_h(h)
            let w_ = getH()*data.pro;
            set_w(w_)
          } else {
            set_h(h_)
          }
        }
      }

      setW(getW())
      setH(getH())

      if (!event.ctrlKey) {
        let snapping = Snapping.get(data.o.id, start, end)
        let startSnap = snapping.start, endSnap = snapping.end
        let s = {...start}, e = {...end}
        if (event.altKey) {
          if (mode.includes("x")) {
            if (startSnap.x == s.x && endSnap.x != e.x) {
              setW((endSnap.x - data.center.x) * 2, true)
            } else if (endSnap.x == e.x && startSnap.x != s.x) {
              setW((data.center.x - startSnap.x) * 2, true)
            } else if (endSnap.x != e.x) {
              if (Math.abs(s.x - startSnap.x) < Math.abs(e.x - endSnap.x)) {
                setW((data.center.x - startSnap.x) * 2, true)
              } else {
                setW((endSnap.x - data.center.x) * 2, true)
              }
            }
          }
          if (mode.includes("y")) {
            if (startSnap.y == s.y && endSnap.y != e.y) {
              setH((endSnap.y - data.center.y) * 2, true)
            } else if (endSnap.y == e.y && startSnap.y != s.y) {
              setH((data.center.y - startSnap.y) * 2, true)
            } else if (endSnap.y != e.y) {
              if (Math.abs(s.y - startSnap.y) < Math.abs(e.y - endSnap.y)) {
                setH((data.center.y - startSnap.y) * 2, true)
              } else {
                setH((endSnap.y - data.center.y) * 2, true)
              }
            }
          }
        } else {
          if (mode.includes("sy") && startSnap.y != s.y)
            setH(e.y - startSnap.y, true)
          if (mode.includes("sx") && startSnap.x != s.x)
            setW(e.x - startSnap.x, true)
          if (mode.includes("ey") && endSnap.y != e.y)
            setH(endSnap.y - s.y, true)
          if (mode.includes("ex") && endSnap.x != e.x)
            setW(endSnap.x - s.x, true)
        }
      }

      start = rotate(start, data.o, true);
      end = rotate(end, data.o, true);
      let mid = {x: (start.x+end.x)/2, y: (start.y+end.y)/2};
      start = rotate(start, data.o, false, mid);
      end = rotate(end, data.o, false, mid);

      let o = {
        id: data.o.id,
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
      Snapping.close()
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
