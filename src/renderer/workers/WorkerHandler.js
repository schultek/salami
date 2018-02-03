
let linesWorker, pathWorker, gcodeWorker

export default class WorkerHandler {
  constructor(id) {
    this.id = id;
    this.progress = 0;

    linesWorker = new Worker("src/renderer/workers/linesworker.js")
    gcodeWorker = new Worker("src/renderer/workers/gcodeworker.js")

    gcodeWorker.onmessage = event => {
      this.onGCode(event.data.gcode)
    }
  }
  run(data) {
    if (!data.layer) return
    this.terminate()
    this.onProgress(0)

    linesWorker.onmessage = event => {
      if (event.data.error)
        this.onError(event.data.error)
      if (event.data.progress)
        this.onProgress(event.data.progress/2)
      if (event.data.paths)
        this.onPath(event.data.paths)
      if (event.data.lines)
        gcodeWorker.postMessage({lines: event.data.lines, layer: data.layer, machine: data.machine})
      if (event.data.fillLines)
        this.onFillLines(event.data.fillLines)
    }

    linesWorker.postMessage(data)
  }
  terminate() {
    // linesWorker.postMessage({type: "terminate"})
    // pathWorker.postMessage({type: "terminate"})
    // gcodeWorker.postMessage({type: "terminate"})

    this.onProgress(100)
  }
  setImagePixels(img) {
    linesWorker.postMessage(img)
  }
}
