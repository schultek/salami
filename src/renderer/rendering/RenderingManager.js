
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
