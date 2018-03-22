

import {fork} from "child_process"
import path from "path"
var opentype = require("opentype.js")

import {round} from "@/functions"

let fontMap = new Map();

export let FontManager = {
  load(font, onLoad) {
    try {
      let fontType = opentype.loadSync(font.file)
      fontMap.set(font.id, fontType)
      onLoad(null);
    } catch (err) {
      onLoad(err)
    }
  },
  delete(font) {
    fontMap.delete(font.id)
  },
  get(id) {
    return fontMap.get(id)
  }
}

export class TextRenderer {
  constructor(id, store) {
    this.id = id;
    this.store = store;
    this.init()

    this.gcode = fork(path.join(__child, './text.js'))
    this.gcode.on("message", (event) => store.commit("setTextRenderResult", {id: this.id, gcode: event}))
  }
  init() {
    this.text = this.store.getters.getObjectById(this.id);
    this.font = fontMap.get(this.text.font)
  }
  render(updateSize) {
    let path = this.updateText(updateSize)

    let machine = this.store.state.machine;
    this.gcode.send({text: this.text, machine, path: path.raw})
  }
  updateText(updateSize) {
    this.init();
    if (!this.font) return;

    let size;
    if (updateSize)
      size = this.getSize()
    else
      size = this.text.size

    let path = this.getPath(size)

    this.store.commit("updateObjectSilent", {id: this.id, path: path.pathData, w: path.w, h: path.h, size})

    return path;
  }
  getRawPath(size) {
    let path = this.font.getPath(this.text.title, 0, 0, size || this.text.size);
    let bbox = path.getBoundingBox();
    return {raw: path, bbox}
  }
  getPath(size) {
    let path = this.getRawPath(size)
    return {raw: path.raw, pathData: path.raw.toPathData(3), w: path.bbox.x2 + this.text.getXBorder(), h: -path.bbox.y1 + this.text.getYBorder()}
  }
  getSize() {
    let path = this.getRawPath();

    return Math.max(1, round(this.text.size * (this.text._h / -path.bbox.y1), 10));
  }
  execute(cmd, payload) {
    switch (cmd) {
      default:
        console.log(`Command ${cmd} is not specified!`)
    }
  }
  close() {
    this.gcode.disconnect()
  }
}
