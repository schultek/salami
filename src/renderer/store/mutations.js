
import getters from "./getters.js"
import Vue from "vue"

function round(n, x) {
  return Math.round(n*x)/x
}

function updateDeep(toUpdate, object) {
  Object.keys(object).forEach(k => {
    if (typeof object[k] == "object") {
      if (!toUpdate[k]) Vue.set(toUpdate, k, {})
      updateDeep(toUpdate[k], object[k])
    } else
      Vue.set(toUpdate, k, object[k])
  })
}

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
  },
  translateProject(state, {x, y}) {
    state.project.x = x;
    state.project.y = y;
  },
  setProjectFile(state, file) {
    state.project.name = file.substring(file.lastIndexOf("/")+1, file.lastIndexOf("."));
    state.project.file = file;
  },
  buildProject(state, project) {
    state.project = project.project
    state.machine = project.machine
    state.objects = project.objects
    state.fonts = project.fonts
  },
  cleanProject(state) {
    state.objects = []
    state.selectedObject = null
  },

  /*****************
  OBJECT MODIFICATION
  *****************/

  updateObject(state, o) {
    if (o.id == "machine") {
      Object.keys(o).forEach(k => state.machine[k] = o[k])
    } else {
      if (o.rot) {
        while (o.rot < 0) o.rot += 360
        while (o.rot >= 360) o.rot -= 360
      }
      let orig = getters.getObjectById(state)(o.id)
      updateDeep(orig, o)
    }
  },
  moveObject(state, {id, x, y}) {
    let o = getters.getObjectById(state)(id)
    o.x = round(x, 10);
    o.y = round(y, 10);
  },
  rotateObject(state, {id, rot}) {
    let o = getters.getObjectById(state)(id)
    o.rot = round(rot, 10);
  },
  resizeObject(state, {id, x, y, w, h}) {
    let o = getters.getObjectById(state)(id)
    o.x = round(x,10);
    o.y = round(y,10);
    o.w = round(w,10);
    o.h = round(h,10);
  },
  updateLayerOrder(state, order) {
    let layers = state.objects.filter(getters.isSublayer(state))
    let rest = state.objects.filter(el => !getters.isSublayer(state)(el))
    state.objects = order.map(el => layers.find(l => l.id == el.id)).concat(rest)
  },
  addObject(state, object) {
    if (object.id && object.is) {
      state.objects.push(object)
      state.selectedObject = object.id
    }
  },
  removeObject(state, id) {
    let o = getters.getObjectById(state)(id)
    state.objects.splice(state.objects.indexOf(o), 1)
    if (o.is == "curve") {
      let curve = state.objects.find(el => el.is == "curve") || {id: ""}
      state.objects
        .filter(el => getters.isSublayerById(state)(el.id) && el.render.curve == o.id)
        .forEach(el => el.render.curve = curve.id)
    } else if (o.is == "image") {
      let image = state.objects.find(el => el.is == "image") || {id: ""}
      state.objects
        .filter(el => getters.isSublayerById(state)(el.id) && el.render.image == o.id)
        .forEach(el => el.render.image = image.id)
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
      let o = getters.getObjectById(state)(state.selectedObject)
      if (o.is == 'text')
        o.font = font.id
    }
  },

  /*****************
  OBJECT RENDERING
  *****************/

  setLineCountById(state, {id, lines}) {
    let object = getters.getObjectById(state)(id)
    if (getters.isSublayer(state)(object)) {
      object.render.lines.l = lines.l;
      object.render.lines.r = lines.r;
    }
  },
  setFillById(state, {id, fill}) {
    let object = getters.getObjectById(state)(id)
    if (getters.isSublayer(state)(object)) {
      Vue.set(object, "fill", fill);
    }
  },
  setPathById(state, {id, path}) {
    let o = state.paths.find(el => el.id == id)
    if (o)
      o.path = path
    else
      state.paths.push({id, path})
  },
  setGCodeById(state, {id, gcode}) {
    let o = state.gcodes.find(el => el.id == id)
    if (o)
      o.gcode = gcode
    else
      state.gcodes.push({id, gcode})
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
