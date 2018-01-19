importScripts("./renderfunctions.js")

var layer, image, curve, machine, forms, gcode;

var getDataPoint, f, globals;

self.addEventListener("message", function(e) {

  var time = Date.now();

  layer = e.data.layer;
  image = e.data.image;
  curve = e.data.curve;
  machine = e.data.machine;
  forms = e.data.forms;

  if (!image.pixels) {
    self.postMessage({error: "No Pixels"});
    self.close();
    return;
  } else {
    image.pixels.get = function(i0, i1, i2) {
      return this.data[this.stride[0]*i0+this.stride[1]*i1+this.stride[2]*i2];
    }
  }

  def(curve, "direction", "gap", "stretch", "steps");
  def(image, "x", "y", "w", "h", "rot")
  def(machine, "x", "y", "w", "h", "outHeight");
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
  time = Date.now();

  f = {
    deg: function(r) { return (r/Math.PI/2)*360; },
    r: function(d) { return round(d, 100); },
    //intersect: funcIntersect(),
    str: {
      l: function(p) { return "L"+f.r(p.x)+","+f.r(p.y)+" "; },
      m: function(p) { return "M"+f.r(p.x)+","+f.r(p.y)+" "; },
      a: function(r, s, p) { return "A"+f.r(r)+","+f.r(r)+" 0 0 "+s+" "+f.r(p.x)+","+f.r(p.y)+" "; },
      c: function(p, r) { return "M "+f.r(p.x-f.r(r))+" "+f.r(p.y)+" A"+f.r(r)+" "+f.r(r)+" 0 0 0"+f.r(p.x+f.r(r))+" "+f.r(p.y)
                                  +" A"+f.r(r)+" "+f.r(r)+" 0 0 0"+f.r(p.x-f.r(r))+" "+f.r(p.y)+" " }
    }
  };

  var paths = [];
  for (var l in lines) {
    for (var p in lines[l]) {
      if (lines[l][p].length>0) {
        paths.push(layer.render.dotted?getDottedPathFromLine(lines[l][p]):getPathFromLine(lines[l][p]));
      }
    }
    if (sendTime+100<Date.now()) {
      self.postMessage({progress: Math.min(99,40+Math.round(60*l/lines.length))});
      sendTime = Date.now();
    }
  }

  console.log("Generated SVG ("+(Date.now()-time)+"ms)");


  var i = lines.indexOf(line0);
  self.postMessage({isFinished: true, path: paths.join(" "), lines, lineCount: {l: i, r: lines.length-i-1}});
  self.close();

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

function getPathFromLine(line) {

  f.rad = funcRad(line);
  f.angle = funcAngle(line);
  var nextPoint = funcNextPoint(line);

  var a0 = f.angle(0), r0 = f.rad(0);
  var p = {
    "0": {x: line[0].x+a0[0].cos*r0, y: line[0].y+a0[0].sin*r0},
    "1": {x: line[0].x+a0[1].cos*r0, y: line[0].y+a0[1].sin*r0},
    a: a0, r: r0
  }
  var path1 = f.str.m(p[0]);
  var path2 = f.str.l(p[1])+f.str.a(p.r, 0, p[0])+"Z";

  for (var i=0; i<line.length-2; i++) {
    //console.log(p);
    p = nextPoint(p, i);
    path1 += f.str.l(p[0]);
    path2 = f.str.l(p[1])+path2;
  }
  //console.log(p);
  p = nextPoint(p, line.length-2);
  path1 += f.str.l(p[0]);
  //console.log(p);

  //console.log(p[0], p[1], p.a[0].val*180/Math.PI, p.a[1].val*180/Math.PI);

  return path1 + f.str.a(p.r, 0, p[1]) + path2;

}

function getDottedPathFromLine(line) {
  var p = "";
  f.rad = funcRad(line);
  for (var l in line) {
    p += f.str.c(line[l], f.rad(l));
  }
  return p;
}

function funcNextPoint(line) {
  return function(p, i) {
    var a = f.angle(i+1);
    var rq = f.rad(i+1);
    var q1 = {x: line[i+1].x+a[0].cos*rq, y: line[i+1].y+a[0].sin*rq};
    var q2 = {x: line[i+1].x+a[1].cos*rq, y: line[i+1].y+a[1].sin*rq};
    return {"0": q1, "1": q2, a: a, r: rq};
  }
}


function funcAngle(line) {
  var a = function(i1, i2) {
    return Math.atan2(line[i2].y-line[i1].y,line[i2].x-line[i1].x);
  }
  if (line.length<2) {
    return (i) => [{val:0,sin:0,cos:0}, {val:0,sin:0,cos:0}];
  } else {
    let ret = (a_1) => {
      if (a_1 > Math.PI) a_1 = a_1 - Math.PI*2
      let a_2 = a_1 <= 0 ? a_1+Math.PI : a_1-Math.PI;
      return [{val: a_1, sin: Math.sin(a_1), cos: Math.cos(a_1)}, {val: a_2, sin: Math.sin(a_2), cos: Math.cos(a_2)}];
    };
    if (curve.type == "Linie") {
      let an = ret(a(0,1)+Math.PI/2);
      return (i) => an;
    } else {
      let a0 = ret(a(0,1)+Math.PI/2);
      let al = ret(a(line.length-2, line.length-1)+Math.PI/2);
      return (i) => {
        if (i==0) {
          return a0;
        } else if (i == line.length-1) {
          return al;
        } else {
          let a1 = a(i, i-1);
          let a2 = a(i, i+1);
          if (a1 >= a2)
            return ret((a2+a1)/2);
          else {
            return ret((a2+a1)/2+Math.PI);
          }
        }
      }
    }
  }
}

function funcRad(line) {
  var maxRad = round(machine.bit.inDepth/machine.bit.height*machine.bit.width/2, 100);
  return function(i) {
    var r = (!layer.inverted?(1-line[i].data):line[i].data)*maxRad;
    return r<machine.bit.tiprad?machine.bit.tiprad:r;
  };
}
