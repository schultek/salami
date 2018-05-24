
import ImageLoader from "../ImageLoader"
import {onLoad, isCutout, prepareLayer, prepareForms, prepareImage, prepareMachine} from "../functions"
import {map, round, getNewId} from "@/functions"
import VoronoiDiagram from "../stippling/VoronoiDiagram"
import SvgBuilder from "../SvgBuilder"
import RenderScheduler from "../RenderScheduler"

import Path from "../stippling/StipplePath"

var running = false;

var image, params, layer, forms, machine;
var voronoi, stipples, status, dots;
var checkx, checky, jitter, svg;

process.on("message", (event) => {
  console.log(event.cmd)
  switch (event.cmd) {
    case "preload": ImageLoader.load(event.payload); break;
    case "setup": setup(event.payload); break;
    case "next": RenderScheduler.add(next); break;
    case "start": start(); break;
    case "stop": stop(); break;
    case "pause": pause(); break;
    case "resume": resume(); break;
    default: throw new Error("Unsupported Command in Halftone Renderer Process!")
  }
})

function pause() {
  RenderScheduler.pause()
}

function resume() {
  RenderScheduler.resume()
}

function start() {

  if (!params || !voronoi) {
    process.send({error: "Setup must be called first!"})
    return;
  };

  stop();
  running = true;
  let run = () => {
    if (running && !finished()) {
      RenderScheduler.run(next, run)
    } else {
      stop();
      process.send({result: {finished: true}})
    }
  }
  run()
}

function setup(data) {

  running = false;
  RenderScheduler.stop();

  onLoad(data.image.id, () => {

    image = prepareImage(data.image, ImageLoader.get(data.image.id));
    machine = prepareMachine(data.machine);
    layer = prepareLayer(data.layer);
    params = prepareParams(data.renderer, layer, machine);
    forms = prepareForms(data.forms);

    sendResult();

    voronoi = new VoronoiDiagram(image, layer, params);
    svg = new SvgBuilder(layer)

    init();

    let jit = {x: 0.001 * layer.w, y: 0.001 * layer.h};
    jitter = (s) => ({
      x: s.x + random(-jit.x, jit.x),
      y: s.y + random(-jit.y, jit.y)
    })

  })
}

function prepareParams(params, layer, machine) {

  params.maxSize = round(machine.bit.inDepth/machine.bit.height*machine.bit.width, 100);
  params.minSize = machine.bit.tip;

  params.pointSizeMin = map(params.pointSizeMin, 0, 100, params.minSize, params.maxSize)
  params.pointSizeMax = map(params.pointSizeMax, 0, 100, params.minSize, params.maxSize)

  params.initialPoints = 100;

  params.preview = layer.renderParams.preview;

  params.upper = params.preview ? 4 : 1.5;
  params.lower = params.preview ? 0.005 : 0.4;

  params.maxIterations = params.preview ? 30 : 50;

  return params;

}

function* next() {

  let time = Date.now()

  if (!params || !voronoi) {
    process.send({error: "Setup must be called first!"})
    return;
  };

  status.splits = 0;
  status.merges = 0;

  let cells = yield voronoi.calculate(stipples);

  stipples = [];

  for (let cell of cells) {
    let totalDensity = cell.sumDensity;
    let diameter = stippleSize(cell)

    if (totalDensity < map(status.iteration, 0, params.maxIterations, 1, params.lower) * pointArea(diameter) || cell.area == 0 || eaten(cell)) {
      // cell too small - merge
      status.merges++;
      Path.remove(cell.id)
      continue;
    }
    if (totalDensity < map(status.iteration, 0, params.maxIterations, 1, params.upper) * pointArea(diameter)) {
      // cell size within acceptable range - keep
      let s = new Stipple(cell.centroid, cell.size, cell.id)
      stipples.push(s)
      Path.update(cell.id, s)
      continue;
    }

    // cell too large - split
    let area = Math.max(1, cell.area);
    let circleRadius = Math.sqrt(area / Math.PI)
    let splitVector = {x: 0.5 * circleRadius, y: 0}

    let a = cell.orientation
    let splitVectorRotated = {
      x: splitVector.x * Math.cos(a) - splitVector.y * Math.sin(a),
      y: splitVector.y * Math.cos(a) + splitVector.x * Math.sin(a)
    }

    let splitSeed1 = {
      x: cell.centroid.x - splitVectorRotated.x,
      y: cell.centroid.y - splitVectorRotated.y
    }

    let splitSeed2 = {
      x: cell.centroid.x + splitVectorRotated.x,
      y: cell.centroid.y + splitVectorRotated.y
    }


    let s1 = new Stipple(jitter(splitSeed1), diameter)
    let s2 = new Stipple(jitter(splitSeed2), diameter)

    Path.split(cell.id, s1, s2)

    stipples.push(s1)
    stipples.push(s2)

    status.splits++;

    yield;
  }

  let arr = Path.toArray();
  dots = arr.map(scaleToEdge).filter(s => s.size >= params.pointSizeMin)

  status.points = stipples.length;
  status.iteration++;

  sendResult();
}

function sendResult() {

  if (!dots || dots.length == 0) return;

  let filtered = dots.filter(s => layer.inArea(s.pos) && !isCutout(s.pos, forms))

  let lines = filtered.map(s => [{...s.pos, data: s.size/2}])
  let path = filtered.map(s => svg.c({...s.pos, r: s.size/2})).join("\n")

  //path = svg.m(filtered[0].pos) + filtered.slice(1).map(s => " " + svg.l(s.pos)).join("\n")

  process.send({result: {lines, path, status}})
}

function scaleToEdge(s) {

  if (!layer.inArea(s.pos)) {
    return new Stipple(s.pos, 0, s.id);
  }

  let dot = {x: s.pos.x, y: s.pos.y, r: s.size};
  let edge = layer.onEdge(dot);

  if (edge.length == 0) {
    return s;
  }

  if (edge.indexOf("1") >= 0) {
    dot.r = (dot.x + dot.r - (layer.x + layer.border.left)) / 2;
    dot.x = (layer.x + layer.border.left) + dot.r;
  }
  if (edge.indexOf("2") >= 0) {
    dot.r = ((layer.x + layer.w - layer.border.right) - (dot.x - dot.r)) / 2;
    dot.x = (layer.x + layer.w - layer.border.right) - dot.r;
  }
  if (edge.indexOf("3") >= 0) {
    dot.r = (dot.y + dot.r - (layer.y + layer.border.top)) / 2;
    dot.y = (layer.y + layer.border.top) + dot.r;
  }
  if (edge.indexOf("4") >= 0) {
    dot.r = ((layer.y + layer.h - layer.border.bottom) - (dot.y - dot.r)) / 2;
    dot.y = (layer.y + layer.h - layer.border.bottom) - dot.r;
  }

  return new Stipple({x: dot.x, y: dot.y}, dot.r, s.id);

}

function stop() {
  running = false;
  RenderScheduler.stop();
  init()
}

function init() {
  if (params && image && layer) {

    stipples = [];
    if (params.hotspots.length == 0) {
      for (let i=0; i < params.initialPoints; i++) {
         stipples.push(new Stipple({x: random(layer.x, layer.x+layer.w), y: random(layer.y, layer.y+layer.h)}, params.pointSizeMax));
      }
    } else {
      for (let h of params.hotspots) {
        for (let i=0; i < params.initialPoints; i++) {
           stipples.push(new Stipple({x: random(h.x - h.r, h.x + h.r), y: random(h.y - h.r, h.y + h.r)}, params.pointSizeMax));
        }
      }
    }

    Path.init(stipples)
  }
  status = {
    iteration: 0, size: 0, splits: 1, merges: 1
  }
}

class Stipple {
  constructor(pos, size, id) {
    this.pos = pos;
    this.size = size;
    this.id = id || getNewId();
  }
}

function random(min, max) {
  return min + Math.random() * (max-min)
}

function pointArea(pointDiameter) {
  return Math.PI * pointDiameter * pointDiameter / 4;
}

function eaten(cell) {
  if (params.hotspots.length == 0) return false;
  let hotspot = getMinHotspot(cell.centroid)
  let a = cell.centroid.x - hotspot.x
  let b = cell.centroid.y - hotspot.y
  let x = hotspot.reduce/100 * Math.sqrt(a*a+b*b) / hotspot.r

  let r = Math.random();
  r = Math.sqrt(r)

  return 1 + r < x
}

function getMinHotspot(p) {
  let minh;
  for (let h of params.hotspots) {
    if (!minh || dist(p.x, p.y, h.x, h.y) < dist(p.x, p.y, minh.x, minh.y)) {
      minh = h;
    }
  }
  return minh;
}

function stippleSize(cell) {
  let avg = cell.sumDensity / cell.area;
  let diam = params.pointSizeMin + avg * (params.pointSizeMax - params.pointSizeMin);

  if (params.hotspots.length > 0) {
    let hotspot = getMinHotspot(cell.centroid)
    let a = cell.centroid.x - hotspot.x
    let b = cell.centroid.y - hotspot.y
    let x = Math.sqrt(a*a+b*b) / hotspot.r
    return Math.min(params.maxSize, Math.max(params.minSize, diam * fSize(x, hotspot.weight/100)));
  } else {
    return diam;
  }
}

function fSize(x, w) {
  return 1/(w+1) + (w)/(w+1)*x
}

function finished() {
  return (status.splits == 0 && status.merges == 0) || (status.iteration >= params.maxIterations)
}
