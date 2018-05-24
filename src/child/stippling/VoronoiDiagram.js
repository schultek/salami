
import Voronoi from "voronoi"
import Canvas from "canvas"
import {map, round} from "@/functions.js"

class Moments {
  constructor() {
    this.moment00 = this.moment10 = this.moment01
      = this.moment11 = this.moment20 = this.moment02 = 0;
  }
}

class VoronoiCell {
  constructor(id) {
    this.centroid = {x: 0, y: 0}
    this.id = id
    this.orientation = this.area = this.sumDensity = 0;
    this.min = this.max = this.div = 0;
  }
}

export default class VoronoiDiagram {
  constructor(image, layer, params) {
    this.voronoi = new Voronoi()
    this.image = image;
    this.layer = layer;
    this.setup(params.preview);
  }
  setup(preview) {
    this.scaleX = preview ? this.image.w / this.image.pixW * 0.8 : 1
    this.scaleY = preview ? this.image.h / this.image.pixH * 0.8 : 1
    this.bbox = {xl: 0, xr: this.image.pixW * this.scaleX, yt: 0, yb: this.image.pixH * this.scaleY}
    this.areaScale = (this.image.w * this.image.h) / (this.image.pixW * this.image.pixH) / this.scaleX / this.scaleY;
  }
  checkDimens(p) {
    return [
      Math.max(this.bbox.xl, Math.min(p[0], this.bbox.xr)),
      Math.max(this.bbox.yt, Math.min(p[1], this.bbox.yb))
    ]
  }
  *calculate(points) {

    if (this.diagram) {
      try {
        this.voronoi.recycle(this.diagram);
      } catch (e) {
        console.log("Recycle: ", e)
      }
    }

    let positions = points.map(p => {
      let pos = this.image.toPix(p.pos)
      return {x: pos.x * this.scaleX, y: pos.y * this.scaleY}
    })

    try {
      this.diagram = this.voronoi.compute(positions, this.bbox);
    } catch (e) {
      console.log("Compute: ",e)
    }

    yield;

    let imap = yield this.createMap(points.map((p, i) => ({id: p.id, cellId: positions[i].voronoiId})))
    let stipples = yield this.computeCells(imap)

    return stipples;
  }
  *createMap(points, pos) {

    let cells = this.diagram.cells.map(cell => cell.halfedges.reduce((poly, {edge}) => {
      let find = () => {
        if (sameEdge(poly[poly.length-1], edge.va)) {
          poly.push([edge.vb.x, edge.vb.y])
          return true;
        } else if (sameEdge(poly[poly.length-1], edge.vb)) {
          poly.push([edge.va.x, edge.va.y])
          return true;
        } else {
          return false
        }
      }
      if (poly.length >= 2) {
        if (!find() && !(() => {
          poly.reverse()
          return find();
        })()) {
          throw new Error("Couldn't construct Polygon")
        }
        return poly;
      } else {
        return poly.concat([[edge.va.x, edge.va.y], [edge.vb.x, edge.vb.y]])
      }
    }, []).slice(0, -1).map(c => this.checkDimens(c))).filter(cell => cell.length > 0)

    yield;

    let offset = {x: this.bbox.xl, y: this.bbox.yt}

    const canvas = new Canvas(this.bbox.xr - offset.x, this.bbox.yb - offset.y);
    const ctx = canvas.getContext("2d");
    ctx.antialias = "none"
    let colors = []
    cells.forEach((cell, i) => {

      if (!cell || !cell[0]) {
        console.error(cell, i, this.diagram.cells[i]);
      }

      let color = getCellColor(i);
      colors.push(color)
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.moveTo(cell[0][0] - offset.x, cell[0][1] - offset.y)


      for (let i = 1; i < cell.length; i++) {
        ctx.lineTo(cell[i][0] - offset.x, cell[i][1] - offset.y)
      }
      ctx.closePath()
      ctx.fill()
    })

    yield;

    let pixels = canvas.toBuffer("raw");
    let stride = canvas.stride

    process.send({result: {voronoi: canvas.toDataURL()}})

    let idMap = new Map()
    for (let i = 0; i < points.length; i++) {
      idMap.set(points[i].cellId, points[i].id)
    }

    return {
      getIndex(x, y) {
        let i = (y - offset.y) * stride + (x - offset.x) * 4;
        return getCellIndex(pixels[i], pixels[i+1], pixels[i+2])
      },
      getId(i) {
        return idMap.get(i)
      }
    }
  }
  *computeCells(map, positions) {

    let cells = [], moments = [];

    for (let i = 0; i < this.diagram.cells.length; i++) {
      cells.push(new VoronoiCell(map.getId(i)))
      moments.push(new Moments())
    }

    for (let x = this.bbox.xl; x < this.bbox.xr; x++) {
      for (let y = this.bbox.yt; y < this.bbox.yb; y++) {

        let index = map.getIndex(x, y);
        if (cells[index] === undefined) continue;

        let pixel = this.image.get(x / this.scaleX, y / this.scaleY) / 255;
        let density = this.layer.inverted ? pixel : 1 - pixel

        let cell = cells[index]

        cell.area++;
        cell.sumDensity += density;

        let m = moments[index]
        m.moment00 += density;
        m.moment10 += x * density;
        m.moment01 += y * density;
        m.moment11 += x * y * density;
        m.moment20 += x * x * density;
        m.moment02 += y * y * density;
      }
    }

    yield;

    // compute cell quantities
    for (let i = 0; i < cells.length; i++) {
      let cell = cells[i]
      if (cell.sumDensity <= 0)
        continue;

      let m = moments[i];
      // centroid
      cell.centroid.x = m.moment10 / m.moment00;
      cell.centroid.y = m.moment01 / m.moment00;
      // orientation
      let x = m.moment20 / m.moment00 - cell.centroid.x * cell.centroid.x
      let y = 2 * (m.moment11 / m.moment00 - cell.centroid.x * cell.centroid.y)
      let z = m.moment02 / m.moment00 - cell.centroid.y * cell.centroid.y
      cell.orientation = Math.atan2(y, x - z) / 2

      cell.area = cell.area * this.areaScale
      cell.sumDensity = cell.sumDensity * this.areaScale

      cell.centroid = this.image.toMM({x: (cell.centroid.x+0.5) / this.scaleX, y: (cell.centroid.y+0.5) / this.scaleY})

      cell.size = 2 * Math.sqrt(cell.sumDensity / Math.PI)
    }

    return cells;
  }
}

let F = 1/1000000
function sameEdge(p, e) {
  return Math.abs(p[0]-e.x) < F && Math.abs(p[1]-e.y) < F
}

const colorMap = new Map();

function getCellColor(i) {
  let r, g, b, c;
  do {
    r = Math.random() * 255;
    g = Math.random() * 255;
    b = Math.random() * 255;
    c = (r << 16 | g << 8 | b);
  } while (colorMap.has(c))
  colorMap.set(c, i);
  return "#"+("000000"+c.toString(16)).slice(-6)
}

function getCellIndex(r, g, b) {
  let c = b << 16 | g << 8 | r;
  return colorMap.get(c);
}
