
import {getNewId, updateDeep} from "@/functions.js"

class BaseObject {
  constructor(o) {
    this.title = o.title || "";
    this.x = o.x || 0; this.y = o.y || 0;
    this.w = o.w || 0; this.h = o.h || 0;
    this.id = getNewId();
  }
  asObject(...props) {
    let o = {}
    props.forEach(p => o[p] = this[p])
    return o
  }
  map360(o, prop) {
    while (o[prop] < 0) o[prop] += 360
    while (o[prop] > 360) o[prop] -= 360
  }
  update(o) {
    if ("w" in o && o.w < 0) o.w = 0;
    if ("h" in o && o.h < 0) o.h = 0;
    updateDeep(this, o)
  }
}

export class Layer extends BaseObject {
  constructor(o) {
    super(o)
    this.renderParams = o.renderParams && o.renderParams.length > 0 ?
      o.renderParams.map(p => new RenderParams(p))
      : []
  }
  isRendering() {
    return true
  }
  asObject(...params) {
    return super.asObject(...params)
  }
  update(o) {
    if ("renderParams" in o) throw new Error("Update RenderParams only through add / remove methods!")
    super.update(o)
  }
  getRenderParams(id) {
    return this.renderParams.find(p => p.id == id)
  }
  addRenderer(o) {
    this.renderParams.push(new RenderParams(o))
  }
  removeRenderer(id) {
    let p = this.getRenderParams(id)
    if (p) this.renderParams.splice(this.renderParams.indexOf(p), 1)
  }
  toObj() {
    return {
      ...super.asObject("id", "x", "y", "w", "h", "title"),
      renderParams: this.renderParams.map(r => r.toObj())
    }
  }
}

export class CPart extends Layer {
  constructor(o) {
    super(o)
    o.border = o.border || {}
    this.border = {
      left: o.border.left || 5, right: o.border.right || 5,
      top: o.border.top || 5, bottom: o.border.bottom || 5
    }
    this.inverted = o.inverted || false
  }
  toObj() {
    return {
      ...super.toObj(),
      ...super.asObject("border", "inverted")
    }
  }
  update(o) {
    if ("border" in o) {
      if ("left" in o.border && o.border.left < 0) o.border.left = 0
      if ("right" in o.border && o.border.right < 0) o.border.right = 0
      if ("top" in o.border && o.border.top < 0) o.border.top = 0
      if ("bottom" in o.border && o.border.bottom < 0) o.border.bottom = 0
    }
    super.update(o)
  }
}

export class Form extends Layer {
  constructor(o) {
    super(o)
    this.rot = o.rot || 0
    this.type = o.type || "rect"
    this.ownRenderer = o.ownRenderer || false
  }
  toObj() {
    return {
      ...super.toObj(),
      ...super.asObject("rot", "type", "renderer", "ownRenderer")
    }
  }
  isRendering() {
    return this.ownRenderer
  }
  update(o) {
    if ("rot" in o) super.map360(o, "rot")
    if ("type" in o && o.type != "rect" && o.type != "ellipse") delete o.type
    super.update(o)
  }
}

export class Image extends BaseObject {
  constructor(o) {
    super(o);
    this.rot = o.rot || 0
    this.url = ""
    this.data = ""
  }
  toObj() {
    return super.asObject("id", "x", "y", "w", "h", "rot", "title", "url", "data")
  }
  update(o) {
    if ("rot" in o) super.map360(o, "rot")
    super.update(o)
  }
}

export class Renderer extends BaseObject {
  constructor(o) {
    super(o)
  }
  asObject(...params) {
    return super.asObject(...params)
  }
  update(o) {
    super.update(o)
  }
  static fromObj(o) {
    if (o.type == "halftone") return new HalftoneRenderer(o)
    if (o.type == "stipple") return new StippleRenderer(o)
  }
}

export class RenderParams {
  constructor(o) {
    if (!o) o = {}
    this.id = getNewId()
    this.image = o.image || null
    this.renderer = o.renderer || null
    this.ignoreForms = o.ignoreForms || []
    this.type = o.type || "halftone"
    this.path = ""
    this.gcode = {time: 0, gcode: ""}
    this.params = o.params ||
      this.type == "halftone" ? {lines: {l: 10, r: 10}, dotted: false} :
      this.type == "stipple" ? {status: {iteration: 0, points: 0, splits: 0, merges: 0, quality: 0}, voronoi: ""} : {}
  }
  update(o) {
    if ("renderer" in o || "type" in o) throw new Error("Renderer is immutable!")
    updateDeep(this, o)
  }
  toObj() {
    return {id: this.id, image: this.image, renderer: this.renderer, ignoreForms: this.ignoreForms, type: this.type, params: this.params}
  }
}

export class HalftoneRenderer extends Renderer {
  constructor(o) {
    super(o)
    this.curve = o.curve || "Linie"
    this.direction = o.direction || 45
    this.stretch = o.stretch || 80
    this.gap = o.gap || 2
    this.steps = o.steps || 200
    this.refinedEdges = o.refinedEdges || 50
    this.smooth = o.smooth || 50
  }
  toObj() {
    return {...super.asObject("id", "x", "y", "title", "curve", "direction", "stretch", "gap", "steps"), type: "halftone"}
  }
  update(o) {
    if ("direction" in o) super.map360(o, "direction")
    if ("stretch" in o && o.stretch < 1) o.stretch = 1
    if ("steps" in o && o.steps < 1) o.steps = 1
    if ("gap" in o && o.gap < 0.1) o.gap = 0.1
    if ("refinedEdges" in o && o.refinedEdges > 100) o.refinedEdges = 100
    if ("refinedEdges" in o && o.refinedEdges < 0) o.refinedEdges = 0
    if ("smooth" in o && o.smooth > 100) o.smooth = 100;
    if ("smooth" in o && o.smooth < 0) o.smooth = 0;
    super.update(o)
  }
}

export class StippleRenderer extends Renderer {
  constructor(o) {
    super(o)
    this.pointSize = o.pointSize || 50
    this.adaptivePointSize = o.adaptivePointSize || true
    this.pointSizeMin = o.pointSizeMin || 0
    this.pointSizeMax = o.pointSizeMax || 100
    this.quality = o.quality || 1
    this.hotspots = o.hotspots || []
    if ("x" in o && "y" in o) {
      this.hotspots.push(new Hotspot({x: o.x, y: o.y}))
    }
  }
  toObj() {
    return {...super.asObject("id", "title", "pointSize", "adaptivePointSize", "pointSizeMin", "pointSizeMax", "quality", "hotspots"), type: "stipple"}
  }
  update(o) {
    if ("pointSize" in o && o.pointSize < 0) o.pointSize = 0
    if ("pointSize" in o && o.pointSize > 100) o.pointSize = 100
    if ("pointSizeMin" in o && o.pointSizeMin < 0) o.pointSizeMin = 0
    if ("pointSizeMin" in o && o.pointSizeMin > 100) o.pointSizeMin = 100
    if ("pointSizeMax" in o && o.pointSizeMax < 0) o.pointSizeMax = 0
    if ("pointSizeMax" in o && o.pointSizeMax > 100) o.pointSizeMax = 100
    if ("quality" in o && o.quality > 100) o.quality = 100
    if ("quality" in o && o.quality < 0) o.quality = 0
    if ("hotspot" in o) {
      if ("add" in o.hotspot) this.hotspots.push(o.hotspot.add)
      if ("remove" in o.hotspot) this.hotspots.splice(o.hotspot.remove, 1)
      if ("set" in o.hotspot) {
        let h = this.hotspots.find(h => h.id == o.hotspot.set.id)
        if (h) h.update(o.hotspot.set);
      }
      delete o.hotspot;
    }
    if ("hotspots" in o) {
      for (let i in o.hotspots) {
        if (this.hotspots[i])
          this.hotspots[i].update(o.hotspots[i])
      }
      delete o.hotspots;
    }
    super.update(o)
  }
  getBounds() {
    if (this.hotspots.length > 0) {
      let h0 = this.hotspots[0]
      return this.hotspots.reduce((b, h) => ({
        x1: Math.min(b.x1, h.x), x2: Math.max(b.x2, h.x),
        y1: Math.min(b.y1, h.y), y2: Math.max(b.y2, h.y)
      }), {x1: h0.x, x2: h0.x, y1: h0.y, y2: h0.y})
    } else {
      return null;
    }
  }
}

export class Hotspot {
  constructor(o = {}) {
    this.id = getNewId();
    this.x = o.x || 0
    this.y = o.y || 0
    this.r = o.r || 50
    this.weight = o.weight || 50
    this.reduce = o.reduce || 0
  }
  update(o) {
    if ("r" in o && o.r < 0) o.r = 0;
    if ("weight" in o && o.weight < 0) o.weight = 0;
    if ("weight" in o && o.weight > 100) o.weight = 100;
    if ("reduce" in o && o.reduce < 0) o.reduce = 0;
    if ("reduce" in o && o.reduce > 100) o.reduce = 100;
    updateDeep(this, o)
  }
}

export class Text extends BaseObject {
  constructor(o) {
    super(o)
    this.rot = o.rot || 0
    this.stroke = o.stroke || 1
    this.size = o.size || 12
    this.font = o.font || null
  }
  toObj() {
    return super.asObject("id", "x", "y", "rot", "title", "stroke", "size", "font")
  }
  update(o) {
    if ("rot" in o) super.map360(o, "rot")
    if ("stroke" in o && o.stroke < 0.1) o.stroke = 0.1
    if ("size" in o && o.size < 1) o.size = 1
    super.update(o)
  }
}

export class Font {
  constructor() {
    this.id = getNewId();
    this.file = o.file || ""
    this.title = o.title || ""
  }
  toObj() {
    return {id: o.id, file: o.file, title: o.title}
  }
}

export class Machine extends BaseObject {
  constructor(o = {}) {
    super(o)
    this.w = o.w || 300
    this.h = o.h || 200
    this.bit = o.bit ? {
      width: o.bit.width || 2.0,
      height: o.bit.height || 3.2,
      tip: o.bit.tip || 0.1,
      inDepth: this.bit.inDepth || 1.5
    } : {width: 2.0, height: 3.2, tip: 0.1, inDepth: 1.5}
    this.speed = o.speed ? {
      feedrate: o.speed.feedrate || 400,
      feedrateDot: o.speed.feedrateDot || 800,
      seekrate: o.speed.seekrate || 1000
    } : {feedrate: 400, feedrateDot: 800, seekrate: 1000}
    this.outHeight = o.outHeight || 1
  }
  toObj() {
    return super.asObject("w", "h", "bit", "speed", "outHeight")
  }
  update(o) {
    if ("bit" in o) {
      if ("width" in o.bit && o.bit.width < 0.1) o.bit.width = 0.1
      if ("height" in o.bit && o.bit.height < 0.1) o.bit.height = 0.1
      if ("tip" in o.bit && o.bit.tip < 0.001) o.bit.tip = 0.001
      if ("inDepth" in o.bit && o.bit.inDepth < 0.1) o.bit.inDepth = 0.1
    }
    if ("speed" in o) {
      if ("feedrate" in o.speed && o.speed.feedrate < 1) o.speed.feedrate = 1
      if ("feedrateDot" in o.speed && o.speed.feedrateDot < 1) o.speed.feedrateDot = 1
      if ("seekrate" in o.speed && o.speed.seekrate < 1) o.speed.seekrate = 1
    }
    if ("outHeight" in o && o.outHeight < 0.1) o.outHeight = 0.1
    super.update(o)
  }
}
