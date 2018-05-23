
import ImageLoader from "./ImageLoader"
import Console from "./ConsoleBuffer"

import insidePoly from "point-in-polygon"

export function onLoad(id, cb) {
  if (!ImageLoader.has(id)) {
    if (ImageLoader.isLoading(id)) {
      ImageLoader.wait(id, cb)
    } else {
      process.send({error: "No Pixels"});
    }
  } else {
    cb();
  }
}

export function isCutout(p, forms) {
  let filtered = forms.filter(f => f.inArea(p))
  return filtered.length % 2 == 1 || filtered.find(f => f.ownRenderer) || filtered.find(f => f.type == "text")
}

export function prepareLayer(layer) {
  if (!layer.border)
    layer.border = {left: 0, right: 0, top: 0, bottom: 0}

  return prepareForm(layer)
}

export function prepareForm(f) {
  f.rotate = makeRotateFunc(f);
  if (f.type && f.type == "ellipse") {
    f.cx = f.x+f.w/2;
    f.cy = f.y+f.h/2;
    f.r2x = (f.w/2)*(f.w/2);
    f.r2y = (f.h/2)*(f.h/2);
    f.inArea = function(p) {
      p = this.rotate(p);
      return (((p.x-this.cx)*(p.x-this.cx))/this.r2x)+(((p.y-this.cy)*(p.y-this.cy))/this.r2y)<=1;
    }
  } else if (f.type && f.type == "triangle") {
    let inBBox = makeAreaFunc(f)

    let halfX = f.x + (f.d * f.w)
    let ha = f.h / (f.d * f.w)
    let hb = f.h / (f.w * (1 - f.d))
    let x2 = f.x + f.w
    let y2 = f.y + f.h

    f.inArea = function(p) {
      if (!inBBox(p)) return false;
      p = this.rotate(p)
      if (p.x <= halfX) {
        return y2 - p.y < (p.x - f.x) * ha
      } else {
        return y2 - p.y < (x2 - p.x) * hb
      }
    }
  } else if (f.type && f.type == "polygon") {
    let inBBox = makeAreaFunc(f)
    let polygon = f.points.map(p => [f.x + f.w * p.x, f.y + f.h * p.y])
    f.inArea = function(p) {
      if (!inBBox(p)) return false;
      p = this.rotate(p)
      return insidePoly([p.x, p.y], polygon)
    }
  } else {
    f.inArea = makeAreaFunc(f);
    f.onEdge = makeOnEdgeFunc(f);
  }

  return f;
}

export function prepareForms(forms) {
  return forms.map(f => prepareForm(f))
}

export function prepareImage(image, pixels) {

    image.pixels = pixels;

    let w = pixels.stride[1]
    image.get = (x, y) => 0.2126*pixels.data[Math.floor(y)*w + Math.floor(x)*4] +
                          0.7152*pixels.data[Math.floor(y)*w + Math.floor(x)*4 + 1] +
                          0.0722*pixels.data[Math.floor(y)*w + Math.floor(x)*4 + 2]

    image.pixW = image.pixels.shape[0]
    image.pixH = image.pixels.shape[1]

    image.inArea = makeAreaFunc(image);
    image.inPixArea = makeAreaFunc({x: 0, y: 0, w: image.pixW, h: image.pixH}, true)
    image.rotate = makeRotateFunc(image);


    image.toPix = makeToPixFunc(image)
    image.toMM = makeToMMFunc(image);

    return image;
}

export function prepareMachine(machine) {
  machine.bit.tiprad = machine.bit.tip / 2;

  return machine;
}

function makeRotateFunc(dim) {
  if (!dim.rot) return (p) => p;
  let m = {
    x: dim.x+dim.w/2,
    y: dim.y+dim.h/2
  }
  let rad = dim.rot*Math.PI*2/360;
  let cos_c = Math.cos(rad);
  let sin_c = Math.sin(rad);
  let cos_cc = Math.cos(-rad);
  let sin_cc = Math.sin(-rad);
  return function(p, clockwise) {
    let d = {x: p.x-m.x, y: p.y-m.y}
    return clockwise ? {
      x: m.x + d.x * cos_c - d.y * sin_c,
      y: m.y + d.y * cos_c + d.x * sin_c
    } : {
      x: m.x + d.x * cos_cc - d.y * sin_cc,
      y: m.y + d.y * cos_cc + d.x * sin_cc
    }
  }
}

function makeAreaFunc(layer, strict) {
  let border = layer.border || {left: 0, right: 0, top: 0, bottom: 0}
  return function(pos) {
    if (!pos) return false;
    if (layer.rotate) {
      pos = layer.rotate(pos);
    }
    let b =
      pos.x>=layer.x+border.left  &&
      pos.y>=layer.y+border.top;
    if (strict)
      b = b &&
        pos.x<layer.x+layer.w-border.right  &&
        pos.y<layer.y+layer.h-border.bottom;
    else
      b = b &&
        pos.x<=layer.x+layer.w-border.right  &&
        pos.y<=layer.y+layer.h-border.bottom;
    return b;
  };
}

function makeOnEdgeFunc(layer) {
  let border = layer.border || {left: 0, right: 0, top: 0, bottom: 0}
  return function(circ) {
    if (!circ) return false;
    if (layer.rotate) {
      let p = layer.rotate(circ)
      circ.x = p.x;
      circ.y = p.y;
    }
    let out = "";
    if (Math.abs(circ.x - (layer.x + border.left)) <= circ.r)
      out += "1"
    if (Math.abs(circ.x - (layer.x + layer.w - border.right)) <= circ.r)
      out += "2"
    if (Math.abs(circ.y - (layer.y + border.top)) <= circ.r)
      out += "3"
    if (Math.abs(circ.y - (layer.y + layer.h - border.bottom)) <= circ.r)
      out += "4"
    return out;
  }
}


function makeToPixFunc(image) { //convert mm to pixel
  return (pos) => {
    let p = image.rotate(pos);
    p = {x: p.x-image.x, y: p.y-image.y};
    return {x: Math.floor(p.x*image.pixW/image.w), y: Math.floor(p.y*image.pixH/image.h)};
  }
}

function makeToMMFunc(image) {
  return (pos) => {
    let p = {x: image.x + (pos.x+0.5) * image.w / image.pixW, y: image.y + (pos.y+0.5) * image.h / image.pixH}
    return image.rotate(p, true);
  }
}
