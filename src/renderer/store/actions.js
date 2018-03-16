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

export default {
  init({commit, state, dispatch, getters}) {
    RenderingManager.init({commit, state, dispatch, getters})
    let promises = [getDataURL(state.imgDefault.url).then(data => commit("setDefaultImageData", data))]
    let load = (d, c) => {
      if (!fs.existsSync(d))
        return [fs.mkdir(d)]
      else {
        let files = fs.readdirSync(d)
        return files.map(f =>
          dispatch("loadLayout", {file: d+f, custom: c, build: false})
        )
      }
    }
    promises.concat(load(remote.app.getPath("userData")+"/layouts/", true))
    promises.concat(load(__static+"/layouts/", false))
    return Promise.all(promises)
  },
  ...projectActions,
  ...layoutActions,
  ...imageActions,
  ...fontActions,
  ...renderingActions,
  ...gcodeActions,
  ...objectActions
}
