import getPixels from "get-pixels"

let loading = {}, waiting = {};
let images = new Map()

export default {
  load(img) {
    loading[img.id] = true;
    getPixels(img.url, (err, pixels) => {
      if (err) {
        process.send({error: `Couldn't load pixel data for image ${img.title}`})
      } else {
        images.set(img.id, pixels)
        if (waiting[img.id]) {
          waiting[img.id].forEach(onload => onload())
        }
      }
      loading[img.id] = false;
      delete waiting[img.id];
    })
  },
  isLoading(id) {
    return loading[id]
  },
  wait(id, onload) {
    if (waiting[id])
      waiting[id].push(onload)
    else
      waiting[id] = [onload]
  },
  get(id) {
    return images.get(id)
  },
  has(id) {
    return images.has(id)
  }
}
