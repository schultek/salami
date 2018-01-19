
import Vue from "vue"
import $ from "jquery"


Vue.directive('dragable', {
  bind(el, binding, vnode) {
    let id = vnode.context.id;
    let store = vnode.context.$store;
    let drag = false;
    let data = {}

    el.addEventListener("mousedown", event => {
      store.commit("selectObject", id);
      drag = true;
      let p = store.getters.getLocalPosition(event)
      let o = store.getters.getObjectById(id)
      data = {
        x: o.x - p.x,
        y: o.y - p.y
      }
    })
    document.addEventListener("mousemove", event => {
      if (!drag) return
      let p = store.getters.getLocalPosition(event)
      store.commit("moveObject", {
        id,
        x: data.x + p.x,
        y: data.y + p.y,
      })
    })
    document.addEventListener("mouseup", event => {
      drag = false;
    })
  }
})

Vue.directive('resizeable', {
  bind(el, binding, vnode) {
    let id = vnode.context.id
    let mode = binding.arg
    let store = vnode.context.$store
    let drag = false
    let data = {}

    el.addEventListener("mousedown", event => {
      drag = true;
      data = store.getters.getLocalPosition(event)
      let obj = store.getters.getObjectById(id)
      data.prop = obj.w/obj.h

      event.stopPropagation();
    })

    document.addEventListener("mousemove", event => {
      if (!drag) return
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

      object.x = start.x;
      object.y = start.y;
      object.w = end.x-start.x;
      object.h = end.y-start.y;

      if (object.w < 0) {
        object.x += object.w;
        object.w *= -1;
        mode = mode.replace(/sx/g, "tx").replace(/ex/g, "sx").replace(/tx/g, "ex");
      }
      if (object.h < 0) {
        object.y += object.h;
        object.h *= -1;
        mode = mode.replace(/sy/g, "ty").replace(/ey/g, "sy").replace(/ty/g, "ey");
      }

      store.commit("resizeObject", object)
    })

    document.addEventListener("mouseup", event => {
      drag = false;
    })
  }
})



Vue.directive('rotateable', {
  bind(el, binding, vnode) {
    let id = vnode.context.id;
    let store = vnode.context.$store;
    let drag = false;
    let data = {}

    el.addEventListener("mousedown", event => {
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
      drag = false;
    })
  }
})

Vue.directive("zoomable", {
  bind(el, binding, vnode) {
    let store = vnode.context.$store;

    el.addEventListener("mousewheel", event => {

      if (event.ctrlKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var p = store.getters.getLocalPosition(event);

        let zoom = store.state.project.zoom - event.deltaY/20;

        if (zoom < 0.1) zoom = 0.1;
        if (zoom > 20) zoom = 20;

        let x = event.x-(p.x*zoom)-$(el).position().left;
        let y = event.y-(p.y*zoom)-$(el).position().top;

        store.commit("translateProject", {x, y})
        store.commit("zoomProject", zoom)
      } else {
        store.commit("translateProject", {
          x: store.state.project.x - event.deltaX/2,
          y: store.state.project.y - event.deltaY/2
        })
      }

    })
  }
})

Vue.directive("blur", {
  bind(el) {
    el.addEventListener("keyup", event => {
      if (event.key == "Enter") {
        el.blur()
        event.preventDefault()
      }
    })
  }
})
