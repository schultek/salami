
import $ from "jquery"
import fs from "mz/fs"

import {showOpenDialog, showSaveDialog, timeout} from "../helpers.js"
import {HalftoneRenderer, StippleRenderer, Artboard} from "@/models.js"

import UserStore from "@/includes/UserStore.js"

export default {
  async loadProject({dispatch, commit, state, getters}, url) {
    let file = url || await showOpenDialog({filters: [{name: "Carve", extensions: ['crv']}, {name: "Image", extensions: ['jpg', 'png', 'gif', 'jpeg']}]})
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
    }
    await dispatch("centerProject")
    commit("setProjectFile", file)
    if (file.endsWith(".crv"))
      UserStore.addToRecentProjects({title: state.project.name, url: file, thumbnail: null}) //TODO thumbnail generation
    console.log("Project loaded from "+file)
  },
  async saveProject({commit, state, getters}, showDialog) {
    let file = showDialog || !state.project.file ? await showSaveDialog({filters: [{name: 'Carve', extensions: ['crv']}]}) : state.project.file
    if (!file) return
    let json = getters.getJsonFromProject
    await fs.writeFile(file, json)
    commit("setProjectFile", file)
    UserStore.addToRecentProjects({title: state.project.name, url: file, thumbnail: null}) //TODO thumbnail generation
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

    let objects = state.fullPreview ? state.layers.filter(l => l instanceof Artboard) : state.layers.concat(state.images.filter(i => i.visible || i.id == state.selectedObject))

    if (objects.length == 0) return;

    let max = objects.reduce((max, o) => ({
        x: Math.max(max.x, o.w ? o.x+o.w : o.x),
        y: Math.max(max.y, o.h ? o.y+o.h : o.y)
      }), {x: -Number.MAX_VALUE, y: -Number.MAX_VALUE})

    if (!state.fullPreview)
      max = state.renderer.filter(r => r.visible || r.id == state.selectedObject).reduce((max, r) => {
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

    if (!state.fullPreview)
      min = state.renderer.filter(r => r.visible || r.id == state.selectedObject).reduce((min, r) => {
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
    commit("selectTool", "select")
    commit("selectObject", null)
    dispatch("centerProject", {withSidebar: true})
  },
  async setFullPreview({state, commit, dispatch}, fp) {
    commit("setFullPreview", fp)
    if (fp) {
      commit("selectObject", null)
      commit("selectTool", "select")
      dispatch("centerProject", {withSidebar: true})
    }
  }
}
