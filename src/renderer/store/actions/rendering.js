
import RenderingManager from "@/rendering/RenderingManager.js"

import {Artboard, Text, Form} from "@/models.js"

export default {
  async renderAll({state, dispatch, commit, getters}) {
    console.log("Start generating full Project")

    state.texts.forEach(t => commit("putObject", t))

    await Promise.all(state.images.map(o => dispatch("loadImage", {id: o.id, url: o.url})))

    console.log("Finished generating full Project")
  },
  startRendering({state, getters, commit, dispatch}, pId) {
    let {object, renderParams} = getters.getRenderingPairById(pId)
    if (!object || !renderParams) return;

    let machine = state.machine
    let i = state.layers.indexOf(object);
    let forms = state.layers
      .filter(el => el instanceof Form && state.layers.indexOf(el) > i)
      .concat(state.texts.filter(t => t.asForm).map(t => ({id: t.id, x: t.x, y: t.y, w: t.w, h: t.h, rot: t.rot, type: "text"})))
      .filter(el => !renderParams.ignoreForms.find(f => f == el.id))

    let image = getters.getObjectById(renderParams.image)
    let renderer = getters.getObjectById(renderParams.renderer)

    if (!image || !renderer) return;

    RenderingManager.startRendering(pId, {layer: {...object, renderParams: renderParams.params}, forms, image, renderer, machine})

  },
  executeRenderCommand({state}, {pId, cmd, payload}) {
    RenderingManager.sendCommand(pId, cmd, payload);
  }
}
