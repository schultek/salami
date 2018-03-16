
import ImageLoader from "../ImageLoader"
import {onLoad, isCutout, prepareLayer, prepareForms, prepareImage, prepareMachine} from "../functions"
import {map, round, getNewId} from "@/functions"
import VoronoiDiagram from "../stippling/VoronoiDiagram"
import SvgBuilder from "../SvgBuilder"
import RenderScheduler from "../RenderScheduler"

import Path from "../stippling/StipplePath"

var running = false;

var image, params, layer, forms, machine;
var voronoi, stipples, status
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
  stop();
  running = true;
  let run = () => {
    if (running && !finished())
      RenderScheduler.run(next, run)
  }
  run()
}

function setup(data) {

  running = false;
  RenderScheduler.stop();

  onLoad(data.image.id, () => {

    image = prepareImage(data.image, ImageLoader.get(data.image.id));
    machine = prepareMachine(data.machine);
    params = prepareParams(data.renderer, machine);
    layer = prepareLayer(data.layer);
    forms = prepareForms(data.forms);

    params.maxIterations = 50;

    voronoi = new VoronoiDiagram(image, layer, params);
    svg = new SvgBuilder(layer)

    init();

    checkx = (n) => Math.max(layer.x, Math.min(n, layer.x+layer.w))
    checky = (n) => Math.max(layer.y, Math.min(n, layer.y+layer.h))

    let jit = {x: 0.001 * layer.w, y: 0.001 * layer.h};
    jitter = (s) => ({
      x: s.x + random(-jit.x, jit.x),
      y: s.y + random(-jit.y, jit.y)
    })

  })
}

function prepareParams(params, machine) {

  let maxSize = round(machine.bit.inDepth/machine.bit.height*machine.bit.width, 100);
  let minSize = machine.bit.tip;

  params.pointSize = map(params.pointSize, 0, 100, minSize, maxSize)
  params.pointSizeMin = map(params.pointSizeMin, 0, 100, minSize, maxSize)
  params.pointSizeMax = map(params.pointSizeMax, 0, 100, minSize, maxSize)

  if (params.pointSizeMin > params.pointSizeMax) {
    params.pointSize = params.pointSizeMax
    params.adaptivePointSize = false;
  }

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

  let quality = currentQuality();
  status.quality = quality

  for (let cell of cells) {
    let totalDensity = cell.sumDensity;
    let diameter = stippleSize(cell)

    if (totalDensity < splitLower(diameter, quality) || cell.area == 0 || eaten(cell)) {
      // cell too small - merge
      status.merges++;
      Path.remove(cell.id)
      continue;
    }
    if (totalDensity < splitUpper(diameter, quality)) {
      // cell size within acceptable range - keep
      let s = new Stipple(cell.centroid, diameter, cell.id)
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


    splitSeed1.x = checkx(splitSeed1.x)
    splitSeed1.y = checky(splitSeed1.y)

    splitSeed2.x = checkx(splitSeed2.x)
    splitSeed2.y = checky(splitSeed2.y)

    let s1 = new Stipple(jitter(splitSeed1), diameter)
    let s2 = new Stipple(jitter(splitSeed2), diameter)

    Path.split(cell.id, s1, s2)

    stipples.push(s1)
    stipples.push(s2)

    status.splits++;

    yield;
  }

  let arr = Path.toArray();
  let filtered = arr.filter(s => layer.inArea(s.pos) && !isCutout(s.pos, forms))

  let lines = filtered.map(s => [{...s.pos, data: s.size/2}])
  let path = filtered.map(s => svg.c({...s.pos, r: s.size/2})).join("\n")

  //path = svg.m(filtered[0].pos) + filtered.slice(1).map(s => " " + svg.l(s.pos)).join("\n")

  status.points = stipples.length;

  process.send({result: {lines, path, status}})
  process.send({progress: (status.iteration / params.maxIterations) * 100})

  status.iteration++;

  console.log(`Compute time for ${stipples.length} Points: ${Date.now()-time}ms`)

}

function stop() {
  running = false;
  RenderScheduler.stop();
  init()
}

function init() {
  if (params && image && layer) {
    initStipples()
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

function initStipples(size) {

  stipples = [];
  stipples.push(new Stipple({x: random(layer.x, layer.x+layer.w), y: random(layer.y, layer.y+layer.h)}, params.pointSize));
  stipples.push(new Stipple({x: random(layer.x, layer.x+layer.w), y: random(layer.y, layer.y+layer.h)}, params.pointSize));
}

function pointArea(pointDiameter) {
  return Math.PI * pointDiameter * pointDiameter / 4;
  //return pointDiameter * pointDiameter;
}

function splitUpper(pointDiameter, quality) {
  return (1 + quality / 2) * pointArea(pointDiameter);
}

function splitLower(pointDiameter, quality) {
  return (1 - quality / 2) * pointArea(pointDiameter)
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
  let diam;
  if (params.adaptivePointSize) {
    let avgIntensitySqrt = Math.sqrt(cell.sumDensity / cell.area);
    diam = params.pointSizeMin * (1 - avgIntensitySqrt) +
      params.pointSizeMax * avgIntensitySqrt;
  } else {
    diam = params.pointSize;
  }
  if (params.hotspots.length > 0) {
    let hotspot = getMinHotspot(cell.centroid)
    let a = cell.centroid.x - hotspot.x
    let b = cell.centroid.y - hotspot.y
    let x = Math.sqrt(a*a+b*b) / hotspot.r
    return diam * fSize(x, hotspot.weight/100);
  } else {
    return diam;
  }
}

function fSize(x, w) {
  return 1/(w+1) + (w)/(w+1)*x
}

function currentQuality() {
  let delta = params.quality / Math.max(params.maxIterations - 1, 1);
  return params.quality + status.iteration * delta;
}

function finished() {
  return (status.splits == 0 && status.merges == 0) || (status.iteration == params.maxIterations)
}
