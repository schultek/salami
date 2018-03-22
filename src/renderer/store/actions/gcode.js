
import fs from "mz/fs"
import path from "path"
import {fork} from "child_process"

import {showOpenDialog} from "../helpers.js"

export default {
  async saveGCode({commit, state, getters, dispatch}) {
    let file = await showOpenDialog({properties: ['openDirectory', 'createDirectory']})
    if (!file) return
    await dispatch("setFullPreview", true)

    let promises = []
    for (let layer of state.layers.filter(el => el instanceof CPart)) {
      let gcode = (layer.gcode || {cmds: []}).cmds.slice()
      state.layers
        .filter(el => el instanceof Form && el.isRendering() && el.gcode)
        .forEach(f => gcode = gcode.concat(f.gcode.cmds))
      state.texts
        .filter(el => el.gcode && el.x > layer.x && el.y > layer.y && el.x < layer.x+layer.w && el.y < layer.y+layer.h)
        .forEach(t => gcode = gcode.concat(t.gcode.cmds))
      let f = file + "/" + layer.title+".gcode"
      promises.push(fs.writeFile(f, gcode.join('\n')))
    }

    let svg = getters.getSVGFromProject()
    promises.push(fs.writeFile(file + "/screenshot.svg", svg))

    await Promise.all(promises)
    console.log("GCode saved to folder "+file);
  }
}
