
import $ from "jquery"
import fs from "mz/fs"

import {showOpenDialog, showSaveDialog, timeout} from "../helpers.js"
import {HalftoneRenderer, StippleRenderer} from "@/models.js"

export default {
  async loadProject({dispatch, commit, state, getters}) {
    let file = await showOpenDialog({filters: [{name: "Carve", extensions: ['crv']}, {name: "Image", extensions: ['jpg', 'png', 'gif', 'jpeg']}, {name: "Layout", extensions: ['json']}]})
    if (!file) return
    if (file.endsWith(".crv")) {
      let data = await fs.readFile(file, 'utf8')
      commit("buildProject", JSON.parse(data))

      dispatch("renderAll")
    } else if (file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".gif") || file.endsWith(".jpeg")) {
      if (state.images.length > 0) {
        let id = state.images[state.images.length - 1].id
        await dispatch("loadImage", {id, url: file})
      }
    } else if (file.endsWith(".json")) {
      await dispatch("loadLayout", {file, custom: true, build: true})
    }
    await dispatch("centerProject")
    commit("setProjectFile", file)
    console.log("Project loaded from "+file)
  },
  async saveProject({commit, state, getters}, showDialog) {
    let file = showDialog || !state.project.file ? await showSaveDialog({filters: [{name: 'Carve', extensions: ['crv']}]}) : state.project.file
    if (!file) return
    let json = getters.getJsonFromProject
    await fs.writeFile(file, json)
    commit("setProjectFile", file)
    console.log("Project saved to "+file);
  },
  async centerProject({state, commit, getters}, options) {
    let size = {w: $("#workarea").width(), h: $("#workarea").height()}

    if (options && options.withSidebar) {
      if (getters.isSidebarOpen) {
        size.w -= 300 - $(".sidebar").width()
      } else {
        size.w += $(".sidebar").width()
      }
    }

    let objects;
    if (state.subLayersOpen)
      objects = state.layers;
    else
      objects = state.layers.concat(state.images).concat(state.texts)

    if (objects.length == 0) return;

    let max = objects.reduce((max, o) => ({
        x: Math.max(max.x, o.w ? o.x+o.w : o.x),
        y: Math.max(max.y, o.h ? o.y+o.h : o.y)
      }), {x: -Number.MAX_VALUE, y: -Number.MAX_VALUE})

    if (!state.subLayersOpen)
      max = state.renderer.reduce((max, r) => {
        if (r instanceof HalftoneRenderer) {
          return {x: Math.max(max.x, r.x), y: Math.max(max.y, r.y)}
        } else if (r instanceof StippleRenderer) {
          let b = r.getBounds()
          return b ? {x: Math.max(max.x, b.x2), y: Math.max(max.y, b.y2)} : max
        }
      }, max)

    let min = objects.reduce((min, o) => ({
        x: Math.min(min.x, o.x),
        y: Math.min(min.y, o.y)
      }), {x: Number.MAX_VALUE, y: Number.MAX_VALUE})

    if (!state.subLayersOpen)
      min = state.renderer.reduce((min, r) => {
        if (r instanceof HalftoneRenderer) {
          return {x: Math.min(min.x, r.x), y: Math.min(min.y, r.y)}
        } else if (r instanceof StippleRenderer) {
          let b = r.getBounds()
          return b ? {x: Math.min(min.x, b.x1), y: Math.min(min.y, b.y1)} : min
        }
      }, min)

    let zoom = Math.min(size.w/(max.x-min.x), size.h/(max.y-min.y))*0.9
    let y = size.h/2 - (max.y+min.y)/2 * zoom
    let x = size.w/2 - (max.x+min.x)/2 * zoom

    if (!options || !options.preventAnimation) $("#svg").addClass("fade-zoom")
    commit("zoomProject", zoom)
    commit("translateProject", {x, y})
    commit("setCentered", true)
    if (!options || !options.preventAnimation) {
      await timeout(900)
      $("#svg").removeClass("fade-zoom")
    }
  },
  async toggleQuickMode({state, commit, dispatch}) {
    commit("setQuickMode", !state.quickMode)
    commit("selectTool", "select")
    commit("selectObject", null)
    commit("setSubLayersOpen", state.quickMode)
    dispatch("centerProject", {withSidebar: true})
  },
  async setFullPreview({state, commit, dispatch}, fp) {
    commit("setFullPreview", fp)
    if (fp) {
      commit("selectObject", null)
      commit("selectTool", "select")
      commit("setQuickMode", false)
      commit("setSubLayersOpen", true)
      dispatch("centerProject", {withSidebar: true})
    }
  },
  updateQuickProject({commit, state, getters}, {w, h, detail}) {
    if (w != state.machine.w || h != state.machine.h) {
      let c = {
        x: state.machine.w/2,
        y: state.machine.h/2
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
      state.layers.forEach(l => commit("updateObject", {
        id: l.id,
        x: c.x - (c.x - l.x) * d.x,
        w: l.w * d.x,
        y: c.y - (c.y - l.y) * d.y,
        h: l.h * d.y
      }))
      let maxRad = Math.round(state.machine.bit.inDepth/state.machine.bit.height*state.machine.bit.width/2*100)/100;
      state.renderer.forEach(e => {
        // let maxLen = getters.getMaxLength(e.id);
        // commit("updateObject", {
        //   id: e.id,
        //   x: c.x - (c.x - e.x) * d.x,
        //   y: c.y - (c.y - e.y) * d.y,
        //   steps: maxLen / maxRad*2+0.5,
        //   gap: maxRad*2+0.5
        // })
        //TODO adjust renderer params
      })
    }
  }
}
