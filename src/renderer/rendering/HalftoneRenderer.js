
import {fork} from "child_process"
import path from "path"
import BaseRenderer from "./BaseRenderer.js"

export default class HalftoneRenderer extends BaseRenderer {
  constructor(id, pId, store) {
    super(id, pId, store)
    this.child = fork(path.join(__child, './halftone.js'))
    this.child.on("message", (event) => super.handleRenderEvent(event))
  }
  render(payload) {
    super.startRendering(payload)
    this.child.send({cmd: this.fill ? "fill" : "render", payload})
    this.fill = false;
  }
  handleRenderResult(result) {
    if (result.path || result.filled) {
      let params = {id: this.id}
      if (result.path)
        params.path = result.path
      if (result.filled)
        params.params = {lines: result.filled}
      this.store.commit("setRenderResult", {id: this.pId, params})
    }
  }
  execute(cmd, payload) {
    switch (cmd) {
      case "preload":
        this.child.send({cmd: "preload", payload})
        break;
      case "fill":
        this.fill = true;
        this.store.dispatch("startRendering", this.id)
        break;
      default:
        super.execute(cmd, payload)
    }
  }
  close() {
    super.close()
    this.child.disconnect()
  }
}
