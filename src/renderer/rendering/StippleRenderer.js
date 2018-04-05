
import {fork} from "child_process"
import path from "path"

import BaseRenderer from "./BaseRenderer.js"
import {Spinner} from "@/components/Spinner.vue"

export default class StippleRenderer extends BaseRenderer {
  constructor(id, pId, store) {
    super(id, pId, store);
    this.singleStep = true;
    this.child = fork(path.join(__child, './stipple.js'))
    this.child.on("message", (event) => super.handleRenderEvent(event))
  }
  render(payload) {
    this.child.send({cmd: "setup", payload})
  }
  handleRenderResult(result, renderPayload) {
    if (this.singleStep)
      Spinner.stop(this.id)
    let params = {id: this.id}
    if (result.path) params.path = result.path
    if (result.status) params.params = {status: result.status}
    if (result.voronoi) params.params = {...params.params, voronoi: result.voronoi}
    this.store.commit("setRenderResult", {id: this.pId, params})
  }
  execute(cmd, payload) {
    switch (cmd) {
      case "preload":
        this.child.send({cmd: "preload", payload})
        break;
      case "start":
        this.child.send({cmd: "start"})
        this.singleStep = false;
        Spinner.start(this.id)
        break;
      case "pause":
        this.child.send({cmd: "pause"})
        Spinner.stop(this.id)
        break;
      case "resume":
        this.child.send({cmd: "resume"});
        this.singleStep = false;
        Spinner.start(this.id)
        break;
      case "stop":
        this.child.send({cmd: "stop"})
        Spinner.stop(this.id)
        break;
      case "next":
        this.child.send({cmd: "next"})
        this.singleStep = true;
        Spinner.start(this.id)
        break;
      default:
        super.execute(cmd, payload)
    }
  }
  close() {
    super.close();
    this.child.send({cmd: "stop"})
    this.child.disconnect();
  }
}
