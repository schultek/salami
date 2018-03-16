
import {round, makeCurveFactory, def} from "@/functions"
import {onLoad, isCutout, toPix, prepareLayer, prepareForms, prepareImage, prepareMachine} from "../functions"
import ImageLoader from "../ImageLoader"
import SvgBuilder from "../SvgBuilder"
import RenderScheduler from "../RenderScheduler"

let lines = [], paths = []
var layer, image, renderer, machine, forms;
let pixRad, factory, svg;

process.on("message", (event) => {
  console.log("Recieved Command:", event.cmd);
  switch (event.cmd) {
    case "preload": ImageLoader.load(event.payload); break;
    case "render": runRender(event.payload, false); break;
    case "fill": runRender(event.payload, true); break;
    default: throw new Error("Unsupported Command in Halftone Renderer Process!")
  }
})

function runRender(data, fill) {
  onLoad(data.image.id, () => {
    RenderScheduler.run(() => render(data, fill), (result) => {
      console.log("Rendering finished!")
      if (result) {
        process.send({result})
      }
    })
  })
}

function prepareHalftone(renderer) {
  renderer.direction = renderer.direction/360*Math.PI*2;
  renderer.dcos = Math.cos(renderer.direction);
  renderer.dsin = Math.sin(renderer.direction);
  renderer.xgap = renderer.dcos*renderer.gap;
  renderer.ygap = renderer.dsin*renderer.gap;
  renderer.rad = renderer.gap/2;

  return renderer;
}

function* render(data, fill) {

  console.log("Starting Rendering")

  layer = prepareLayer(data.layer);
  image = prepareImage(data.image, ImageLoader.get(data.image.id));
  renderer = prepareHalftone(data.renderer);
  machine = prepareMachine(data.machine);
  forms = prepareForms(data.forms);

  svg = new SvgBuilder(layer)

  lines = [];
  paths = [];

  var time = Date.now();
  var sendTime = Date.now();

  if (layer.w > machine.w) {
    let border = (layer.w - machine.w) / 2;
    if (border > layer.border.left)
      layer.border.left = border;
    if (border > layer.border.right)
      layer.border.right = border;
  }
  if (layer.h > machine.h) {
    let border = (layer.h - machine.h) / 2;
    if (border > layer.border.top)
      layer.border.top = border;
    if (border > layer.border.bottom)
      layer.border.bottom = border;
  }

  factory = makeCurveFactory(renderer, layer, machine);

  pixRad = Math.round(renderer.rad*image.pixels.shape[0]/image.w*renderer.smooth/100)

  let corners = [
    factory.find({x: layer.x        +layer.border.left,  y: layer.y        +layer.border.top    }),
    factory.find({x: layer.x+layer.w-layer.border.right, y: layer.y        +layer.border.top    }),
    factory.find({x: layer.x        +layer.border.left,  y: layer.y+layer.h-layer.border.bottom }),
    factory.find({x: layer.x+layer.w-layer.border.right, y: layer.y+layer.h-layer.border.bottom })
  ]

  let nums = factory.nums(corners)
  let steps = factory.steps(corners)

  if (!fill) {
    nums.min = -layer.renderParams.lines.l;
    nums.max = layer.renderParams.lines.r;
  }

  let expectedLineCount = nums.max - nums.min + 1;

  yield;

  for (let i = nums.min; i <= nums.max; i++) {
    let curve = generateCurve(i, steps)
    if (curve.inLayer) {
      lines = lines.concat(curve.lines)
      paths = paths.concat(curve.paths)
    }
    if (sendTime+100<Date.now()) {
      process.send({progress: 100*(i-nums.min)/expectedLineCount});
      sendTime = Date.now();
    }
    //console.log("Yield");
    yield;
  }
  if (fill) {
    let n = 1;
    while (n < 1000) {
      let curve = generateCurve(--nums.min, steps)
      if (curve.inLayer) {
        lines = curve.lines.concat(lines)
        paths = curve.paths.concat(paths);
      } else break;
      n++;
      yield;
    }
    n = 1;
    while (n < 1000) {
      let curve = generateCurve(++nums.max, steps)
      if (curve.inLayer) {
        lines = lines.concat(curve.lines)
        paths = paths.concat(curve.paths)
      } else break;
      n++;
      yield;
    }
  }

  console.log(`Generated ${lines.length} Lines (${Date.now()-time}ms)`);

  let result = {}

  if (fill)
    result.filled = {l: -nums.min, r: nums.max}

  result.path = paths.join(" ");
  result.lines = lines;

  return result
}


function svgFactory() {

  let paths = [];
  let path1 = "", path2 = "";
  let lastPoint;

  if (!layer.renderParams.dotted)
    return {
      next(p) {
        if (lastPoint) {
          path2 = svg.l(lastPoint[1])+path2;
        }
        if (path1 == "") {
          path1 = svg.m(p[0]);
          path2 = svg.a(p.r, 0, p[0])+"Z";
        } else {
          path1 += svg.l(p[0]);
        }
        lastPoint = p;
      },
      close() {
        if (lastPoint) {
          path2 = svg.a(lastPoint.r, 0, lastPoint[1]) + path2
        }
        paths.push(path1 + path2)
        path1 = path2 = ""
        lastPoint = null;
      },
      get() {
        if (lastPoint) {
          this.close()
        }
        return paths;
      }
    }
  else
    return {
      next(p) {
        path1 += svg.c(p);
      },
      close() {
        paths.push(path1);
        path1 = "";
      },
      get() {
        if (path1 != "")
          paths.push(path1)
        return paths;
      }
    }
}

function generateCurve(num, steps) {

  let curve = {inLayer: false, lines: [[]]};
  let cline = curve.lines[0];

  let svg = svgFactory()

  let cdata = factory.curve(num);

  if (cdata.length <= 0) {
    return {inLayer: false};
  }

  var di = 1/Math.round(renderer.steps*cdata.length/factory.maxlength);

  for (let i = steps.min-di; i<=steps.max+di; i += di) {

    var point = getPoint(i, cdata);

    curve.inLayer |= point.inLayer

    if (point.data) {
      if (cline.length==0) {
        var first = findEdgePoint(point, i, (i-di), cdata);
        if (first != point) {
          cline.push(first.data);
          svg.next(first.path)
        }
      }
      svg.next(point.path)
      cline.push(point.data);
    } else if (cline.length>0 && cline[cline.length-1].data) {
      var last = findEdgePoint(cline[cline.length-1], (i-di), i, cdata);
      if (last != cline[cline.length-1]) {
        cline.push(last.data);
        svg.next(last.path)
      }
      //add new line part
      svg.close()
      curve.lines.push([]);
      cline = curve.lines[curve.lines.length-1];
    }
  }

  if (curve.lines[curve.lines.length-1].length == 0) {
    curve.lines.splice(curve.lines.length-1, 1);
  }

  curve.paths = svg.get()
  return curve;
}

function findEdgePoint(pnt, ilow, ihigh, cdata, n) {
  if (layer.renderParams.dotted || renderer.refinedEdges == 0 || Math.abs(ihigh-ilow)*renderer.refinedEdges<0.01) { return  pnt; }
  try {
    var p = getPoint((ilow+ihigh)/2, cdata);
    if (p.data) {
      return findEdgePoint(p, (ihigh+ilow)/2, ihigh, cdata, n?n+1:1);
    } else {
      return findEdgePoint(pnt, ilow, (ihigh+ilow)/2, cdata, n?n+1:1);
    }
  } catch (e) {
    return pnt;
  }
}

function getPoint(step, cdata, widthdata) {
  var cp = cdata.point(step);

  if (cp && layer.inArea(cp)) {

    if (isCutout(cp, forms)) {
      return {inLayer: true}
    }

    let p = getDataPoint(cp, widthdata)

    return {inLayer: true, path: p ? cdata.path(p, step) : null, data: p};
  } else {
    return {inLayer: false};
  }
}

function getDataPoint(pos, withdata) {

  var sum = 0;
  var count = 0;
  var pix = toPix(pos, image);

  if (!renderer.smooth) {
    if (!image.inPixArea(pix)) {
      return null;
    } else {
      return {x: pos.x, y: pos.y, data: image.get(pix.x, pix.y)/255}
    }
  } else {
    //top left corner of point area
    var start = {x: pix.x-pixRad, y: pix.y-pixRad};
    //bottom right corner of point area
    var end = {x: pix.x+pixRad, y: pix.y+pixRad};

    if (!(image.inPixArea(start) || image.inPixArea(end) || image.inPixArea({x: start.x, y: end.y}) || image.inPixArea({x: end.x, y: start.y}))) {
      return null;
    }

    var dx = start.x<end.x?1:-1;
    var dy = start.y<end.y?1:-1;
    var xrange = start.x<end.x?function(ix) { return ix<end.x; }:function(ix) { return ix>=end.x; };
    var yrange = start.y<end.y?function(iy) { return iy<end.y; }:function(iy) { return iy>=end.y; };
    let i = {x: start.x, y: start.y};
    for (; xrange(i.x); i.x+=dx) {
      for (; yrange(i.y); i.y+=dy) {
        //point in image
        if (image.inPixArea(i)) {
          //calculate grayscale value from rgb
          sum += image.get(i.x, i.y);
          count++;
        }
      }
    }
    let d = sum / count / 255;
    return count>0?{x: pos.x, y: pos.y, data: layer.inverted ? 1-d : d}:null;
  }

}
