
import sizeOf from "image-size"

import {showOpenDialog, getDataURL} from "../helpers.js"
import RenderingManager from "@/rendering/RenderingManager.js"

export default {
  async loadImage({commit, dispatch, getters, state}, {id, url}) {
    let orig = getters.getObjectById(id)
    if (!orig) return;
    let img = {
      id, url,
      data: url ? await getDataURL(url) : state.imgDefault.data
    }
    if (url) {
      RenderingManager.preloadImage({id, url})
      let dimens = sizeOf(url)
      let h = Math.round(dimens.height / dimens.width * orig.w);
      if (h >= orig.h) {
        img.y = (orig.h - h) / 2;
        img.h = h;
      } else {
        let w = Math.round(dimens.width / dimens.height * orig.h);
        img.x = (orig.w - w) / 2;
        img.w = w;
      }
    }
    commit("updateObject", img)
    console.log("Image Data loaded for " + img.id);
  },
  async loadNewImage({state, dispatch}, id) {
    let file = await showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif', 'jpeg']}]})
    if (!file) return
    dispatch("loadImage", {id, url: file});
  }
}
