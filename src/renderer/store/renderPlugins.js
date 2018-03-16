
import {HalftoneRenderer} from "@/models.js"
import {makeCurveFactory, round} from "@/functions.js"

export function curvePlugin(store) {
  store.subscribe((mutation, state) => {
    if (mutation.type == "updateObject" || mutation.type == "addObject") {
      let o = store.getters.getObjectById(mutation.payload.id);
      if (o instanceof HalftoneRenderer) {
        let paths = generateCurvePaths(o)
        store.commit("setSVGPathById", {id: o.id, path: paths});
      }
    }
  })
}

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
