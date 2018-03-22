
import fs from "mz/fs"
import {remote} from "electron"

import {timeout} from "../helpers.js"
import {getNewId} from "@/functions.js"

export default {
  async loadLayout({commit, dispatch, getters}, {file, custom, build}) {
    let data = await fs.readFile(file)
    data = JSON.parse(data)
    data.id = getNewId()
    data.custom = custom
    data.file = file
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
      id: getNewId(),
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
        commit("addObject", getters.getNewObjectByType("font", {...f, onError: err => dispatch("fontError", err)}))
      })
    }

    if (layout.template.texts) {
      layout.template.texts.forEach(t => {
        if (t.font) {
          let font = state.fonts.find(el => el.title == t.font || el.id == t.font)
          if (font) t.font = font.id
          else delete t.font
        }
        commit("addObject", getters.getNewObjectByType("text", t))
      })
    }

    if (layout.template.images) {
      layout.template.images.forEach(i => {
        commit("addObject", getters.getNewObjectByType("image", i))
      })
    } else {
      commit("addObject", getters.getNewObjectByType("image"))
    }



    if (layout.template.renderer) {
      layout.template.renderer.forEach(c => {
        commit("addObject", getters.getNewObjectByType(c.type || "halftone", {
          x: state.machine.w/2,
          y: state.machine.h/2,
          ...c
        }))
      })
    } else {
      commit("addObject", getters.getNewObjectByType("halftone", {
        x: state.machine.w/2,
        y: state.machine.h/2
      }))
    }

    layout.template.layers.forEach(l => {
      if (l.renderParams)
        l.renderParams.forEach(p => {
          if (p.renderer) {
            let renderer = state.renderer.find(el => el.title == p.renderer || el.id == p.renderer)
            if (renderer) p.renderer = renderer.id
            else delete p.renderer
          }
          if (p.image) {
            let image = state.images.find(el => el.title == p.image || el.id == p.image)
            if (image) p.image = image.id
            else delete p.image
          }
        })
      commit("addObject", getters.getNewObjectByType(l.type ? l.type : "cpart", l))
    })

    console.log("Finished building Layout "+layout.title)

    commit("selectObject", null)
    await dispatch("centerProject", {withSidebar: true, preventAnimation: true})
    await dispatch("renderAll")
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
  }
}
