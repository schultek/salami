import WorkerHandler from "./WorkerHandler.js"

let workers = [];
let store;
let images = [];

export default {
  init(s) {
    store = s;
  },
  runWorker(id, payload) {
    let worker = workers.find(el => el.id == id)
    if (worker) {
      worker.run(payload)
    } else {
      this.registerWorker(id, payload)
    }
  },
  registerWorker(id, payload) {
    let worker = new WorkerHandler(id);
    worker.onError = (err) => {
      console.log("Rendering for Layer "+id+" finished with an Error: "+err);
    }
    worker.onProgress = (progress) => {
      worker.progress = progress;
      store.commit("setProgress", workers.reduce((sum, w) => sum + w.progress, 0))
    }
    worker.onPath = (path) => {
      store.commit("setPathById", {id, path})
    }
    worker.onFillLines = (lines) => {
      store.commit("setLineCountById", {id, lines})
      store.commit("setFillById", {id, fill: false})
    }
    worker.onGCode = (gcode) => {
      store.commit("setGCodeById", {id, gcode})
    }
    images.forEach(img => worker.setImagePixels(img))
    worker.run(payload)
    workers.push(worker)
  },
  setImagePixels(img) {
    let image = images.find(el => el.id == img.id)
    if (image)
      image.pixels = img.pixels
    else
      images.push(img)
    workers.forEach(w => {
      w.setImagePixels(img)
    })
  }
}
