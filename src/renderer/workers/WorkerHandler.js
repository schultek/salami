
export default class WorkerHandler {
  constructor(update, tee) {
    this.workers = [];
    this.promise = null;
    this.waiting = false
    this.updateProgress = update
    this.tee = tee;
  }
  resolve(d) {
    if (this.waiting) {
      this.waiting = false
      this.promise.resolve(d)
    }
  }
  reject(d) {
    if (this.waiting) {
      this.waiting = false
      this.promise.reject(d)
    }
  }
  updateWorkerProgress(id, progress) {
    this.workers.find(el => el.id == id).progress = progress;
    this.updateProgress(this.workers.reduce((sum, w) => sum + w.progress, 0) / this.workers.length)
    //TODO better progress function
  }
  registerWorker(id) {
    let worker = new Worker("src/renderer/workers/renderlayer.js")
    this.workers.push({
      id, worker, progress: 0
    })
    return worker;
  }
  finishWorker(id, path, lines) {
    let worker = this.workers.find(el => el.id == id)
    worker.path = path;
    worker.lines = lines
    worker.isFinished = true

    if (this.workers.every(el => el.isFinished))
      this.resolve({
        isFinished: true,
        lines: this.workers.reduce((l, w) => l.concat(w.lines), []),
        path: this.workers.reduce((p, w) => p+" "+w.path, "")
      })
  }
  run(data) {
    if (!data.layer) return

    this.reject(new Error("Run function was called multiple times"))

    if (this.workers.length > 0)
      this.terminate()

    let promise = new Promise((resolve, reject) => {
      this.promise = {resolve, reject}
    })
    this.waiting = true

    let layers = [data.layer].concat(
      data.forms.filter(el => el.mask && el.ownRenderer)
    )

    layers.forEach(layer => {

      let worker = this.registerWorker(layer.id);

      worker.addEventListener("message", e => {
        if (e.data.error) {
          this.resolve({error: e.data.error})
        } else if (e.data.isFinished) {
          this.finishWorker(layer.id, e.data.path, e.data.lines)
        } else {
          this.updateWorkerProgress(layer.id, e.data.progress)
        }
      })

      let i = layers.indexOf(layer);

      let forms = data.forms.filter((el, j) => j > i);
      let image = data.images.find(el => layer.render.image == el.id)
      let curve = data.curves.find(el => layer.render.curve == el.id)

      worker.postMessage({layer, forms, image, curve, machine: data.machine})

    })

    return promise
  }
  terminate(tee) {
    this.workers.forEach(w => w.worker.terminate());
    this.workers = []
    this.resolve({error: "Worker was terminated from "+tee})
  }
}
