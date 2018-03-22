
import {HalftoneRenderer, Text, Font} from "@/models.js"
import {makeCurveFactory, round, notify} from "@/functions.js"

import {TextRenderer, FontManager} from "@/rendering/TextRenderer.js"

export default [
  store => store.subscribe((mutation, state) => {
    if (mutation.type == "updateObject" || mutation.type == "addObject") {
      let o = store.getters.getObjectById(mutation.payload.id);
      if (o instanceof HalftoneRenderer) {
        let paths = generateCurvePaths(o)
        store.commit("updateObjectSilent", {id: o.id, path: paths});
      }
    }
  }),
  store => {
    let textRenderer = new Map();
    store.subscribe((mutation, state) => {
      if (["addObject", "updateObject", "putObject", "removeObject", "resizeObject"].indexOf(mutation.type) >= 0) {
        let o = store.getters.getObjectById(mutation.payload.id);
        if (o instanceof Text) {
          if (mutation.type == "addObject") {
            textRenderer.set(o.id, new TextRenderer(o.id, store))
            textRenderer.get(o.id).render(true);
          }
          if (mutation.type == "resizeObject") {
            if (!textRenderer.has(o.id))
              textRenderer.set(o.id, new TextRenderer(o.id, store))
            textRenderer.get(o.id).updateText(true);
          }
          if (mutation.type == "updateObject" || mutation.type == "putObject") {
            if (!textRenderer.has(o.id))
              textRenderer.set(o.id, new TextRenderer(o.id, store))
            textRenderer.get(o.id).render(!(mutation.payload && mutation.payload.size));
          }
          if (mutation.type == "removeObject") {
            textRenderer.delete(o.id);
          }
        }
        if (o instanceof Font) {
          if (mutation.type == "addObject") {
            FontManager.load(o, (err) => {
              if (err) {
                notify({
                  group: "default",
                  title: "Font couldn't be loaded!",
                  text: `${o.file} is not a supported Font File. ${err.message}`,
                  type: "error"
                })
                store.commit("removeObject", o.id)
              } else {
                console.log("Font loaded:", o.file)
              }
            })
          }
          if (mutation.type == "removeObject") {
            FontManager.delete(o)
          }
        }
      }
    })
  }
]

const count = 3;

function generateCurvePaths(renderer) {

  renderer = {...renderer};

  renderer.direction = round(renderer.direction / 360 * Math.PI*2)
  renderer.dcos = round(Math.cos(renderer.direction));
  renderer.dsin = round(Math.sin(renderer.direction));
  renderer.xgap = round(renderer.dcos*renderer.gap);
  renderer.ygap = round(renderer.dsin*renderer.gap);

  let factory = makeCurveFactory(renderer)

  let paths = []

  for (var i = -count; i <= count; i++) {
    paths.push({
      data: makePath(i, renderer, factory),
      opacity: 1 - Math.abs(i) / (count+1)
    })
  }

  return paths
}

function makePath(num, renderer, factory) {
  var cdata = factory.curve(num);
  var di = 1/Math.round(renderer.steps*cdata.length/factory.maxlength);
  var path = "";
  for (var i = 0-di; i<=1+di; i += di) {
    var point = cdata.point(i);
    if (point)
      path += (path==""?"M ":"L ")+(point.x-renderer.x)+" "+(point.y-renderer.y)+" ";
  }
  return path;
}
