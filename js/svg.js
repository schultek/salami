
function initSVG(a) {
  let app = a || app;

  app.svg = {};

  let s = Snap("#svg");

  s.clear();
  app.svg.shadow = s.filter(Snap.filter.shadow(0,0,1,"#000",1));

  var w = 300;
  var h = 200;

  app.svg.project = s.g()
    .add(s.g().attr({id: "svgLayers"}))
    .add(s.g().attr({id: "svgImages"}))
    .add(s.g().attr({id: "svgCurves"}))
    .add(s.g().attr({id: "svgTexts"}));

  var r = 3/app.project.zoom;

  app.svg.project.add(s.group(s.line(0,0,w,0), s.line(w,0,w,h), s.line(w,h,0,h), s.line(0,h,0,0),
    s.circle(0,0,r).attr({class: "resize-diag-1", type: "resize", num: 1}),
    s.circle(w/2,0,r).attr({class: "resize-vert", type: "resize", num: 2}),
    s.circle(w,0,r).attr({class: "resize-diag-2", type: "resize", num: 3}),
    s.circle(w,h/2,r).attr({class: "resize-hori", type: "resize", num: 4}),
    s.circle(w,h,r).attr({class: "resize-diag-1", type: "resize", num: 5}),
    s.circle(w/2,h,r).attr({class: "resize-vert", type: "resize", num: 6}),
    s.circle(0,h,r).attr({class: "resize-diag-2", type: "resize", num: 7}),
    s.circle(0,h/2,r).attr({class: "resize-hori", type: "resize", num: 8})
  ).attr({
    id: "svgBox",
    fill: "#008dea",
    stroke: "#008dea",
    strokeWidth: 1/app.project.zoom
  }));

  app.$watch('project', function(p) {
    this.svg.project.attr({transform: "matrix("+p.zoom+",0,0,"+p.zoom+","+p.xPos+","+p.yPos+")"});
    let childs = Snap("#svg").select("#svgBox").attr({strokeWidth: 1/p.zoom}).children();

    for (var i=4; i<12; i++) {
      childs[i].attr({r: 3/p.zoom});
    }
    s.select("#svgCurves").attr({
      strokeWidth: 1/p.zoom
    });
    for (var c of this.curves) {
      c.svgObject[1].attr({
        r: 4/p.zoom
      })
    }
  }, {deep: true, immediate: true});

  app.$watch('selectedLayer', function(l) {

    if (l) app.fullPreview = false;

    var x = l ? l.$.x : 0;    var y = l ? l.$.y : 0;
    var w = l ? l.$.w : 0;    var h = l ? l.$.h : 0;
    var r = l ? l.$.rot : 0;

    var b = Snap("#svg").select("#svgBox").attr({
      style: "display: " + ( (!l || l instanceof Curve) ? "none" : "inherit"),
      transform: "translate("+x+", "+y+") "+( l instanceof Layer || l instanceof Image ?("rotate("+r+" "+(w/2)+" "+(h/2)+")"):"")
    }).children();

    for (var curve of this.curves) {
      curve.svgObject.attr({
        style: "display:" + ( l == curve ? "inherit" : "none")
      });
    }

    if (!l) return;

    b[5].attr({cx: w/2});             b[6].attr({cx: w});
    b[7].attr({cx: w, cy: h/2});      b[8].attr({cx: w, cy: h});
    b[9].attr({cx: w/2, cy: h});      b[10].attr({cy: h});
    b[11].attr({cy: h/2});            b[0].attr({x2: w});
    b[1].attr({x1: w, x2: w, y2: h}); b[2].attr({x1: w, y1: h, y2: h});
    b[3].attr({y1: h});

  }, {deep: true, immediate: true});

  app.$watch('sublayers_open', function(open) {
    app.fullPreview = false;
    s.select("#svgLayers").attr({
      opacity: open?1:0.6
    });
    s.select("#svgImages").attr({
      style: "opacity: 0.4; display: "+(open?"none":"inherit")
    });
  }, {immediate: true});

  app.$watch('fullPreview', function(prev) {
    s.select("#svgLayers").attr({
      opacity: prev||app.sublayers_open?1:0.6
    })
    for (var l of this.layers) {
      if (l instanceof Form) {
        l.svgObject.attr({
          opacity: prev?0:1
        });
      }
    }
    for (var i of this.images) {
      i.svgObject.attr({
        opacity: prev?0:1
      });
    }
  }, {immediate: true});

  startWorkers.flush();

}


function localPos(x, y) {
  var pos = {x: 0, y: 0};
  pos.x = Math.round((x-app.project.xPos-$("#svg").position().left)/app.project.zoom*10)/10;
  pos.y = Math.round((y-app.project.yPos-$("#svg").position().top)/app.project.zoom*10)/10;
  return pos;
}

function makeCurves(s, curve, machine) {
  var g = s.g().attr({
    fill: "transparent"
  });
  const count = 5;
  var c = curve;
  c.direction = c.direction/360*Math.PI*2;
  c.dcos = Math.cos(c.direction);
  c.dsin = Math.sin(c.direction);
  c.xgap = c.dcos*c.gap;
  c.ygap = c.dsin*c.gap;
  var globals = getGlobalConstants(c, machine);
  if (globals != null) {
    for (var i=0; i<count; i++) {
      g.add(makeCurve(s, 1-i/count, globals, i, c, machine));
      if (i!=0) {
        g.add(makeCurve(s, 1-i/count, globals, -i, c, machine));
      }
    }
  }
  return g;
}

function makeCurve(s, opac, globals, num, curve, machine) {
  var cdata = getCurveConstants(globals, curve, num, machine);
  if (!cdata) return s.line(0,0,0,0);
  var di = curve.steps/Math.round(curve.steps*cdata.length/globals.maxlength);
  var path = "";
  for (var i = 0; i<=curve.steps+1; i += di) {
    var point = getCurvePoint(globals, curve, i/curve.steps, cdata);
    path += (path==""?"M ":"L ")+point.x+" "+point.y+" ";
  }
  return s.path(path).attr({
    opacity: opac
  });
}

function getGlobalConstants(curve, machine) {
  if (curve.type=="Linie") {
    return {maxlength: dist(machine.x, machine.y, machine.w, machine.h)};
  } else if (curve.type == "Bogen") {
    var {start, end, err} = makeBorderPoints(curve, curve, machine);
    if (err) return null;
    var mlength = dist(machine.x, machine.y, machine.w, machine.h);
    var l = dist(start.x, start.y, end.x, end.y);
    var mid = {x: (start.x+end.x)/2+curve.dcos*(curve.stretch*l/mlength), y: (start.y+end.y)/2+curve.dsin*(curve.stretch*l/mlength)};
    return {start: start, end: end, mid: mid, maxlength: mlength};
  } else if (curve.type == "Kreis") {
    var r = Math.min(machine.w, machine.h)/4
    return {center: curve.dimens, r: r, maxlength: 2*Math.PI*r, twoPi: Math.PI*2};
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

function getCurveConstants(globals, curve, num, machine) {
  if (curve.type == "Linie") {
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
    var l = dist(start.x, start.y, mid.x, mid.y)+dist(mid.x, mid.y, end.x, end.y);
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

function makeBorderPoints(c, curve, machine) {
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

function getCurvePoint(globals, curve, step, cdata) {
  if (curve.type == "Linie") {
    return {x: cdata.x1+cdata.x2*step, y: cdata.y1+cdata.y2*step};
  } else if (curve.type == "Bogen") {
    var f = cdata.f1+cdata.f2*step;
    return {x: cdata.c0.x+f*(f*cdata.c1.x+cdata.c2.x), y: cdata.c0.y+f*(f*cdata.c1.y+cdata.c2.y)};
  } else if (curve.type == "Kreis") {
    return {x: globals.center.x+Math.cos(step*globals.twoPi)*cdata.r, y: globals.center.y+Math.sin(step*globals.twoPi)*cdata.r};
  } else if (curve.type == "Welle") {
    var f = cdata.f1+cdata.f2*step;
    return globals.getPoint(f, cdata.mid);
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

function round(data, r) {
  return Math.round(data*r)/r;
}

function map(v, s1, e1, s2, e2) {
  return s2 + (e2 - s2) * ((v - s1) / (e1 - s1));
}

function dist(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}
