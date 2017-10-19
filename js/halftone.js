var layer, image, curve, machine, forms;

var toPix, f, globals;

self.addEventListener("message", function(e) {

  var time = Date.now();
  layer = e.data.layer;
  image = e.data.image;
  curve = e.data.curve;
  machine = e.data.machine;
  forms = e.data.forms;

  curve.direction = curve.direction/360*Math.PI*2;
  curve.dcos = Math.cos(curve.direction);
  curve.dsin = Math.sin(curve.direction);
  curve.xgap = curve.dcos*curve.gap;
  curve.ygap = curve.dsin*curve.gap;
  curve.rad = curve.gap/2;

  machine.bit.tiprad = machine.bit.tip/2;

  var makeAreaFunc = function(layer) {
    if (layer.type=="rect") {
      layer.inArea = function(p) {
        return inArea(p, this, null);
      }
    } else if (layer.type=="ellipse") {
      layer.cx = layer.x+layer.w/2;
      layer.cy = layer.y+layer.h/2;
      layer.r2x = (layer.w/2)*(layer.w/2);
      layer.r2y = (layer.h/2)*(layer.h/2);
      layer.inArea = function(p) {
        return (((p.x-this.cx)*(p.x-this.cx))/this.r2x)+(((p.y-this.cy)*(p.y-this.cy))/this.r2y)<=1;
      }
    } else {
      layer.inArea = function(p) {
        return inArea(p, this, this.border);
      }
    }
  }

  makeAreaFunc(layer);

  for (var fo in forms) {
    makeAreaFunc(forms[fo]);
  }

  if (!image.pixels) {
    console.log("No Pixels");
    self.postMessage({progress: -1});
    self.close();
    return;
  } else {
    image.pixels.get = function(i0, i1, i2) {
      return this.data[this.stride[0]*i0+this.stride[1]*i1+this.stride[2]*i2];
    }
  }

  toPix = function(pos) { //convert mm to pixel
    var p = {x: pos.x-image.x, y: pos.y-image.y};
    return {x: Math.round(p.x*image.pixels.shape[0]/image.w), y: Math.round(p.y*image.pixels.shape[1]/image.h)};
  }

  globals = getGlobalConstants();


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
    console.log("Not in Layer, test dists");

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
    r: function(d) { return Math.round(d*100)/100; },
    intersect: funcIntersect(),
    str: {
      l: function(p) { return "L"+f.r(p.x)+","+f.r(p.y)+" "; },
      m: function(p) { return "M"+f.r(p.x)+","+f.r(p.y)+" "; },
      a: function(r, a, p) { return "A"+f.r(r)+","+f.r(r)+" "+f.r(f.deg(a.val))+" 0,1 "+f.r(p.x)+","+f.r(p.y)+" "; },
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
  self.postMessage({progress: 100, paths: paths, gcode: generateGCode(lines), lines: {l: i, r: lines.length-i-1}});
  self.close();

}, false);

function getLine(num) {
  //console.log("Generate Line "+num);
  var line = [[]]; //array of line parts
  var cline = line[0]; //current line part

  //curve data for point calculation
  var cdata = getCurveConstants(num);
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
  if (layer.render.refinedEdges==0 || Math.abs(ihigh-ilow)<0.1/layer.render.refinedEdges) { return  pnt; }
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
  var cp = getCurvePoint(step, cdata);
  //console.log("Curve Point for "+step+":", cp);
  if (layer.inArea(cp)) {
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

function getGlobalConstants() {
  if (curve.type=="Linie") {
    return {maxlength: dist(machine.x, machine.y, machine.w, machine.h)};
  } else if (curve.type == "Bogen") {
    var {start, end, err} = makeBorderPoints(curve);
    if (err) return null;
    var mid = {x: (start.x+end.x)/2+curve.dcos*curve.stretch, y: (start.y+end.y)/2+curve.dsin*curve.stretch};
    return {start: start, end: end, mid: mid,
      maxlength: dist(machine.x, machine.y, machine.w, machine.h),
      startlength: dist(start.x, start.y, mid.x, mid.y)+dist(mid.x, mid.y, end.x, end.y)
    };
  } else if (curve.type == "Kreis") {
    var r = Math.min(machine.w, machine.h)/4
    return {center: curve, r: r, maxlength: 2*Math.PI*r, twoPi: Math.PI*2};
  } else if (curve.type == "Welle") {
    var cotstr = (curve.dcos / curve.dsin) / curve.stretch;
    var tanstr = (curve.dsin / curve.dcos) / curve.stretch;
    var cosstr = curve.dcos*curve.stretch;
    var sinstr = curve.dsin*curve.stretch;
    var dtan = curve.dsin / curve.dcos;
    var dcot = curve.dcos / curve.dsin;

    var fy = function(x, mid, a) { return (cotstr * x) - Math.cos( x / curve.stretch ) + (mid.y - a) / sinstr + 1; };
    var fx = function(y, mid, a) { return (-tanstr * y) - Math.cos( y / curve.stretch ) + (mid.x - a) / cosstr + 1; };

    var approx = function(func, mid, f1, f2, a, n) {
      var fm = (f1+f2)/2;
      var ym = func(fm, mid, a);
      if (n>20) return fm;
      if (round(ym, 1000) == 0) {
        return fm;
      } else {
        if (ym < 0) return approx(func, mid, fm, f2, a, n+1);
        else return approx(func, mid, f1, fm, a, n+1);
      }
    }

    var _2strcot = 2*curve.stretch / dcot;
    var getApproxY = function(a, mid) {
      var f1 = - ((mid.y - a) / curve.dsin) / dcot - _2strcot;
      var f2 = - ((mid.y - a) / curve.dsin) / dcot;
      return approx(fy, mid, f1, f2, a, 0);
    }

    var _2strtan = 2*curve.stretch / dtan;
    var getApproxX = function(a, mid) {
      var f1 = ((mid.x - a) / curve.dcos) / dtan + _2strtan;
      var f2 = ((mid.x - a) / curve.dcos) / dtan;
      return approx(fx, mid, f1, f2, a, 0);
    }

    return {
      getApproxX: getApproxX,
      getApproxY: getApproxY,
      getX: function(f, mid) { return mid.x - curve.dsin*f + cosstr - Math.cos(f/curve.stretch)*cosstr; },
      getPoint: function(f, mid) {
        var c = - Math.cos(f/curve.stretch);
        return {
          x: mid.x - curve.dsin*f + cosstr + c*cosstr,
          y: mid.y + curve.dcos*f + sinstr + c*sinstr
        }
      },
      maxlength: dist(machine.x, machine.y, machine.w, machine.h)
    };
  }
}

function getCurveConstants(num) {
  if (curve.type == "Linie") {
    //center pos of current line
    var c = {x: curve.x+curve.xgap*num, y: curve.y+curve.ygap*num};
    var {start, end, err} = makeBorderPoints(c);
    var l = dist(start.x, start.y, end.x, end.y);
    return err ? null : {x1: start.x, x2: end.x-start.x, y1: start.y, y2: end.y-start.y, length: l};
  } else if (curve.type == "Bogen") {
    var start = {x: globals.start.x+curve.xgap*num, y: globals.start.y+curve.ygap*num}
    var end = {x: globals.end.x+curve.xgap*num, y: globals.end.y+curve.ygap*num}
    var mid = {x: globals.mid.x+curve.xgap*num, y: globals.mid.y+curve.ygap*num}
    var c0 = start;
    var c1 = {x: end.x-2*mid.x+start.x, y: end.y-2*mid.y+start.y};
    var c2 = {x: 2*mid.x-2*start.x, y: 2*mid.y-2*start.y};
    var p = {x: -c2.x/2/c1.x, y: -c2.y/2/c1.y};
    var q = [(p.x*p.x)-(c0.x-machine.x)/c1.x, (p.x*p.x)-(c0.x-machine.x-machine.w)/c1.x,
            (p.y*p.y)-(c0.y-machine.y)/c1.y, (p.y*p.y)-(c0.y-machine.y-machine.h)/c1.y];
    var farr = [];
    if (c1.x == 0) {
      farr.push((machine.x-c0.x)/c2.x);
      farr.push((machine.x+machine.w-c0.x)/c2.x);
    }
    if (c1.y == 0) {
      farr.push((machine.y-c0.y)/c2.y);
      farr.push((machine.y+machine.h-c0.y)/c2.y);
    }
    for (var i in q) for (var d of [1,-1]) {
      if (q[i] >= 0 && c1[i>1?"y":"x"] != 0) {
        var f1 = p[i>1?"y":"x"]+d*Math.sqrt(q[i]);
        var dx = round(c0.x+f1*(f1*c1.x+c2.x), 100);
        var dy = round(c0.y+f1*(f1*c1.y+c2.y), 100);
        if (dx >= machine.x && dx <= machine.x+machine.w && dy >= machine.y && dy <= machine.y+machine.h) {
          farr.push(f1);
        }
      }
    }
    var f1 = closestTo(-1, farr);
    farr.splice(farr.indexOf(f1), 1);
    var f2 = closestTo(2, farr);
    if (f2 < f1) {
      var ftemp = f1;
      f1 = f2;
      f2 = ftemp;
    }
    var l = globals.startlength*(f2-f1);
    var g = {c0: c0, c1: c1, c2: c2, f1: f1, f2: f2-f1, length: l};
    return g;
  } else if (curve.type == "Kreis") {
    var r = globals.r+num*curve.gap;
    var l = r<=0?0:2*Math.PI*r;
    return {r: r, length: l};
  } else if (curve.type == "Welle") {
    var l = 200;
    var mid = {x: curve.x+curve.xgap*num, y: curve.y+curve.ygap*num}

    var f1 = globals.getApproxY(machine.y, mid);
    var fx1 = globals.getX(f1, mid);
    if (fx1 < machine.x || fx1 > machine.x+machine.w) {
      f1 = globals.getApproxX(fx1<machine.x?machine.x:(machine.x+machine.w), mid);
    }
    var f2 = globals.getApproxY(machine.y+machine.h, mid);
    var fx2 = globals.getX(f2, mid);
    if (fx2 < machine.x || fx2 > machine.x+machine.w) {
      f2 = globals.getApproxX(fx2<machine.x?machine.x:(machine.x+machine.w), mid);
    }

    return err ? null : {f1: f1, f2: f2-f1, mid: mid, length: l};
  }
}

function closestTo(d, arr) {
  var min = {a: null, d: null}
  for (var a of arr) {
    if (min.a == null || Math.abs(a-d) < min.d) {
      min.a = a;
      min.d = Math.abs(a-d);
    }
  }
  return min.a;
}

function makeBorderPoints(c) {
  //generate start position with x or y is 0
  var start = {x: machine.x-1, y: machine.y};
  if (curve.dcos!=0) {
    start.x = c.x+curve.dsin*((c.y-machine.y)/curve.dcos);
  }
  if (start.x < machine.x || start.x > machine.x+machine.w) {
    start.x = start.x<machine.x?machine.x:machine.x+machine.w;
    start.y = c.y+curve.dcos*((c.x-start.x)/curve.dsin);
  }

  //generate end position with x is width or y is height
  var end = {x: machine.x+machine.w+1, y: machine.y+machine.h};
  if (curve.dcos!=0) {
    end.x = c.x+curve.dsin*((c.y-machine.y-machine.h)/curve.dcos);
  }
  if (end.x > machine.x+machine.w || end.x < machine.x) {
    end.x = end.x>machine.x+machine.w?machine.x+machine.w:machine.x;
    end.y = c.y+curve.dcos*((c.x-end.x)/curve.dsin);
  }

  return {start: start, end: end, err: start.x==end.x&&start.y==end.y};
}

function getCurvePoint(step, cdata) {
  if (curve.type == "Linie") {
    return {x: cdata.x1+cdata.x2*step, y: cdata.y1+cdata.y2*step};
  } else if (curve.type == "Bogen") {
    var f = cdata.f1+cdata.f2*step;
    return {x: cdata.c0.x+f*(f*cdata.c1.x+cdata.c2.x), y: cdata.c0.y+f*(f*cdata.c1.y+cdata.c2.y)};
  } else if (curve.type == "Kreis") {
    var p = {x: globals.center.x+Math.cos(step*globals.twoPi)*cdata.r, y: globals.center.y+Math.sin(step*globals.twoPi)*cdata.r};
    return p;
  } else if (curve.type == "Welle") {
    var f = cdata.f1+cdata.f2*step;
    return globals.getPoint(f, cdata.mid);
  }
}

function gray(ix, iy) {
  return 0.2126*image.pixels.get(ix, iy, 0)+0.7152*image.pixels.get(ix, iy, 1)+0.0722*image.pixels.get(ix, iy, 2);
}

function inImage(pos) {
  return inArea(pos, {x:0,y:0,w:image.pixels.shape[0],h:image.pixels.shape[1]}, null);
}


function getDataPoint(pos, widthdata) {
  var sum = 0;
  var count = 0;

  if (!layer.render.smooth) {
    var pixpos = toPix(pos);
    if (!inImage(pixpos)) {
      return null;
    } else {
      return {x: pos.x, y: pos.y, data: gray(pixpos.x, pixpos.y)}
    }
  } else {
    //top left corner of point area
    var start = toPix({x: pos.x-(curve.rad*layer.render.smooth/100), y: pos.y-(curve.rad*layer.render.smooth/100)});
    //bottom right corner of point area
    var end = toPix({x: pos.x+(curve.rad*layer.render.smooth/100), y: pos.y+(curve.rad*layer.render.smooth/100)});

    if (!(inImage(start) || inImage(end) || inImage({x: start.x, y: end.y}) || inImage({x: end.x, y: start.y}))) {
      return null;
    }

    var dx = start.x<end.x?1:-1;
    var dy = start.y<end.y?1:-1;
    var xrange = start.x<end.x?function(ix) { return ix<end.x; }:function(ix) { return ix>=end.x; };
    var yrange = start.y<end.y?function(iy) { return iy<end.y; }:function(iy) { return iy>=end.y; };
    for (var ix = start.x; xrange(ix); ix+=dx) {
      for (var iy = start.y; yrange(iy); iy+=dy) {
        //point in image
        if (inImage({x: ix, y: iy})) {
          //calculate grayscale value from rgb
          sum += gray(ix, iy);
          count++;
        }
      }
    }
    return count>0?{x: pos.x, y: pos.y, data: sum/count/255}:null;
  }
}

function inArea(pos, dimens, border) {
  if (border != null) {
    return pos.x>=dimens.x+border.left && pos.x<=dimens.x+dimens.w-border.right && pos.y>=dimens.y+border.top && pos.y<=dimens.y+dimens.h-border.bottom;
  } else {
    return pos.x>=dimens.x && pos.x<=dimens.x+dimens.w && pos.y>=dimens.y && pos.y<=dimens.y+dimens.h;
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function map(v, s1, e1, s2, e2) {
  return s2 + (e2 - s2) * ((v - s1) / (e1 - s1));
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
    "0": {x: line[0].x+a0[0].cos*r0, y: line[0].y+a0[0].cos*r0},
    "1": {x: line[0].x+a0[1].cos*r0, y: line[0].y+a0[1].cos*r0},
    i: 0, a: a0, r: r0
  }
  var path1 = f.str.m(p[0]);
  var path2 = f.str.l(p[1])+f.str.a(p.r, p.a[0], p[0])+"Z";

  for (var i=0; i<line.length-2; i++) {
    //console.log(p);
    p = nextPoint(p, i);
    path1 += f.str.l(p[p.i]);
    path2 = f.str.l(p[1-p.i])+path2;
  }
  //console.log(p);
  p = nextPoint(p, line.length-2);
  path1 += f.str.l(p[p.i]);
  //console.log(p);

  return path1 + f.str.a(p.r, p.a[p.i], p[1-p.i]) + path2;

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
    if (!f.intersect(p[p.i], q1, p[1-p.i], q2)) {
      return {"0": q1, "1": q2, i: 0, a: a, r: rq};
    } else {
      return {"0": q1, "1": q2, i: 1, a: a, r: rq};
    }
  }
}

function funcIntersect() {
  var cross = function(v, w) {
    return v.x*w.y-v.y*w.x;
  }
  return function(p, pr, q, qs) {
    var r = {x: pr.x-p.x, y: pr.y-p.y};
    var s = {x: qs.x-q.x, y: qs.y-q.y};
    var rxs = cross(r, s);
    var qp = {x: q.x-p.x, y: q.y-p.y};
    var u = cross(qp, r)/rxs;
    var t = cross(qp, s)/rxs
    if (rxs!=0 && 0 <= t && t <= 1 && 0 <= u && u <= 1) {
      return true;
    } else {
      return false;
    }
  }
}

function funcAngle(line) {
  var a = function(i1, i2) {
    return Math.atan2(line[i2].y-line[i1].y,line[i2].x-line[i1].x);
  }
  if (line.length<2) {
    return function(i) {return [{val:0,sin:0,cos:0},{val:0,sin:0,cos:0}];};
  } else {
    if (curve.type == "Linie") {
      var an1 = (a(1,0)+a(0,1))/2;
      var an2 = an1>0?an1-Math.PI:an1+Math.PI;
      var a0 = [{
        val: an1,
        sin: Math.sin(an1),
        cos: Math.cos(an1)
      }, {
        val: an2,
        sin: Math.sin(an2),
        cos: Math.cos(an2)
      }];
      return function(i) {
        return a0;
      }
    } else {
      return function(i) {
        var i2 = i==0?i+1:i;
        var i1 = i==line.length-1?i-1:i;
        var an1 = (a(i2,i2-1)+a(i1,i1+1))/2;
        var an2 = an1>0?an1-Math.PI:an1+Math.PI;
        return [{
          val: an1,
          sin: Math.sin(an1),
          cos: Math.cos(an1)
        }, {
          val: an2,
          sin: Math.sin(an2),
          cos: Math.cos(an2)
        }];
      }
    }
  }
}

function funcRad(line) {
  var maxRad = Math.round(machine.bit.inDepth/machine.bit.height*machine.bit.width/2*100)/100;
  return function(i) {
    var r = (!layer.render.inverted?(1-line[i].data):line[i].data)*maxRad;
    return r<machine.bit.tiprad?machine.bit.tiprad:r;
  };
}

function round(data, r) {
  return Math.round(data*r)/r;
}


function generateGCode(lines) {
  console.log("Generating GCode for "+lines.length);
  var output = [];
  var pos = {x: 0, y: 0, z: 0};
  var time = 0;

  var sq = (a) => a*a;
  var add = function(g, x, y, z, s) {
    var str = "G"+g+(x!=null?" X"+round(x, 1000):"")+(y!=null?" Y"+round(y,1000):"")+(z!=null?" Z"+round(z,1000):"")+" F"+s;
    output.push(str);
    x = x!=null ? x : pos.x;
    y = y!=null ? y : pos.y;
    z = z!=null ? z : pos.z;
    var td = Math.sqrt(sq(Math.sqrt(sq(pos.x-x)+sq(pos.y-y)))+sq(pos.z-z))/s;
    time += td;
    pos.x = x;
    pos.y = y;
    pos.z = z;
  }

  var minD = round(machine.bit.tiprad/machine.bit.width*2*machine.bit.height, 100);
  var zd = function(data) {
    var d = (!layer.render.inverted?(1-data):data)*machine.bit.inDepth;
    return d<minD?-minD:-d;
  };

  var isIn = false;
  var sOut = machine.speed.seekrate;
  var sIn = machine.speed.feedrate;
  var sInD = machine.speed.feedrateDot;
  output.push("G92 X0 Y0 Z0");
  output.push("G21");
  output.push("G90");
  add(1, null, null, 5, sOut);

  add(1, machine.w, null, null, sOut);
  add(1, null, machine.h, null, sOut);
  add(1, 0, null, null, sOut);
  add(1, null, 0, null, sOut);

  for (let i in lines) {
    for (let line of lines[i]) {
      for (let j = i%2==0 ? 0 : line.length-1; i%2==0 ? j<line.length : j>=0; j+= i%2==0 ? 1:-1) {
        var p = line[j];
        p.y = machine.h-p.y;
        if (layer.render.dotted) {
          if (p.data > 0) {
            add(0, p.x, p.y, null, sOut);
            add(1, null, null, 0, sOut);
            add(1, null, null, zd(p.data), sInD);
            add(1, null, null, machine.outHeight, sOut);
          }
        } else {
          if (isIn) {
            if (p.data > 0) {
              add(1, p.x, p.y, zd(p.data), sIn);
            } else {
              add(1, null, null, machine.outHeight, sIn);
              isIn = false;
            }
          } else {
            if (p.data > 0) {
              add(0, p.x, p.y, null, sOut);
              add(1, null, null, zd(p.data), sIn);
              isIn = true;
            }
          }
        }
      }
      if (isIn) {
        add(1, null, null, machine.outHeight, layer.render.dotted?sInD:sIn);
        isIn = false;
      }
    }
  }
  if (isIn) {
    add(1, null, null, machine.outHeight, layer.render.dotted?sInD:sIn);
    isIn = false;
  }
  add(0, 0, 0, null, sOut);
  return {time: time, gcode: output};
}
