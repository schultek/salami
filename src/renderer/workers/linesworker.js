importScripts("../includes/renderfunctions.js")

let images = []
var layer, image, curve, machine, forms, gcode;

var getDataPoint, globals;

self.addEventListener("message", function(e) {

  if (e.data.pixels) {
    let image =  images.find(i => i.id == e.data.id)
    if (image)
      image.pixels = e.data.pixels
    else
      images.push(e.data)

    return;
  }

  var time = Date.now();

  console.log("Start rendering (linesWorker)")

  layer = e.data.layer;
  image = e.data.image;
  curve = e.data.curve;
  machine = e.data.machine;
  forms = e.data.forms;

  let img = images.find(i => i.id == image.id)
  if (!img) {
    self.postMessage({error: "No Pixels"});
    return;
  } else {
    image.pixels = img.pixels
    image.pixels.get = function(i0, i1, i2) {
      return this.data[this.stride[0]*i0+this.stride[1]*i1+this.stride[2]*i2];
    }
  }

  def(curve, "direction", "gap", "stretch", "steps");
  def(image, "x", "y", "w", "h", "rot")
  def(machine, "w", "h", "outHeight");
  def(machine.bit, "with", "height", "tip", "inDepth");
  def(machine.speed, "feedrate", "feedrateDot", "seekrate")

  curve.direction = curve.direction/360*Math.PI*2;
  curve.dcos = Math.cos(curve.direction);
  curve.dsin = Math.sin(curve.direction);
  curve.xgap = curve.dcos*curve.gap;
  curve.ygap = curve.dsin*curve.gap;
  curve.rad = curve.gap/2;

  machine.bit.tiprad = machine.bit.tip||0/2;

  if (layer.border)
    def(layer.border, "left", "right", "top", "bottom");

  if (layer.w > machine.w) layer.w = machine.w;
  if (layer.h > machine.h) layer.h = machine.h;

  for (let f of forms.concat([layer])) {

    def(f, "x", "y", "w", "h", "rot");
    def(f.render, "refinedEdges", "smooth");
    def(f.render.lines, "l", "r");

    f.rotate = makeRotateFunc(f);
    if (f.type=="ellipse") {
      f.cx = f.x+f.w/2;
      f.cy = f.y+f.h/2;
      f.r2x = (f.w/2)*(f.w/2);
      f.r2y = (f.h/2)*(f.h/2);
      f.inArea = function(p) {
        p = this.rotate(p);
        return (((p.x-this.cx)*(p.x-this.cx))/this.r2x)+(((p.y-this.cy)*(p.y-this.cy))/this.r2y)<=1;
      }
    } else {
      f.inArea = makeAreaFunc(f);
    }
  }

  machine.inArea = makeAreaFunc(machine);

  image.inArea = makeAreaFunc({x:0,y:0,w:image.pixels.shape[0],h:image.pixels.shape[1]});
  image.rotate = makeRotateFunc(image);

  globals = getGlobalConstants(curve, machine);

  getDataPoint = makeDataPointFunc();

  var apprLineCount = Math.max(layer.w, layer.h)/curve.gap;
  var sendTime = Date.now();

  if (layer.fill) {
    layer.render.lines.l = 1;
    layer.render.lines.r = 1;
  }

  var lines = [];
  var line0 = getLine(0);
  if (layer.render.lines.r>=0 && layer.render.lines.l >= 0) {
    lines.push(line0);
  }
  if (line0.length>0) {
    var left;
    for (var i=layer.render.lines.r<0?-layer.render.lines.r:1; layer.fill||i<=layer.render.lines.l; i++) {
      left = getLine(-i);
      if (left.length==0) {
        break;
      }
      lines.unshift(left);
      if (sendTime+100<Date.now()) {
        self.postMessage({progress: Math.min(40,Math.round(40*lines.length/apprLineCount))});
        sendTime = Date.now();
      }
    }
    var right;
    for (var i=layer.render.lines.l<0?-layer.render.lines.l:1; layer.fill||i<=layer.render.lines.r; i++) {
      right = getLine(i);
      if (right.length==0) {
        break;
      }
      lines.push(right);
      if (sendTime+100<Date.now()) {
        self.postMessage({progress: Math.min(40,Math.round(40*lines.length/apprLineCount))});
        sendTime = Date.now();
      }
    }
  } else {
    //console.log("Not in Layer, test dists");

    var addLines = function(lines, delta, count, arrfunc) {
      var prevline = lines[0];
      var line = getLine(delta);
      var i=delta*2;
      while ((layer.fill||Math.abs(i)<=count) && (prevline.length==0 || line.length>0)) {
        prevline = line;
        line = getLine(i);
        arrfunc.call(lines, line);
        if (sendTime+100<Date.now()) {
          self.postMessage({progress: Math.min(40,Math.round(40*lines.length/apprLineCount))});
          sendTime = Date.now();
        }
        i += delta;
        if (layer.fill&&Math.abs(i)>10000) {
          break;
        }
      }
    }

    var lcenter = {x: layer.x+layer.w/2, y: layer.y+layer.h/2};

    if (leftCloserToLayer(lcenter)) {
      addLines(lines, -1, layer.render.lines.l, lines.unshift);
    } else {
      addLines(lines, 1, layer.render.lines.r, lines.push);
    }

  }

  console.log("Generated "+lines.length+" Lines ("+(Date.now()-time)+"ms)");

  var i = lines.indexOf(line0);

  let result = {lines}
  if (layer.fill)
    result.fillLines = {l: i, r: lines.length-i-1}

  self.postMessage(result);

}, false);

function getLine(num) {
  //console.log("Generate Line "+num);
  var line = [[]]; //array of line parts
  var cline = line[0]; //current line part

  //curve data for point calculation
  var cdata = getCurveConstants(num, curve, machine, globals);
  if (cdata == null || cdata.length <= 0) {
    return [];
  }
  //console.log("Start:", cdata.start, "End:", cdata.end);
  //regulates step count
  var di = curve.steps/Math.round(curve.steps*cdata.length/globals.maxlength);
  //console.log("Line Steps: "+(curve.steps/di));
  for (var i = 0; i<=curve.steps+1; i += di) {
    //point on curve
    var point = getPoint(i/curve.steps, cdata);

    if (point && point.data) {
      if (cline.length==0) {
        var first = findEdgePoint(point, i/curve.steps, (i-di)/curve.steps, cdata);
        if (first != point) {
          cline.push(first);
        }
      }
      cline.push(point);
    } else if (cline.length>0 && cline[cline.length-1].data) {
      var last = findEdgePoint(cline[cline.length-1], (i-di)/curve.steps, i/curve.steps, cdata);
      if (last != cline[cline.length-1]) {
        cline.push(last);
      }
      //add new line part
      line.push([]);
      cline = line[line.length-1];
    } else if (point) {
      line.push([]);
    }
  }

  if (line[line.length-1].length == 0) {
    line.splice(line.length-1, 1);
  }
  return line;
}

function findEdgePoint(pnt, ilow, ihigh, cdata, n) {
  if (layer.render.dotted || layer.render.refinedEdges==0 || Math.abs(ihigh-ilow)<0.1/layer.render.refinedEdges) { return  pnt; }
  try {
    var p = getPoint((ilow+ihigh)/2, cdata);
    if (p && p.data) {
      return findEdgePoint(p, (ihigh+ilow)/2, ihigh, cdata, n?n+1:1);
    } else {
      return findEdgePoint(pnt, ilow, (ihigh+ilow)/2, cdata, n?n+1:1);
    }
  } catch (e) {
    return pnt;
  }
}

function getPoint(step, cdata, widthdata) {
  var cp = getCurvePoint(step, cdata, curve, machine, globals);
  //console.log("Curve Point for "+step+":", cp);
  if (machine.inArea(cp) && layer.inArea(cp)) {
    //console.log("-> in Area");

    var valid = forms.length>0?forms[0].mask?-1:1:-1;
    for (var form of forms) {
      if (form.inArea(cp)) {
        if (form.mask && !form.ownRenderer) {
          valid = 1;
        } else {
          valid = 0;
        }
      } else if (form.mask && valid==-1) {
        valid = 0;
      }
    }
    if (valid==0) {
      return {};
    }

    //add data-point to current line part
    return getDataPoint(cp, widthdata);
  } else {
    return null;
  }
}

function gray(i) {
  return 0.2126*image.pixels.get(i.x, i.y, 0)+0.7152*image.pixels.get(i.x, i.y, 1)+0.0722*image.pixels.get(i.x, i.y, 2);
}

function makeRotateFunc(dim) {
  if (!dim.rot) return (p) => p;
  let m = {
    x: dim.x+dim.w/2,
    y: dim.y+dim.h/2
  }
  let rad = -dim.rot*Math.PI*2/360;
  let cos = Math.cos(rad);
  let sin = Math.sin(rad);
  return function(p) {
    let d = {x: p.x-m.x, y: p.y-m.y}
    return {
      x: m.x + d.x * cos - d.y * sin,
      y: m.y + d.y * cos + d.x * sin
    }
  }
}

function toPix(pos) { //convert mm to pixel
  let p = image.rotate(pos);
  p = {x: p.x-image.x, y: p.y-image.y};
  return {x: Math.round(p.x*image.pixels.shape[0]/image.w), y: Math.round(p.y*image.pixels.shape[1]/image.h)};
}

function makeDataPointFunc() {

  let pixRad = Math.round(curve.rad*image.pixels.shape[0]/image.w*layer.render.smooth/100);

  return (pos, widthdata) => {
    var sum = 0;
    var count = 0;
    var pix = toPix(pos);

    if (!layer.render.smooth) {
      if (!image.inArea(pix)) {
        return null;
      } else {
        return {x: pos.x, y: pos.y, data: gray(pix)/255}
      }
    } else {
      //top left corner of point area
      var start = {x: pix.x-pixRad, y: pix.y-pixRad};
      //bottom right corner of point area
      var end = {x: pix.x+pixRad, y: pix.y+pixRad};

      if (!(image.inArea(start) || image.inArea(end) || image.inArea({x: start.x, y: end.y}) || image.inArea({x: end.x, y: start.y}))) {
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
          if (image.inArea(i)) {
            //calculate grayscale value from rgb
            sum += gray(i);
            count++;
          }
        }
      }
      return count>0?{x: pos.x, y: pos.y, data: sum/count/255}:null;
    }
  }
}

function makeAreaFunc(layer) {
  if (!layer.border) {
    layer.border = {left: 0, right: 0, top: 0, bottom: 0};
  }
  return function(pos) {
    if (layer.rotate) {
      pos = layer.rotate(pos);
    }
    let b = pos.x>=layer.x+layer.border.left &&
      pos.x<=layer.x+layer.w-layer.border.right &&
      pos.y>=layer.y+layer.border.top &&
      pos.y<=layer.y+layer.h-layer.border.bottom;
    if (!b) {
      //console.log(pos, layer);
    }
    return b;
  };
}

function leftCloserToLayer(lcenter) {
  if (curve.type == "Linie" || curve.type == "Bogen") {
    var dright = dist(curve.x+curve.dcos*curve.gap, curve.y+curve.dsin*curve.gap, lcenter.x, lcenter.y);
    var dleft = dist(curve.x-curve.dcos*curve.gap, curve.y-curve.dsin*curve.gap, lcenter.x, lcenter.y);
    return dleft<dright;
  } else if (curve.type == "Kreis") {
    return dist(lcenter.x, lcenter.y, curve.x, curve.y)<globals.r;
  }
}
