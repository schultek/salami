
let curveBoxSize = 200

function getGlobalConstants(c_, m_) {
  let curve = c_ ? c_ : curve;
  let machine = m_ ? m_ : machine;

  if (curve.type=="Linie") {
    return {maxlength: getMaxLength(curve, machine)};
  } else if (curve.type == "Bogen") {
    var {start, end, err} = makeBorderPoints(curve, curve, machine);
    if (err) return null;
    var mlength = getMaxLength(curve, machine);
    var l = dist(start.x, start.y, end.x, end.y);
    var mid = {x: (start.x+end.x)/2+curve.dcos*curve.stretch*l/mlength, y: (start.y+end.y)/2+curve.dsin*curve.stretch*l/mlength};
    return {start: start, end: end, mid: mid, maxlength: mlength,
      startlength: dist(start.x, start.y, mid.x, mid.y)+dist(mid.x, mid.y, end.x, end.y)
    };
  } else if (curve.type == "Kreis") {
    var r = curveBoxSize/4
    return {center: curve, r: r, maxlength: getMaxLength(curve, machine), twoPi: Math.PI*2};
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
      maxlength: getMaxLength(curve, machine)
    };
  }
}

function getMaxLength(c_, m_) {
  let curve = c_ ? c_ : curve;
  let machine = m_ ? m_ : machine;

  if (curve.type=="Linie" || curve.type == "Bogen" || curve.type == "Welle") {
    return curveBoxSize * Math.sqrt(2);
  } else if (curve.type == "Kreis") {
    return 2 * Math.PI * curveBoxSize/4;
  } else {
    return 0
  }
}

function getCurveConstants(num, c_, m_, g_) {
  let curve = c_ ? c_ : curve;
  let machine = m_ ? m_ : machine;
  let globals = g_ ? g_ : globals;

  if (!globals) return null;
  if (curve.type == "Linie") {
    //center pos of current line
    var c = {x: curve.x+curve.xgap*num, y: curve.y+curve.ygap*num};
    var {start, end, err} = makeBorderPoints(c, curve, machine);
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
    var q = [(p.x*p.x)-c0.x/c1.x, (p.x*p.x)-(c0.x-curveBoxSize)/c1.x,
            (p.y*p.y)-c0.y/c1.y, (p.y*p.y)-(c0.y-curveBoxSize)/c1.y];
    var farr = [];
    if (c1.x == 0) {
      farr.push(c0.x/c2.x);
      farr.push((curveBoxSize-c0.x)/c2.x);
    }
    if (c1.y == 0) {
      farr.push(c0.y/c2.y);
      farr.push((curveBoxSize-c0.y)/c2.y);
    }
    for (var i in q) for (var d of [1,-1]) {
      if (q[i] >= 0 && c1[i>1?"y":"x"] != 0) {
        var f1 = p[i>1?"y":"x"]+d*Math.sqrt(q[i]);
        var dx = round(c0.x+f1*(f1*c1.x+c2.x), 100);
        var dy = round(c0.y+f1*(f1*c1.y+c2.y), 100);
        if (dx >= 0 && dx <= curveBoxSize && dy >= 0 && dy <= curveBoxSize) {
          farr.push(f1);
        }
      }
    }
    var f1 = closestTo(-10, farr);
    farr.splice(farr.indexOf(f1), 1);
    var f2 = closestTo(20, farr);
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

    var f1 = globals.getApproxY(0, mid);
    var fx1 = globals.getX(f1, mid);
    if (fx1 < 0 || fx1 > curveBoxSize) {
      f1 = globals.getApproxX(fx1<0?0:curveBoxSize, mid);
    }
    var f2 = globals.getApproxY(curveBoxSize, mid);
    var fx2 = globals.getX(f2, mid);
    if (fx2 < 0 || fx2 > curveBoxSize) {
      f2 = globals.getApproxX(fx2<0?0:curveBoxSize, mid);
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

function makeBorderPoints(c, c_, m_) {
  let curve = c_ ? c_ : curve;
  let machine = m_ ? m_ : machine;

  //generate start position with x or y is 0
  var start = {x: -1, y: 0};
  if (curve.dcos!=0) {
    start.x = c.x+curve.dsin*(c.y/curve.dcos);
  }
  if (start.x < 0 || start.x > curveBoxSize) {
    start.x = start.x<0?0:curveBoxSize;
    start.y = c.y+curve.dcos*((c.x-start.x)/curve.dsin);
  }

  //generate end position with x is width or y is height
  var end = {x: curveBoxSize+1, y: curveBoxSize};
  if (curve.dcos!=0) {
    end.x = c.x+curve.dsin*((c.y-curveBoxSize)/curve.dcos);
  }
  if (end.x > curveBoxSize || end.x < 0) {
    end.x = end.x>curveBoxSize?curveBoxSize:0;
    end.y = c.y+curve.dcos*((c.x-end.x)/curve.dsin);
  }

  return {start: start, end: end, err: start.x==end.x&&start.y==end.y};
}

function getCurvePoint(step, cdata, c_, m_, g_) {
  let curve = c_ ? c_ : curve;
  let machine = m_ ? m_ : machine;
  let globals = g_ ? g_ : globals;

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

function rotate(p, dim, inv, m) {
  if (!dim.rot) return p;
  m = m || {
    x: dim.x+dim.w/2,
    y: dim.y+dim.h/2
  }
  let rad = (inv?1:-1)*dim.rot*Math.PI*2/360;
  let cos = Math.cos(rad);
  let sin = Math.sin(rad);

  let d = {x: p.x-m.x, y: p.y-m.y}
  return {
    x: m.x + d.x * cos - d.y * sin,
    y: m.y + d.y * cos + d.x * sin
  }
}

function def(obj, ...props) {
  for (let prop of props) {
    obj[prop] = obj[prop] || 0;
  }
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

function map(v, s1, e1, s2, e2) {
  return s2 + (e2 - s2) * ((v - s1) / (e1 - s1));
}

function round(data, r) {
  return Math.round(data*r)/r;
}

function updateDeep(toUpdate, object) {
  Object.keys(object).forEach(k => {
    if (typeof object[k] == "object") {
      if (!toUpdate[k]) toUpdate[k] = {}
      toUpdate[k] = updateDeep(toUpdate[k], object[k])
    } else
      toUpdate[k] = object[k]
  })
}

if (this.__esModule) {
  let set = (global, functions) => {
    Object.keys(functions).forEach(f => global[f] = functions[f])
  }
  set(this, {updateDeep, getGlobalConstants, getMaxLength, getCurveConstants, makeBorderPoints, getCurvePoint, rotate, map, dist, round, def})
}
