import opentype from "opentype.js"
import $ from "jquery"
import base64 from "base64-img"
import fs from "mz/fs"
import {remote} from "electron"
import WorkerHandler from "../workers/WorkerHandler.js"

let getPixels = require("get-pixels");

let {updateDeep} = require("../workers/renderfunctions.js")
import makeCurvePaths from "../workers/curvepaths.js"

let dialog = remote.dialog

function showOpenDialog(options) {
  return new Promise((resolve, reject) => {
    dialog.showOpenDialog(options, files => {
      if (files && files[0]) resolve(files[0])
      else resolve(null)
    })
  })
}

function showSaveDialog(options) {
  return new Promise((resolve, reject) => {
    dialog.showSaveDialog(options, resolve)
  })
}

function getPixelsOfImage(url) {
  return new Promise((resolve, reject) => {
    getPixels(url, (err, pixels) => {
      if (err) reject(err)
      resolve(pixels)
    })
  })
}


function getDataURL(url) {
  return new Promise((resolve, reject) => {
    base64.base64(url, (err, data) => {
      if (err) reject(err);
      resolve(data);
    })
  })
}


function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function loadOpentypeFont(file) {
  return new Promise((resolve, reject) => {
    opentype.load(file, (err, font) => {
      if (err) reject(err)
      resolve(font)
    })
  })
}

export default {

  /*****************
        APP
  *****************/

  async init({commit, state, dispatch, getters}) {
    let promises = [getDataURL(state.imgDefault.url).then(data => commit("setDefaultImageData", data))]
    //TODO load settings
    let load = async (d, c) => {
      if (!await fs.exists(d)) await fs.mkdir(d)
      let files = await fs.readdir(d)
      let proms = files.map(f => dispatch("loadLayout", {file: d+f, custom: c, build: false}))
      await Promise.all(proms)
    }
    promises.push(load(remote.app.getPath("userData")+"/layouts/", true))
    promises.push(load("./src/layouts/", false))
    await Promise.all(promises)
    $("#overlay").fadeOut(500);
  },

  /*****************
        PROJECT
  *****************/

  async loadProject({dispatch, commit, state, getters}) {
    let file = await showOpenDialog({filters: [{name: "Carve", extensions: ['crv']}, {name: "Image", extensions: ['jpg', 'png', 'gif', 'jpeg']}, {name: "Layout", extensions: ['json']}]})
    if (!file) return
    if (file.endsWith(".crv")) {
      let data = await fs.readFile(file, 'utf8')
      commit("buildProject", JSON.parse(data))
      dispatch("generateAll")
    } else if (file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".gif") || file.endsWith(".jpeg")) {
      if (state.rootLayers.images.length > 0) {
        let id = state.rootLayers.images[state.rootLayers.images.length - 1].id
        await dispatch("loadImage", {id, url: file})
      }
    } else if (file.endsWith(".json")) {
      await dispatch("loadLayout", {file, custom: true, build: true})
    }
    await dispatch("centerProject")
    commit("setProjectFile", file)
    console.log("Project loaded from "+file)
  },
  async saveProject({commit, state, getters}) {
    let file = state.project.file || await showSaveDialog({filters: [{name: 'Carve', extensions: ['crv']}]})
    if (!file) return
    let json = getters.getJsonFromProject
    await fs.writeFile(file, json)
    commit("setProjectFile", file)
    console.log("Project saved to "+file);
  },
  async centerProject({state, commit}, anim) {
    let size = {w: $("#workarea").width(), h: $("#workarea").height()}
    let zoom = size.w/state.machine.w*0.9
    if (state.machine.h*zoom > size.h*0.9)
      zoom = size.h/state.machine.h*0.9
    let y = size.h/2 - (state.machine.y + state.machine.h/2) * zoom
    let x = size.w/2 - (state.machine.x + state.machine.w/2) * zoom
    if (anim != "noanimation") $("#svgProject").css("transition", "transform .8s")
    commit("zoomProject", zoom)
    commit("translateProject", {x, y})
    if (anim != "noanimation") {
      await timeout(800)
      $("#svgProject").css("transition", "none")
    }
  },
  async toggleQuickMode({state, commit, dispatch}) {
    commit("setQuickMode", !state.quickMode)
    commit("selectTool", "select")
    commit("selectObject", null)
    commit("setSubLayersOpen", state.quickMode)
    await timeout(10)
    dispatch("centerProject")
  },
  async setFullPreview({state, commit, dispatch}, fp) {
    commit("setFullPreview", fp)
    if (fp) {
      commit("selectObject", null)
      commit("setQuickMode", false)
      commit("setSubLayersOpen", true)
      await timeout(10)
      dispatch("centerProject")
    }
  },
  adjustMachine({commit, state, getters}) {
    let min = {x: Number.MAX_VALUE, y: Number.MAX_VALUE};
    let max = {x: Number.MIN_VALUE, y: Number.MIN_VALUE};
    for (let layer of state.objects.filter(getters.isSublayer)) {
      min.x = Math.min(min.x, layer.x)
      min.y = Math.min(min.y, layer.y)
      max.x = Math.max(max.x, layer.x+layer.w)
      max.y = Math.max(max.y, layer.y+layer.h)
    }
    if (min.x!==undefined) {
      commit("adjustMachine", {
        x: min.x,
        y: min.y,
        w: max.x-min.x,
        h: max.y-min.y
      })
    }
  },
  updateQuickProject({commit, state, getters}, {w, h, detail}) {
    if (w != state.machine.w || h != state.machine.h) {
      let c = {
        x: state.machine.x + state.machine.w/2,
        y: state.machine.y + state.machine.h/2
      }
      let d = {
        x: w / state.machine.w,
        y: h / state.machine.h
      }
      let bit = JSON.parse(JSON.stringify(state.machine.bit))
      bit.inDepth = detail;
      commit("updateObject", {
        id: 'machine',
        x: c.x - w/2, w: w,
        y: c.y - h/2, h: h,
        bit
      })
      state.objects.filter(getters.isSublayer).forEach(l => commit("updateObject", {
        id: l.id,
        x: c.x - (c.x - l.x) * d.x,
        w: l.w * d.x,
        y: c.y - (c.y - l.y) * d.y,
        h: l.h * d.y
      }))
      let maxRad = Math.round(state.machine.bit.inDepth/state.machine.bit.height*state.machine.bit.width/2*100)/100;
      this.objects.filter(el => el.is == 'curve').forEach(e => {
        let maxLen = getters.getMaxLength(e.id);
        commit("updateObject", {
          id: e.id,
          x: c.x - (c.x - e.x) * d.x,
          y: c.y - (c.y - e.y) * d.y,
          steps: maxLen / maxRad*2+0.5,
          gap: maxRad*2+0.5
        })
      })
    }
  },

  /*****************
        LAYOUTS
  *****************/

  async loadLayout({commit, dispatch, getters}, {file, custom, build}) {
    let data = await fs.readFile(file)
    data = JSON.parse(data)
    data.id = getters.getNewId()
    data.custom = custom
    commit("addLayout", data)
    console.log("Loaded Layout "+data.title)
    if (build || data.init)
      await dispatch("buildLayout", data.id)
  },
  async createNewLayout({state, getters, commit}) {
    let file = remote.app.getPath("userData")+"/layouts/"+state.project.name+"-"+Date.now()+".json"
    let layout = getters.getLayoutFromProject
    await fs.writeFile(file, JSON.stringify(layout))
    commit("addLayout", {
      ...layout,
      file,
      id: getters.getNewId(),
      custom: true
    })
    console.log("Layout saved to "+file);
  },
  async buildLayout({state, dispatch, commit, getters}, id) {

    let layout = state.layouts.find(el => el.id == id)
    if (!layout) return

    console.log("Started building Layout "+layout.title)

    commit("selectLayout", id)

    commit("cleanProject")

    if (layout.template.machine)
      commit("updateObject", {
        id: "machine",
        ...layout.template.machine
      })

    if (layout.template.fonts) {
      layout.template.fonts.forEach(f => {
        commit("addFont", f)
      })
    }

    if (layout.template.images) {
      layout.template.images.forEach(i => {
        let image = getters.getNewObjectByType("image")
        updateDeep(image, i)
        commit("addObject", image)
      })
    } else {
      commit("addObject", getters.getNewObjectByType("image"))
    }

    if (layout.template.curves) {
      layout.template.curves.forEach(c => {
        let curve = getters.getNewObjectByType("curve", {
          x: state.machine.w/2,
          y: state.machine.h/2
        })
        updateDeep(curve, c)
        commit("addObject", curve)
      })
    } else {
      commit("addObject", getters.getNewObjectByType("curve", {
        x: state.machine.w/2,
        y: state.machine.h/2
      }))
    }

    layout.template.layers.forEach(l => {
      let layer = getters.getNewObjectByType(l.type ? l.type : "cpart")
      if (l.render && l.render.curve) {
        let curve = state.curves.find(el => el.title == l.render.curve || el.id == l.render.curve)
        if (curve) l.render.curve = curve.id
        else l.render.curve = undefined
      }
      if (l.render && l.render.image) {
        let image = state.images.find(el => el.title == l.render.image || el.id == l.render.image)
        if (image) l.render.image = image.id
        else l.render.image = undefined
      }
      updateDeep(layer, l)
      commit("addObject", layer)
    })

    console.log("Finished building Layout "+layout.title)

    await timeout(10)
    await dispatch("centerProject", "noanimation")

    await dispatch("generateAll")
  },
  async removeLayout({commit, state}, id) {
    let layout = state.layouts.find(el => el.id == id)
    if (!layout) return;
    await fs.unlink(layout.file)
    commit("removeLayout", id)
  },
  async setLayoutTitle({commit, state, getters}, {id, title}) {
    let layout = state.layouts.find(el => el.id == id);
    if (!layout) return;
    commit("setLayoutTitle", {id, title})
    let data = await fs.readFile(layout.file)
    let l = JSON.parse(data)
    l.title = title;
    await fs.writeFile(layout.file, JSON.stringify(l))
  },

  /*****************
        IMAGE
  *****************/

  async loadImage({commit, dispatch, getters, state}, {id, url}) {
    let orig = getters.getObjectById(id)
    if (!orig) return;
    let img = {
      id, url,
      data: url ? await getDataURL(url) : state.imgDefault.data
    }
    if (url) {
      let pixels = await getPixelsOfImage(url)
      let h = Math.round(pixels.shape[1] / pixels.shape[0] * orig.w);
      if (h >= orig.h) {
        img.y = (orig.h - h) / 2;
        img.h = h;
      } else {
        let w = Math.round(pixels.shape[0] / pixels.shape[1] * orig.h);
        img.x = (orig.w - w) / 2;
        img.w = w;
      }
      commit("setImagePixels", {id, pixels})
    }
    commit("updateObject", img)
    console.log("Image Data loaded for " + img.id);
  },
  async loadNewImage({state, dispatch}, id) {
    //TODO cancel second dialog
    let file = await showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg']}]})
    if (!file) return
    await dispatch("loadImage", {id, url: file});
  },

  /*****************
        FONT
  *****************/

  async loadNewFont({state, getters, commit}) {
    let file = await showOpenDialog({filters: [{name: "Fonts", extensions: ['ttf', 'woff', 'woff2']}]})
    let font = {
      id: getters.getNewId(),
      file,
      title: file.substring(file.lastIndexOf("/")+1, file.lastIndexOf("."))
    }
    try {
      font.font = await loadOpentypeFont(file)
      commit("addFont", font);
    } catch (err) {
      //TODO notification "This Font cannot be used!"
    }
  },

  /*****************
      RENDERING
  *****************/

  fillLinesForLayer({commit, dispatch}, id) {
    commit("setFillById", {id, fill: true})
    dispatch("generateLayerPath", id)
  },
  async generateAll({state, dispatch}) {
    let promises = []
    console.log("Start generating full Project")
    state.objects.forEach(o => {
      if (o.is == "cpart") promises.push(dispatch("generateLayerPath", o.id))
      else if (o.is == "text") promises.push(dispatch("generateTextPath", o.id))
      else if (o.is == "curve") promises.push(dispatch("generateCurvePaths", o.id))
      else if (o.is == "image") promises.push(dispatch("loadImage", {id: o.id, url: o.url}))
    })
    state.fonts.filter(el => !el.font)
      .forEach((f) => promises.push(loadOpentypeFont(f.file).then(font => f.font = font)))
    await Promise.all(promises)
    console.log("Finished generating full Project")
  },
  async generateLayerPath({state, getters, commit, dispatch}, id) {
    let object = getters.getObjectById(id);
    if (object.is == "cpart") {
      await dispatch("startWorkerFor", id)
    } else if (object.is == "form" && object.mask && object.ownRenderer) {
      let layers = getters.getObjectsByType.layers;
      let i = layers.indexOf(object);
      let promises = [];
      layers.filter(el => el.is == "cpart").filter((el, j) => j < i).forEach(el => {
        promises.push(dispatch("startWorkerFor", el.id))
      })
      await Promise.all(promises)
    }
  },
  async generateTextPath({state, getters}, id) {
    let object = getters.getObjectById(id);
    if (object.is != "text") throw new Error("Object with id "+id+" need to be a Text")
    let font = state.fonts.find(el => el.id == object.font);
    if (!font) return
    let path = font.font.getPath(object.title, 0, 0, object.size)
    commit("setTextPath", {id, path: path.toPathData(3)});
    console.log("Generated Text Path for "+id)
    await dispatch("generateTextGCode", {id, path});
  },
  generateCurvePaths({commit, state, getters}, id) {
    let curve = getters.getObjectById(id)
    let machine = getters.getObjectById("machine")

    let paths = makeCurvePaths(curve, machine)
    commit("setCurvePaths", {id, paths})
  },
  async startWorkerFor({state, getters, commit, dispatch}, id) {
    let object = getters.getObjectById(id);
    if (!object.is == "cpart") return
    let layers = state.objects.filter(getters.isSublayer)
    let i = layers.indexOf(object);
    let forms = layers
      .filter(el => el.is == "form")
      .filter((el, j) => j > i)

    let images = [getters.getObjectById(object.render.image)]
      .concat(forms
        .filter(el => el.mask && el.ownRenderer)
        .map(el => el.render.image)
        .map(id => state.objects.filter(el => el.id == id))
      ).map(el => ({...el, pixels: getters.getImagePixelsById(el.id)}))
    let curves = [getters.getObjectById(object.render.curve)]
      .concat(forms
        .filter(el => el.mask && el.ownRenderer)
        .map(el => el.render.curve)
        .map(id => state.objects.filter(el => el.id == id))
      )
    let machine = state.machine

    let startmillis = Date.now()

    let wid = getters.getNewId()

    console.log("Start Worker "+wid+" for Layer "+id);

    let worker = new WorkerHandler((progress) => {
      commit("updateWorkerProgress", {id, progress})
    })
    commit("registerWorker", {id, terminate: worker.terminate.bind(worker), wid})

    let result = await worker.run({layer: object, forms, images, curves, machine}) //TODO handle pre-, post gcode snippets

    commit("unregisterWorker", {id, wid})

    if (result.error) {
      console.log("Rendering for Layer "+id+" with Worker "+wid+" finished with an Error: "+result.error);
    } else {

      console.log(result)

      commit("setCPartPath", {id, path: result.path})

      if (object.fill) {
        commit("setLineCountById", {id, lineCount: result.lineCount})
        commit("setFillById", {id, fill: false})
      }

      console.log("Finished Rendering for Layer "+id+", took "+(Date.now()-startmillis)+"ms");

      await dispatch("generateCPartGCode", {id, lines: result.lines})

    }
  },

  /*****************
        GCODE
  *****************/

  async saveGCode({commit, state, getters, dispatch}) {
    let file = await showOpenDialog({properties: ['openDirectory', 'createDirectory']})
    if (!file) return
    await dispatch("setFullPreview", true)

    let promises = []
    for (let layer of state.objects.filter(el => el.is == 'cpart' && el.gcode)) {
      let gcode = layer.gcode.gcode.slice()
      state.objects
        .filter(el => el.is == 'text')
        .filter(el => el.gcode && el.x > layer.x && el.y > layer.y && el.x < layer.x+layer.w && el.y < layer.y+layer.h)
        .forEach(el => gcode = gcode.concat(el.gcode))
      let f = file + "/" + layer.title+".gcode"
      promises.push(fs.writeFile(f, gcode.join('\n')))
    }

    let svg = getters.getSVGFromProject()
    promises.push(fs.writeFile(file + "/screenshot.svg", svg))

    await Promise.all(promises)
    console.log("GCode saved to folder "+file);
  },
  generateTextGCode({commit, state, getters}, {id, path}) {
    let worker = new Worker("src/renderer/workers/textgcode.js")
    let text = getters.getObjectById(id);
    let machine = getters.getObjectById("machine");
    console.log("Start generating text gcode for "+id)
    return new Promise((resolve, reject) => {
      worker.addEventListener("message", (event) => {
        commit("setTextGCode", {id: id, gcode: event.data.gcode})
        worker.terminate();
        console.log("Finished generating text gcode for "+id)
        resolve()
      })
      worker.postMessage({text, path, machine})
    })
  },
  generateCPartGCode({commit, state, getters}, {id, lines}) {
    let worker = new Worker("src/renderer/workers/cpartgcode.js")
    let machine = getters.getObjectById("machine");
    let layer = getters.getObjectById(id)
    console.log("Start generating cpart gcode for "+id)
    return new Promise((resolve, reject) => {
      worker.addEventListener("message", (event) => {
        commit("setCPartGCode", {id, gcode: event.data.gcode})
        worker.terminate();
        console.log("Finished generating cpart gcode for "+id)
        resolve()
      })
      worker.postMessage({layer, machine, lines})
    })
  },

  /*****************
        OBJECTS
  *****************/

  removeObject({commit, state, getters, dispatch}, id) {
    let o = getters.getObjectById(id)

    let toUpdate = []

    if (o.id == "curve" || o.is == "image")
      state.objects
        .filter(getters.isSublayer)
        .filter(el => el.render[o.is] == o.id)
        .forEach(el => toUpdate.push(el.id))
    else if (o.id == "form") {
      let i = state.objects.indexOf(o);
      state.objects
        .filter(el => el.is == "cpart")
        .filter((el, j) => j < i)
        .forEach(el => toUpdate.push(el.id))
    }
    commit("removeObject", id)
    toUpdate.forEach(id => dispatch("generateLayerPath", id))
  }

}