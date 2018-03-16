
import gets from "./getters.js"
import Vue from "vue"

import {round} from "@/functions.js"
import {Machine, CPart, Layer, Text, Form, Renderer, Image} from "@/models.js"

let getters = new Proxy(gets, {
  get(target, prop) {
    return function(state, ...args) {

      let subproxy = new Proxy(target, {
        get: (subtarget, subprop) => subtarget[subprop](state, subproxy)
      })

      let result = target[prop](state, subproxy)
      if (typeof result === "function") {
        return result(...args)
      } else {
        return result
      }
    }
  }
})

export default {

  /*****************
  APP STATUS
  *****************/

  setQuickMode(state, q) {
    state.quickMode = q
  },
  setFullPreview(state, p) {
    state.fullPreview = p
  },
  selectObject(state, id) {
    state.selectedObject = id
  },
  setSubLayersOpen(state, open) {
    state.subLayersOpen = open
  },
  selectLayout(state, id) {
    state.selectedLayout = id
  },
  selectTool(state, tid) {
    state.selectedTool = tid
    state.tools.filter(t => t.tools).forEach(t => {
      if (t.tools.find(el => el.id == tid)) t.selected = tid
    })
  },
  switchNavigationPanel(state, n) {
    state.navigationPanel = n
  },
  setProgress(state, p) {
    state.progress = p;
  },
  setCentered(state, c) {
    state.centered = c;
  },

  /*****************
  PROJECT SETTINGS
  *****************/

  zoomProject(state, zoom) {
    state.project.zoom = zoom
    state.centered = false;
  },
  translateProject(state, {x, y}) {
    state.project.x = x;
    state.project.y = y;
    state.centered = false;
  },
  setProjectFile(state, file) {
    state.project.name = file.substring(file.lastIndexOf("/")+1, file.lastIndexOf("."));
    state.project.file = file;
  },
  buildProject(state, project) {
    state.project = project.project
    state.machine = new Machine(project.machine)
    state.layers = project.layers.map(o => new Layer(o))
    state.images = project.images.map(o => new Image(o))
    state.renderer = project.renderer.map(o => Renderer.fromObj(o))
    state.texts = project.texts.map(o => new Text(o))
    state.fonts = project.fonts
  },
  cleanProject(state) {
    state.layers = []
    state.images = []
    state.renderer = []
    state.texts = []
    state.selectedObject = null
  },

  /*****************
  OBJECT MODIFICATION
  *****************/

  updateObject(state, o) {
    let orig = getters.getObjectById(state, o.id)
    orig.update(o)
  },
  moveObject(state, {id, x, y}) {
    let o = getters.getObjectById(state, id)
    o.x = round(x, 10);
    o.y = round(y, 10);
  },
  rotateObject(state, {id, rot}) {
    let o = getters.getObjectById(state, id)
    while (rot < 0) rot += 360
    while (rot > 360) rot -= 360
    o.rot = round(rot, 10);
  },
  resizeObject(state, {id, x, y, w, h}) {
    let o = getters.getObjectById(state, id)
    o.x = round(x,10); o.y = round(y,10);
    o.w = round(Math.max(w, 0),10); o.h = round(Math.max(h, 0),10);
  },
  updateLayerOrder(state, order) {
    state.layers = order.map(el => state.layers.find(l => l.id == el.id))
  },
  addObject(state, object) {
    if (object instanceof Layer) {
      state.layers.push(object)
    } else if (object instanceof Image) {
      state.images.push(object)
    } else if (object instanceof Renderer) {
      state.renderer.push(object)
    } else if (object instanceof Text) {
      state.texts.push(object)
    } else {
      throw new Error(`Object is not supported!`, object)
    }
  },
  removeObject(state, id) {
    let o = getters.getObjectById(state, id)
    let arr = getters.getObjectArrayById(state, id)
    arr.splice(arr.indexOf(o), 1)
    if (o instanceof Renderer) {
      state.layers.forEach(el => el.renderParams = el.renderParams.filter(p => p.renderer != o.id))
    } else if (o instanceof Image) {
      let image = state.images.length <= 1 ? {id: ""} : state.images.find(i => i.id != o.id)
      state.layers.forEach(el => el.renderParams
        .filter(p => p.image == o.id)
        .forEach(p => p.image = image.id)
      )
    } else if (o instanceof Form) {
      state.layers
        .forEach(l => l.renderParams.forEach(p => {
          if (p.ignoreForms.indexOf(o.id)) {
            p.ignoreForms.splice(p.ignoreForms.indexOf(o.id), 1)
          }
        }))
    }
  },

  /*****************
  LAYOUT MODIFICATION
  *****************/

  addLayout(state, l) {
    if (l.id) state.layouts.push(l);
  },
  removeLayout(state, id) {
    let layout = state.layouts.find(el => el.id == id)
    if (!layout) return
    state.layouts.splice(state.layouts.indexOf(layout), 1)
  },
  setLayoutTitle(state, {id, title}) {
    let layout = state.layouts.find(l => l.id == id)
    if (!layout) return
    layout.title = title;
  },

  /*****************
  FONT MODIFICATION
  *****************/

  addFont(state, font) {
    state.fonts.push(font)
    if (state.selectedObject) {
      let o = getters.getObjectById(state, state.selectedObject)
      if (o instanceof Text)
        o.font = font.id
    }
  },

  /*****************
  OBJECT RENDERING
  *****************/

  addRenderParams(state, {id, params}) {
    let o = getters.getObjectById(state, id)
    o.renderParams.push(params);
  },
  removeRenderParams(state, {id, pId}) {
    let o = getters.getObjectById(state, id)
    let p = o.renderParams.find(p => p.id == pId);
    o.renderParams.splice(o.renderParams.indexOf(p), 1)
  },
  updateRenderParams(state, {id, params}) {
    let p = getters.getRenderParams(state, id, params.id)
    p.update(params)
  },
  setIgnoredForms(state, {id, pId, forms}) {
    let p = getters.getRenderParams(state, id, pId)
    p.ignoreForms = forms
  },
  setRenderResult(state, {id, params}) {
    let p = getters.getRenderParams(state, id, params.id)
    p.update(params)
  },
  setSVGPathById(state, {id, path}) {
    let o = getters.getObjectById(state, id)
    if (o)
      Vue.set(o, "path", path)
    else throw new Error("Object for Path could not be found")
  },
  setGCodeById(state, {id, gcode}) {
    let o = getters.getObjectById(state, id)
    if (o)
      Vue.set(o, "gcode", gcode)
    else throw new Error("Object for GCode could not be found")
  },

  /*****************
  MISC
  *****************/

  setDefaultImageData(state, data) {
    state.imgDefault.data = data;
  },
  putObject(state, id) {
    //Buffer Mutation for Plugins
  }
}
