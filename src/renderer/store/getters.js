
import $ from "jquery"

let {getMaxLength} = require("../workers/renderfunctions.js")

export default {

  /*****************
      PROJECT
  *****************/

  getProgress(state) {
    return state.workers.reduce((sum, w) => sum + w.progress, 0) / state.workers.length
  },
  getLocalPosition(state) {
    return (p) => {
      let svg = $("#svg").position();
      return {
        x: Math.round((p.x - state.project.x - svg.left) / state.project.zoom * 10) / 10,
        y: Math.round((p.y - state.project.y - svg.top ) / state.project.zoom * 10) / 10
      }
    }
  },
  getQuickProject(state) {
    return {
      w: state.machine.w,
      h: state.machine.h,
      detail: state.machine.bit.inDepth
    }
  },
  getJsonFromProject(state) {
    let o = {
      project: state.project,
      objects: state.objects.map(cleanObject),
      fonts: state.fonts.map(cleanFont),
      machine: state.machine,
    }
    return JSON.stringify(o);
  },
  getSVGFromProject(state) {
    return () => {
      let svg = $("#svg").clone()[0];
      svg.setAttribute("viewBox", "0 0 " + state.machine.w + " " + state.machine.h);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svg.childNodes[1].attributes.removeNamedItem("transform");
      return svg.outerHTML
      //TODO fix all display bugs
    }
  },

  /*****************
      LAYOUT
  *****************/

  getLayoutFromProject(state) {
    let images = state.objects
      .filter(o => o.is == "image")
      .map(cleanObject)
    let curves = state.objects
      .filter(o => o.is == "curve")
      .map(cleanObject)
    let layers = state.objects
      .filter(o => o.is == "cpart" || o.is == "form")
      .map(cleanObject)
    let o = {
      title: "Layout " + (state.layouts.length + 1),
      template: {
        layers, images, curves,
        fonts: state.fonts.map(cleanFont),
        machine: JSON.parse(JSON.stringify(state.machine))
      }
    }
    return o;
  },

  /*****************
      OBEJCTS
  *****************/

  getObjectById(state) {
    return (id) => {
      if (id == 'machine') return state.machine
      let o = state.objects.find(el => el.id == id);
      if (!o) throw new Error("Object with id "+id+" not found")
      return o;
    }
  },
  getObjectsByType(state) {
    return state.objects.reduce((objects, o) => {
      if (o.is == "cpart" || o.is == "form") objects.layers.push({id: o.id, is: o.is, icon: o.icon, title: o.title})
      else if (o.is == "curve") objects.curves.push({id: o.id, title: o.title})
      else if (o.is == "image") objects.images.push({id: o.id, title: o.title})
      else if (o.is == "text") objects.texts.push({id: o.id, title: o.title})
      else throw new Error("Object of unknown type: "+o.is);
      return objects
    }, {layers: [], images: [], texts: [], curves: []})
  },
  isSublayer(state, getters) {
    return (o) => {
      return o.is == 'cpart' || o.is == 'form'
    }
  },
  isSublayerById(state, getters) {
    return (id) => {
      let o = getters.getObjectById(id)
      return getters.isSublayer(o)
    }
  },
  getNewObjectByType(state) {
    return (type, o) => {

      let def = {
        id: getNewId(),
        x: 0, y: 0, w: state.machine.w, h: state.machine.h
      }

      let {id, x, y, w, h} = o ? {
        id: o.id || def.id,
        x: o.x || def.x, y: o.y || def.y,
        w: o.w || def.w, h: o.h || def.h
      } : def

      let rot = 0

      let render = {
        curve: (state.objects.filter(el => el.is == "curve")[0] || {id: null}).id,
        image: (state.objects.filter(el => el.is == "image")[0] || {id: null}).id,
        lines: {l: 10, r: 10}, dotted: false, refinedEdges: 100, smooth: 50
      }

      let n = state.objects.filter(el => el.is == (type == "rect" || type == "ellipse" ? "form" : type)).length+1

      switch (type) {
        case "cpart": return {
          id, is: "cpart", x, y, w, h,
          title: "Part " + n, render, inverted: false,
          border: {left: 0, right: 0, top: 0, bottom: 0}
        }
        case "image": return {
          id, is: "image", x, y, w, h, rot,
          title: "Image " + n,
        }
        case "curve": return {
          id, is: "curve", x, y, title: "Curve " + n,
          type: "Linie", direction: 45, stretch: 80, gap: 2, steps: 400
        }
        case "rect": return {
          id, is: "form", x, y, w, h, rot, title: "Form " + n,
          type: "rect", render, mask: false, ownRenderer: false
        }
        case "ellipse": return {
          id, is: "form", x, y, w, h, rot, title: "Form " + n,
          type: "ellipse", render, mask: false, ownRenderer: false
        }
        case "text": return {
          id, is: "text", x, y, rot, stroke: 1, size: 12,
          title: "Text " + n
        }
        default: throw new Error("Unsupported type "+type)
      }
    }
  },
  getImagePixelsById(state) {
    return (id) => state.pixels[id]
  },
  getCPartPathById(state) {
    return (id) => {
      let o = state.paths.cpart.find(el => el.id == id)
      if (o) return o.path
    }
  },
  getCurvePathsById(state) {
    return (id) => {
      let o = state.paths.curve.find(el => el.id == id)
      if (o) return o.paths
    }
  },
  getTextPathById(state) {
    return (id) => {
      let o = state.paths.text.find(el => el.id == id)
      if (o) return o.path
    }
  },

  /*****************
      RENDERING
  *****************/

  getWorkerById(state) {
    return (id, wid) => {
      if (wid) return state.workers.find(el => el.id == id && el.wid == wid)
      else return state.workers.find(el => el.id == id)
    }
  },

  /*****************
        MISC
  *****************/

  getTimeString(state) {
    return (time) => {
      var h = Math.floor(time/60);
      var m = Math.round(time - h*60);
      return (h>0?h+"h ":"")+m+"m";
    }
  },
  getNewId(state) {
    return getNewId
  },
  getMaxLength(state) {
    return (id) => {
      let curve = state.objects.find(el => el.id == id)
      if (curve.is != curve) throw new Error("Object with id "+id+" isn't a curve")
      return getMaxLength(curve, state.machine)
    }
  },
  getCleanObject(state) {
    return cleanObject
  }
}

function cleanObject(o) {
  let d1 = ["x", "y", "title"]
  let d2 = d1.concat(["w", "h"])
  let d3 = d2.concat(["rot"])
  return (o) => {
    switch (o.is) {
      case "cpart": return withProps(o, [...d2, "border", "render"])
      case "form": return withProps(o, [...d3, "title", "type", "render", "mask", "ownRenderer"])
      case "image": return withProps(o, [...d3, "url"])
      case "curve": return withProps(o, [...d1, "type", "direction", "stretch", "gap", "steps"])
      case "text": return withProps(o, [...d1, "rot", "stroke", "size", "font"])
    }
  }
}

function cleanFont(o) {
  return withProps(o, ["id", "file", "title"])
}

function withProps(o, props) {
  let new_o = {};
  for (let p of props) {
    new_o[p] = o[p]
  }
  return new_o
}

function getNewId() {
  return [0,0].reduce((str) => {
    let a = str + (str != "" ? "-" : "");
    let b = [0,0,0].reduce((str) => {
      let c = Math.round(Math.random()*62)
      return str + (c < 52 ? String.fromCharCode(c < 26 ? 65 + c : 71 + c) : (c - 52))
    }, "")
    return a+b;
  }, "")
}
