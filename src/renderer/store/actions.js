import fs from "mz/fs"
import {remote} from "electron"

import {getDataURL} from "./helpers.js"
import RenderingManager from "../rendering/RenderingManager.js"

import projectActions   from "./actions/project.js"
import layoutActions    from "./actions/layouts.js"
import imageActions     from "./actions/image.js"
import fontActions      from "./actions/font.js"
import renderingActions from "./actions/rendering.js"
import gcodeActions     from "./actions/gcode.js"
import objectActions    from "./actions/object.js"
import exportActions    from "./actions/export.js"

import {Font} from "@/models.js"

export default {
  init({commit, state, dispatch, getters}) {
    RenderingManager.init({commit, state, dispatch, getters})

    let promises = [
      getDataURL(state.default.url).then(data => commit("setDefaultImageData", data))
    ]

    let load = async (dir, cb) => {
      if (!await fs.exists(dir))
        return [fs.mkdir(dir)]
      else {
        let files = await fs.readdir(dir)
        return files.map(f => cb(dir+f, f, dir))
      }
    }
    promises.concat(load(remote.app.getPath("userData")+"/layouts/", file =>
      dispatch("loadLayout", {file, custom: true, build: false})))
    promises.concat(load(__static+"/layouts/", file =>
      dispatch("loadLayout", {file, custom: false, build: false})))
    promises.concat(load(__static+"/fonts/", file => {
      let font = getters.getNewObjectByType("font", {file, custom: false});
      commit("addObject", font)
    }))
    return Promise.all(promises)
  },
  ...projectActions,
  ...layoutActions,
  ...imageActions,
  ...fontActions,
  ...renderingActions,
  ...gcodeActions,
  ...objectActions,
  ...exportActions
}
