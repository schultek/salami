
import {setImagePixels} from "./BaseRenderer.js"
import HalftoneRenderer from "./HalftoneRenderer.js"
import StippleRenderer from "./StippleRenderer.js"

import {HalftoneRenderer as HalftoneRendererObject, StippleRenderer as StippleRendererObject} from "@/models.js"

let rendererMap = new Map();
let store, images = new Map();

export default {
  init(s) {
    store = s;
  },
  startRendering(id, payload) {
    let renderer;
    if (rendererMap.has(id)) {
      renderer = rendererMap.get(id)
    } else {
      if (payload.renderer instanceof HalftoneRendererObject) {
        renderer = new HalftoneRenderer(id, payload.layer.id, store)
      } else if (payload.renderer instanceof StippleRendererObject){
        renderer = new StippleRenderer(id, payload.layer.id, store)
      }
      renderer.onProgress(updateProgress)
      images.forEach(img => {
        renderer.execute("preload", img)
      })
      rendererMap.set(id, renderer)
    }
    console.log(`Start Renderer ${id}`);
    renderer.render(payload)
  },
  preloadImage(img) {
    images.set(img.id, img)
    rendererMap.forEach(r => {
      r.execute("preload", img)
    })
  },
  remove(id) {
    if (rendererMap.has(id))
      rendererMap.get(id).close()
    rendererMap.delete(id)
  },
  clear() {
    rendererMap.forEach(r => r.close())
    rendererMap.clear();
  },
  sendCommand(id, cmd, payload) {
    if (rendererMap.has(id))
      rendererMap.get(id).execute(cmd, payload)
  }
}

function updateProgress() {
  let rendering = 0, error = false, progress = 0;
  for (let r of rendererMap.values()) {
    if (r.status == "ready") continue;
    rendering++;
    if (r.status == "rendering") {
      progress += r.progress
    } else if (r.status == "finished") {
      progress += 100;
      r.status = "ready"
    }
  }
  if (rendering > 0)
    store.commit("setProgress", progress / rendering)
  else {
    store.commit("setProgress", null)
    debugger;
  }
}
