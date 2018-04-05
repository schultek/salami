
import {fork} from "child_process"
import path from "path"

import {Spinner} from "@/components/Spinner.vue"

export default class BaseRenderer {
  constructor(id, pId, store) {
    this.id = id;
    this.pId = pId;
    this.store = store;

    this.gcode = fork(path.join(__child, './gcode.js'))
    this.gcode.on("message", (event) => store.commit("setRenderResult", {id: this.pId, params: {id: this.id, gcode: event}}))
  }
  handleRenderEvent(event) {
    if (event.error) {
      console.log(`Rendering for Layer ${this.id} finished with an Error: `, event.error);
      Spinner.stop(this.id)
    }
    if (event.result && event.result.lines) {
      this.gcode.send({lines: event.result.lines, machine: this.store.state.machine})
    }
    if (event.result) {
      this.handleRenderResult(event.result);
    }
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
