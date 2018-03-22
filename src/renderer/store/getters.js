
import $ from "jquery"

import {getNewId, getMaxLength} from "@/functions.js"

import {CPart, Form, Layer, Image, Text, Machine, Renderer, HalftoneRenderer, StippleRenderer, RenderParams, Font} from "@/models.js"

export default {

  /*****************
      PROJECT
  *****************/

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
      layers: state.layers.map(o => o.toObj()),
      images: state.images.map(o => o.toObj()),
      renderer: state.renderer.map(o => o.toObj()),
      texts: state.texts.map(o => {
        let text = o.toObj()
        let font = state.fonts.find(el => el.id == text.font)
        if (font && !font.custom) text.font = font.title
        return text;
      }),
      fonts: state.fonts.filter(f => f.custom).map(o => o.toObj()),
      machine: state.machine.toObj()
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
    let images = state.images.map(o => o.toObj())
    let layers = state.layers.map(o => o.toObj())
    let renderer = state.renderer.map(o => o.toObj())
    let texts = state.texts.map(o => o.toObj())
    let fonts = state.fonts.filter(f => f.custom).map(f => f.toObj())

    let o = {
      title: "Layout " + (state.layouts.length + 1),
      template: {
        layers, images, renderer, texts, fonts,
        machine: state.machine.toObj()
      }
    }
    return o;
  },

  /*****************
      OBJECTS
  *****************/

  getObjectById(state, getters) {
    return (id) => {
      if (id == 'machine') return state.machine
      let arr = getters.getObjectArrayById(id)
      if (arr)
        return arr.find(el => el.id == id);
    }
  },
  getObjectArrayById(state) {
    return (id) => {
      if (state.layers.find(el => el.id == id)) return state.layers
      else if (state.images.find(el => el.id == id)) return state.images
      else if (state.texts.find(el => el.id == id)) return state.texts
      else if (state.renderer.find(el => el.id == id)) return state.renderer
      else if (state.fonts.find(el => el.id == id)) return state.fonts
    }
  },
  getObjectTypeById(state, getters) {
    return (id) => {
      let o = getters.getObjectById(id);
      if (o instanceof CPart)    return "cpart"
      if (o instanceof Form)     return "form"
      if (o instanceof Renderer) return "renderer"
      if (o instanceof Image)    return "image"
      if (o instanceof Machine)  return "machine"
      if (o instanceof Text)     return "text"
      if (o instanceof Font)     return "font"
    }
  },
  isLayerById(state, getters) {
    return (id) => {
      let o = getters.getObjectById(id)
      return o instanceof Layer
    }
  },
  getNewObjectByType(state, getters) {
    return (type, o) => {

      if (!o) o = {}

      if (["cpart", "ellipse", "rect"].indexOf(type) >= 0) {
        if (!("renderParams" in o) || o.renderParams.length == 0)
          o.renderParams = [new RenderParams()]
        o.renderParams.forEach(p => {
          if (!p.renderer) p.renderer = (state.renderer[0] || {id: null}).id
          if (!p.image)    p.image    = (state.images[0] || {id: null}).id
          p = new RenderParams(p)
        })
      }

      if (["cpart", "image"].indexOf(type) >= 0) {
        if (!("w" in o)) o.w = state.machine.w
        if (!("h" in o)) o.h = state.machine.h
      }

      if (type == "text") {
        if (!("font" in o)) {
          if (state.fonts.length == 0)
            console.warn("Fonts should not be empty!")
          else
            o.font = state.fonts[0].id
        }
      }

      if (!o.title && type != "font") {
        let arr = type == "cpart" ? state.layers.filter(l => l instanceof CPart) :
                  type == "rect" || type == "ellipse" ? state.layers.filter(l => l instanceof Form && l.type == type) :
                  type == "image" ? state.images :
                  type == "halftone" || type == "stipple" ? state.renderer :
                  type == "text" ? state.texts : []

        let n = arr.length+1
        let name = type == "cpart" ? "layer" : type;
        o.title = name.charAt(0).toUpperCase() + name.slice(1) + " " + n
      }

      switch (type) {
        case "cpart": return new CPart(o)
        case "ellipse": return new Form({...o, type: "ellipse"})
        case "rect": return new Form({...o, type: "rect"})
        case "image": return new Image(o)
        case "halftone": return new HalftoneRenderer(o)
        case "stipple": return new StippleRenderer(o)
        case "text": return new Text(o)
        case "font": return new Font(o)
        default: throw new Error(`Object of type ${type} not supported!`)
      }
    }
  },
  getRenderingPairById(state, getters) {
    return (pId) => {
      for (let layer of state.layers) {
        let params = layer.renderParams.find(p => p.id == pId)
        if (params) {
          if (layer instanceof Form && !layer.ownRenderer) return {};
          return {object: layer, renderParams: params}
        }
      }
      return {}
    }
  },
  getRenderingIds(state, getters) {
    return (id) => {
      let o = getters.getObjectById(id)
      let toRender = []
      if (o instanceof Layer && o.isRendering())
        o.renderParams.forEach(p => toRender.push(p.id))
      if (o instanceof Renderer)
        state.layers
          .filter(el => el.isRendering())
          .forEach(l => l.renderParams
            .filter(p => p.renderer == o.id)
            .forEach(p => toRender.push(p.id))
          )
      if (o instanceof Image)
        state.layers
          .filter(el => el.isRendering())
          .forEach(l => l.renderParams
            .filter(p => p.image == o.id)
            .forEach(p => toRender.push(p.id))
          )
      if (o instanceof Form) {
        let i = state.layers.indexOf(o);
        state.layers
          .filter(el => el.isRendering())
          .filter(el => state.layers.indexOf(el) < i)
          .forEach(l => l.renderParams
            .filter(p => !p.ignoreForms.find(f => f.id == o.id))
            .forEach(p => toRender.push(p.id))
          )
      }
      if (o instanceof Machine || o instanceof Text)
        state.layers
          .filter(o => o.isRendering)
          .forEach(l => l.renderParams.forEach(p =>
            toRender.push(p.id)
          ))
      return toRender;
    }
  },
  getRenderParams(state, getters) {
    return (id, pId) => {
      let p, o = getters.getObjectById(id)
      if (o)
        p = o.renderParams.find(p => p.id == pId);
      return p
    }
  },

  /*****************
        MISC
  *****************/

  getMaxLength(state) {
    return (id) => {
      let renderer = state.renderer.find(el => el.id == id)
      if (!(renderer instanceof HalftoneRenderer)) throw new Error("Object with id "+id+" isn't a HalftoneRenderer")
      return getMaxLength(renderer)
    }
  },
  isSidebarOpen(state) {
    return state.selectedObject || state.quickMode;
  }
}
