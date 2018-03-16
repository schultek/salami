
import {fork} from "child_process"
import path from "path"

export default class BaseRenderer {
  constructor(id, pId, store) {
    this.id = id;
    this.partId = pId;
    this.store = store;
    this.progress = 0;
    this.progressCallbacks = [];
    this.status = "ready"

    this.gcode = fork(path.join(__child, './gcode.js'))
    this.gcode.on("message", (event) => store.commit("setRenderResult", {id: this.partId, params: {id: this.id, gcode: event}}))
  }
  startRendering(payload) {
    // debugger;
    this.status = "rendering";
    this.progress = 0;
    this.notify();
  }
  handleRenderEvent(event) {
    this.status = "rendering";
    if (event.error) {
      console.log(`Rendering for Layer ${this.id} finished with an Error: `, event.error);
      this.status = "finished"
    }
    if (event.progress) {
      this.progress = event.progress;
    }
    if (event.result && event.result.lines) {
      this.gcode.send({lines: event.result.lines, machine: this.store.state.machine})
    }
    if (event.result) {
      this.status = "finished"
      this.handleRenderResult(event.result);
    }
    this.notify();
  }
  execute(cmd, payload) {
    switch (cmd) {
      default:
        console.log(`Command ${cmd} is not specified!`)
    }
  }
  onProgress(cb) {
    this.progressCallbacks.push(cb)
  }
  close() {
    this.gcode.disconnect()
  }
  notify() {
    this.progressCallbacks.forEach(cb => cb());
  }
}
