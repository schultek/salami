
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
  setAutoAdjustMachine(state, a) {
    state.project.autoAdjustMachine = a
  },
  selectTool(state, tid) {
    state.selectedTool = tid
  },
  switchNavigationPanel(state, n) {
    state.navigationPanel = n
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
  adjustMachine(state, {x, y, w, h}) {
    state.machine.x = round(x,10);
    state.machine.y = round(y,10);
    state.machine.w = round(w,10);
    state.machine.h = round(h,10);
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
    let objects = getters.getObjectsByType(state)
    let layers = order.map(el => objects.layers.find(e => e.id == el.id))
    state.objects = layers.concat(objects.curves).concat(objects.images).concat(objects.texts)
  },
  addObject(state, object) {
    if (object.id && object.is)
      state.objects.push(object)
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

  setLineCountById(state, {id, lineCount}) {
    if (getters.isSublayerById(state)(id)) {
      let object = getters.getObjectById(state)(id)
      object.render.lines.l = lineCount.l;
      object.render.lines.r = lineCount.r;
    }
  },
  setFillById(state, {id, fill}) {
    if (getters.isSublayerById(state)(id)) {
      let object = getters.getObjectById(state)(id)
      Vue.set(object, "fill", fill);
    }
  },
  setImagePixels(state, {id, pixels}) {
    state.pixels[id] = pixels //don't trigger reactiveness
  },
  setTextPath(state, o) {
    state.paths.text.push(o)
  },
  setCPartPath(state, o) {
    state.paths.cpart.push(o)
  },
  setCurvePaths(state, o) {
    state.paths.curve.push(o)
  },
  setTextGCode(state, o) {
    state.gcodes.text.push(o)
  },
  setCPartGCode(state, o) {
    state.gcodes.cpart.push(o)
  },
  registerWorker(state, {id, terminate, wid}) {
    let worker = {id, terminate, progress: 0, wid};
    let old = getters.getWorkerById(state)(id)
    if (old) {
      old.terminate(wid);
      state.workers.splice(state.workers.indexOf(worker), 1)
    }
    state.workers.push(worker)
  },
  unregisterWorker(state, {id, wid}) {
    let worker = getters.getWorkerById(state)(id, wid)
    if (worker) {
      worker.terminate(wid)
      state.workers.splice(state.workers.indexOf(worker), 1)
    }
  },
  updateWorkerProgress(state, {id, progress}) {
    let worker = getters.getWorkerById(state)(id)
    if (worker) worker.progress = progress
  },

  /*****************
  MISC
  *****************/

  setDefaultImageData(state, data) {
    state.imgDefault.data = data;
  }
}
