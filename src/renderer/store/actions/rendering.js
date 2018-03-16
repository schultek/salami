
import RenderingManager from "@/rendering/RenderingManager.js"

import {CPart, Text, Form} from "@/models.js"

export default {
  async renderAll({state, dispatch, getters}) {
    let promises = []
    console.log("Start generating full Project")
    let toRender = getters.getRenderingIds("machine")
    toRender.forEach(r => promises.push(dispatch("startRendering", r)))
    state.images.forEach(o => promises.push(dispatch("loadImage", {id: o.id, url: o.url})))
    state.texts.forEach(o => promises.push(dispatch("startTextRendering", o.id)))
    state.fonts.filter(el => !el.font).forEach((f) => promises.push(loadOpentypeFont(f.file).then(font => f.font = font)))
    await Promise.all(promises)
    console.log("Finished generating full Project")
  },
  async generateTextPath({state, getters}, id) {
    let object = getters.getObjectById(id);
    if (object instanceof Text) throw new Error("Object with id "+id+" need to be a Text")
    let font = state.fonts.find(el => el.id == object.font);
    if (!font) return
    let path = font.font.getPath(object.title, 0, 0, object.size)
    commit("setSVGPathById", {id, path: path.toPathData(3)});
    console.log("Generated Text Path for "+id)
    await dispatch("generateTextGCode", {id, path});
  },
  startRendering({state, getters, commit, dispatch}, pId) {
    let {object, renderParams} = getters.getRenderingPairById(pId)
    if (!object || !renderParams) return;

    let machine = state.machine
    let i = state.layers.indexOf(object);
    let forms = state.layers
      .filter(el => el instanceof Form && !renderParams.ignoreForms.find(f => f.id == el.id))
      .filter(el => state.layers.indexOf(el) > i)

    let image = getters.getObjectById(renderParams.image)
    let renderer = getters.getObjectById(renderParams.renderer)

    if (!image || !renderer) return;

    RenderingManager.startRendering(pId, {layer: {...object, renderParams: renderParams.params}, forms, image, renderer, machine})

  },
  executeRenderCommand({state}, {pId, cmd, payload}) {
    RenderingManager.sendCommand(pId, cmd, payload);
  },
  removeRenderParams({state, commit}, {id, pId}) {
    commit("removeRenderParams", {id, pId})
    RenderingManager.remove(pId);
  }
}
