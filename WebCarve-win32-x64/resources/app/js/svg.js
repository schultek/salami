
var startWorkers = _.debounce(function(start) {
  start();
}, 500);

function createWorker(layer) {

  var i = app.layers.length-1-app.layers.indexOf(layer);
  var image = app.images.find(el=>el.id==layer.render.image);
  if (image) {
    var pix = app.pixels.find(el=>el.image==image.id);
    var pixels = pix?pix.pixels:null;
  }
  var curve = app.curves.find(el=>el.id==layer.render.curve);
  var svg = app.svg.layers[i][1];
  var li = app.layers.indexOf(layer);
  var forms = app.layers.filter((el, i)=>i<li&&app.layerType(el)==3);

  if (!curve || !image || !layer) {
    return;
  }

  var workers = {
    count: 0,
    paths: []
  };

  var finishWorkers = function(progress) {
    app.project.progress.splice(app.project.progress.indexOf(progress), 1);
    workers.count--;
    workers.paths = workers.paths.concat(event.data.paths);

    if (workers.count==0) {
      svg.clear();
      svg.attr({
        fill: layer.render.inverted?"#fff":"#000"
      });
      for (var p in workers.paths)
        svg.path(workers.paths[p]);
    }
  }

  workers.count++;
  runWorker(finishWorkers, layer, forms, {dimens: image.dimens, pixels: pixels}, curve);

  console.log("Start "+(forms.filter(el=>el.mask&&el.ownRenderer).length+1)+" Workers for one Layer");

  for (var f in forms) {
    if (forms[f].mask && forms[f].ownRenderer) {
      var subforms = forms.filter((el, i)=>i<f);
      var subimage = app.images.find(el=>el.id==forms[f].render.image);
      var subpix = app.pixels.find(el=>el.image==forms[f].render.image);
      var subcurve = app.curves.find(el=>el.id==forms[f].render.curve);
      if (subcurve && subimage) {
        workers.count++;
        runWorker(finishWorkers, forms[f], subforms, {dimens: subimage.dimens, pixels: subpix?subpix.pixels:null}, subcurve);
      }
    }
  }
}

function runWorker(finishWorkers, layer, forms, image, curve) {

  var worker = new Worker("js/halftone.js");
  var startmillis;
  var progress = {p: 0};
  app.project.progress.push(progress);
  worker.addEventListener('message', function(event) {
    if (event.data.progress < 100) {
      //console.log("Progress:",event.data.progress);
      if (event.data.progress<0)
        finishWorkers(progress);

      else
        progress.p = event.data.progress;
    } else {
      worker.terminate();
      finishWorkers(progress);
      console.log("Finished Rendering, took "+(Date.now()-startmillis)+"ms");
      if (layer.render.lines.fill) {
        layer.render.lines.l = event.data.lines.l;
        layer.render.lines.r = event.data.lines.r;
        layer.render.lines.fill = false;
      }
      var gcode = app.gcodes.find(el => el.id == layer.id);
      if (gcode) {
        gcode.code = event.data.gcode;
      } else {
        app.gcodes.push({id: layer.id, data: event.data.gcode});
      }
    }
  }, false);
  startmillis = Date.now();
  worker.postMessage({
    layer: layer,
    forms: forms,
    image: image,
    curve: curve,
    machine: app.machine});
}

function initSVG() {
  var s = Snap("#svg");
  s.clear();
  app.svg = {};
  app.svg.shadow = s.filter(Snap.filter.shadow(0,0,1,"#000",1));
  var w = app.machine.dimens.w;
  var h = app.machine.dimens.h;

  app.svg.project = s.g();
  app.svg.workarea = s.rect(0,0,w,h);
  app.svg.project.add(app.svg.workarea);
  app.svg.layers = s.g();
  app.svg.project.add(app.svg.layers);
  app.svg.images = s.g();
  app.svg.project.add(app.svg.images);
  app.svg.curves = s.g();
  app.svg.project.add(app.svg.curves);
  app.svg.texts = s.g();
  app.svg.project.add(app.svg.texts);

  var r = 3/app.project.zoom;
  app.svg.selectBox = s.group(s.line(0,0,w,0), s.line(w,0,w,h), s.line(w,h,0,h), s.line(0,h,0,0),
    s.circle(0,0,r), s.circle(w/2,0,r), s.circle(w,0,r), s.circle(w,h/2,r), s.circle(w,h,r), s.circle(w/2,h,r), s.circle(0,h,r), s.circle(0,h/2,r)
  );
  app.svg.project.add(app.svg.selectBox);
  app.svg.selectBox[4].attr({class: "resize-diag-1", type: "resize", num: 1});
  app.svg.selectBox[5].attr({class: "resize-vert", type: "resize", num: 2});
  app.svg.selectBox[6].attr({class: "resize-diag-2", type: "resize", num: 3});
  app.svg.selectBox[7].attr({class: "resize-hori", type: "resize", num: 4});
  app.svg.selectBox[8].attr({class: "resize-diag-1", type: "resize", num: 5});
  app.svg.selectBox[9].attr({class: "resize-vert", type: "resize", num: 6});
  app.svg.selectBox[10].attr({class: "resize-diag-2", type: "resize", num: 7});
  app.svg.selectBox[11].attr({class: "resize-hori", type: "resize", num: 8});
  app.svg.selectBox.attr({
    fill: "#008dea",
    stroke: "#008dea",
    strokeWidth: 1/app.project.zoom
  });

  app.svg.workarea.attr({fill: "#ccc", type: "machine"});
  app.$watch('machine', function(m) {
    this.svg.workarea.attr({x: m.dimens.x, y: m.dimens.y, width: m.dimens.w, height: m.dimens.h});
    startWorkers(function() {
      console.log("Start Workers for all Layers")
      for (var l in app.layers) {
        if (app.layers[l].type!==undefined) continue;
        createWorker(app.layers[l]);
      }
    });
  }, {deep: true, immediate: true});

  for (var image in app.images) {
    var e = s.image(0,0,0,0);
    e.attr({
      type: "image"
    });
    app.svg.images.add(e);
  }

  for (var c in app.curves) {
    var e = s.g();
    e.attr({
      stroke: "#008dea",
      fill: "#008dea"
    });
    var curve = app.curves[c];
    e.add(makeCurves(s, curve, app.machine));
    var circ = e.circle(curve.dimens.x, curve.dimens.y, 4/app.project.zoom, 4/app.project.zoom);
    circ.attr({
      type: "curve"
    });
    e.add(circ);
    app.svg.curves.add(e);
  }

  for (var layer = app.layers.length-1; layer>=0; layer--) {
    var l = app.layers[layer];
    var e;
    if (!l.type) {
      e = s.g(s.rect(0,0,0,0), s.g());
      e[0].attr({
        fill: "#fff",
        style: "stroke: #ddd"
      });
    } else {
      if (l.type=="rect") {
        e = s.rect(0,0,0,0);
      } else {
        e = s.ellipse(0,0,0,0);
      }
      e.attr({
        fill: "transparent",
        style: "stroke: #bbb; stroke-dasharray: 10px 20px",
        strokeWidth: 1
      })
    }
    e.attr({
      //filter: app.svg.shadow,
      type: "layer"
    });
    app.svg.layers.add(e);
  }

  for (var t in app.texts) {
    var e = s.text(app.texts[t].dimens.x, app.texts[t].dimens.y, app.texts[t].text);
    e.attr({
      fill: "#505050",
      type: "text"
    });
    app.svg.texts.add(e);
  }


  app.$watch('project', function(p) {
    this.svg.project.attr({transform: "matrix("+p.zoom+",0,0,"+p.zoom+","+p.xPos+","+p.yPos+")"});
    this.svg.selectBox.attr({strokeWidth: 1/p.zoom});
    for (var i=4; i<12; i++) {
      this.svg.selectBox[i].attr({r: 3/p.zoom});
    }
    this.svg.curves.attr({
      strokeWidth: 1/p.zoom
    });
    for (var c in this.curves) {
      this.svg.curves[c][1].attr({
        r: 4/p.zoom
      })
    }
  }, {deep: true, immediate: true});

  app.$watch('selectedLayer', function(l) {
    var t = this.layerType(l);
    var b = this.svg.selectBox;
    var x = t==-1?0:l.dimens.x;
    var y = t==-1?0:l.dimens.y;
    var w = t==-1?0:t==4?0:l.dimens.w;
    var h = t==-1?0:t==4?0:l.dimens.h;
    b.attr({
      style: "display: "+(t==-1||t==4?"none":"inherit"),
      transform: "translate("+x+", "+y+") "+((t==2||t==3||t==5)?("rotate("+l.dimens.rot+" "+(l.dimens.w/2)+" "+(l.dimens.h/2)+")"):"")
    });
    b[5].attr({cx: w/2});
    b[6].attr({cx: w});
    b[7].attr({cx: w, cy: h/2});
    b[8].attr({cx: w, cy: h});
    b[9].attr({cx: w/2, cy: h});
    b[10].attr({cy: h});
    b[11].attr({cy: h/2});
    b[0].attr({x2: w});
    b[1].attr({x1: w, x2: w, y2: h});
    b[2].attr({x1: w, y1: h, y2: h});
    b[3].attr({y1: h});

    var sl = this.selectedLayer;
    for (var c in this.curves) {
      var curve = this.curves[c];
      this.svg.curves[c].attr({
        style: "display:"+(sl==curve?"inherit":"none")
      });
    }

  }, {deep: true, immediate: true});

  for (var image in app.images) {
    app.$watch("images."+image, function(img) {
      if (!img) return;
      var i = this.images.indexOf(img);
      this.svg.images[i].attr({
        "xlink:href": img.data || app.bufferURL,
        width: img.dimens.w,
        height: img.dimens.h,
        transform: "translate("+img.dimens.x+" "+img.dimens.y+") rotate("+img.dimens.rot+" "+(img.dimens.w/2)+" "+(img.dimens.h/2)+")"
      });
      startWorkers(function() {
        var layers = app.layers.filter(el=>!el.type&&el.render.image==img.id);
        console.log("Start workers for "+layers.length+" Layers");
        for (var l in layers) {
          createWorker(layers[l]);
        }
      });
    }, {deep: true, immediate: true});
  }

  for (var t in app.texts) {
    //console.log(app.texts, t);
    app.$watch("texts."+t, function(text) {
      if (!text) return;
      var tx = this.texts.indexOf(text);
      this.svg.texts[tx].attr({
        x: text.dimens.x,
        y: text.dimens.y+text.dimens.h,
        style: "font-size: "+text.size+"px",
        text: text.text
      });
      text.dimens.w = $(this.svg.texts[tx].node).width();
      text.dimens.h = $(this.svg.texts[tx].node).height();
      if (app.fonts[text.font]) {
        text.path = app.fonts[text.font].getPath(text.text, text.dimens.x, text.dimens.y+text.dimens.h, text.size);
      }
    }, {deep: true, immediate: true});
  }

  var rad = function(d) { return d/360*Math.PI*2; };
  for (var curve in app.curves) {
    app.$watch("curves."+curve, function(c) {
      if (!c) return;
      var i = this.curves.indexOf(c);
      this.svg.curves[i][1].attr({
        cx: c.dimens.x,
        cy: c.dimens.y
      });
      this.svg.curves[i][0].remove();
      this.svg.curves[i].prepend(makeCurves(s, c, this.machine));
      startWorkers(function() {
        var layers = app.layers.filter(el=>!el.type&&el.render.curve==c.id);
        console.log("Start workers for "+layers.length+" Layers");
        for (var l in layers) {
          createWorker(layers[l]);
        }
      });
    }, {deep: true, immediate: true});
  }

  for (var layer = app.layers.length-1; layer>=0; layer--) {
    var l = app.layers[layer];
    app.$watch("layers."+layer, function(l, old) {
      if (!l) return;
      var i = this.layers.length-1-this.layers.indexOf(l);
      if (!l.type) {
        this.svg.layers[i][0].attr({
          fill: l.render.inverted?"#000":"#fff",
          x: l.dimens.x,
          y: l.dimens.y,
          width: l.dimens.w,
          height: l.dimens.h
        });
        var img = this.images.find(el=>el.id==l.render.image);
        startWorkers(function() {
          console.log("Start Worker for 1 Layer");
          createWorker(l);
        });
      } else {
        if (l.type=="rect") {
          this.svg.layers[i].attr({
            x: l.dimens.x,
            y: l.dimens.y,
            width: l.dimens.w,
            height: l.dimens.h
          });
        } else {
          this.svg.layers[i].attr({
            cx: l.dimens.x+l.dimens.w/2,
            cy: l.dimens.y+l.dimens.h/2,
            rx: l.dimens.w/2,
            ry: l.dimens.h/2
          });
        }
        var il = this.layers.indexOf(l);
        startWorkers(function() {
          var layers = app.layers.filter((el,i)=>!el.type&&i>il);
          console.log("Start workers for "+layers.length+" Layers");
          for (var l in layers) {
            createWorker(layers[l]);
          }
        })
      }
    }, {deep: true, immediate: true});
  }

  app.$watch('sublayers_open', function(open) {
    this.svg.layers.attr({
      opacity: open?1:0.7
    });
    this.svg.images.attr({
      style: open?"opacity: 0.4; display: none":"opacity: 0.4; display: inherit"
    });
  }, {immediate: true});

  app.$watch('fullPreview', function(prev) {
    for (var l in this.layers) {
      if (this.layers[l].type) {
        var i = this.layers.length-1-l;
        this.svg.layers[i].attr({
          opacity: prev?0:1
        });
      }
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
  var g = s.g();
  const count = 5;
  g.attr({
    fill: "transparent"
  });
  var c = JSON.parse(JSON.stringify(curve));
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
  var l = null;
  var cdata = getCurveConstants(globals, curve, num, machine);
  if (!cdata) return s.line(0,0,0,0);
  var di = curve.steps/Math.round(curve.steps*cdata.length/globals.maxlength);
  var path = "";
  for (var i = 0; i<=curve.steps+1; i += di) {
    var point = getCurvePoint(globals, curve, i/curve.steps, cdata);
    path += (path==""?"M ":"L ")+point.x+" "+point.y+" ";
  }
  l = s.path(path);
  l.attr({
    opacity: opac
  });
  return l;
}

function getGlobalConstants(curve, machine) {
  if (curve.type=="Linie") {
    return {maxlength: dist(machine.dimens.x, machine.dimens.y, machine.dimens.w, machine.dimens.h)};
  } else if (curve.type == "Bogen") {
    var {start, end, err} = makeBorderPoints(curve.dimens, curve, machine);
    if (err) return null;
    var mlength = dist(machine.dimens.x, machine.dimens.y, machine.dimens.w, machine.dimens.h);
    var l = dist(start.x, start.y, end.x, end.y);
    var mid = {x: (start.x+end.x)/2+curve.dcos*(curve.stretch*l/mlength), y: (start.y+end.y)/2+curve.dsin*(curve.stretch*l/mlength)};
    return {start: start, end: end, mid: mid, maxlength: mlength};
  } else if (curve.type == "Kreis") {
    var r = Math.min(machine.dimens.w, machine.dimens.h)/4
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
      maxlength: dist(machine.dimens.x, machine.dimens.y, machine.dimens.w, machine.dimens.h)
    };
  }
}

function getCurveConstants(globals, curve, num, machine) {
  if (curve.type == "Linie") {
    var c = {x: curve.dimens.x+curve.xgap*num, y: curve.dimens.y+curve.ygap*num};
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
    var q = [(p.x*p.x)-(c0.x-machine.dimens.x)/c1.x, (p.x*p.x)-(c0.x-machine.dimens.x-machine.dimens.w)/c1.x,
            (p.y*p.y)-(c0.y-machine.dimens.y)/c1.y, (p.y*p.y)-(c0.y-machine.dimens.y-machine.dimens.h)/c1.y];
    var farr = [];
    if (c1.x == 0) {
      farr.push((machine.dimens.x-c0.x)/c2.x);
      farr.push((machine.dimens.x+machine.dimens.w-c0.x)/c2.x);
    }
    if (c1.y == 0) {
      farr.push((machine.dimens.y-c0.y)/c2.y);
      farr.push((machine.dimens.y+machine.dimens.h-c0.y)/c2.y);
    }
    for (var i in q) for (var d of [1,-1]) {
      if (q[i] >= 0 && c1[i>1?"y":"x"] != 0) {
        var f1 = p[i>1?"y":"x"]+d*Math.sqrt(q[i]);
        var dx = round(c0.x+f1*(f1*c1.x+c2.x), 100);
        var dy = round(c0.y+f1*(f1*c1.y+c2.y), 100);
        if (dx >= machine.dimens.x && dx <= machine.dimens.x+machine.dimens.w && dy >= machine.dimens.y && dy <= machine.dimens.y+machine.dimens.h) {
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
    var mid = {x: curve.dimens.x+curve.xgap*num, y: curve.dimens.y+curve.ygap*num}

    var f1 = globals.getApproxY(machine.dimens.y, mid);
    var fx1 = globals.getX(f1, mid);
    if (fx1 < machine.dimens.x || fx1 > machine.dimens.x+machine.dimens.w) {
      f1 = globals.getApproxX(fx1<machine.dimens.x?machine.dimens.x:(machine.dimens.x+machine.dimens.w), mid);
    }
    var f2 = globals.getApproxY(machine.dimens.y+machine.dimens.h, mid);
    var fx2 = globals.getX(f2, mid);
    if (fx2 < machine.dimens.x || fx2 > machine.dimens.x+machine.dimens.w) {
      f2 = globals.getApproxX(fx2<machine.dimens.x?machine.dimens.x:(machine.dimens.x+machine.dimens.w), mid);
    }

    return err ? null : {f1: f1, f2: f2-f1, mid: mid, length: l};
  }

}

function makeBorderPoints(c, curve, machine) {
  //generate start position with x or y is 0
  var start = {x: machine.dimens.x-1, y: machine.dimens.y};
  if (curve.dcos!=0) {
    start.x = c.x+curve.dsin*((c.y-machine.dimens.y)/curve.dcos);
  }
  if (start.x < machine.dimens.x || start.x > machine.dimens.x+machine.dimens.w) {
    start.x = start.x<machine.dimens.x?machine.dimens.x:machine.dimens.x+machine.dimens.w;
    start.y = c.y+curve.dcos*((c.x-start.x)/curve.dsin);
  }

  //generate end position with x is width or y is height
  var end = {x: machine.dimens.x+machine.dimens.w+1, y: machine.dimens.y+machine.dimens.h};
  if (curve.dcos!=0) {
    end.x = c.x+curve.dsin*((c.y-machine.dimens.y-machine.dimens.h)/curve.dcos);
  }
  if (end.x > machine.dimens.x+machine.dimens.w || end.x < machine.dimens.x) {
    end.x = end.x>machine.dimens.x+machine.dimens.w?machine.dimens.x+machine.dimens.w:machine.dimens.x;
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
    var p = {x: globals.center.x+Math.cos(step*globals.twoPi)*cdata.r, y: globals.center.y+Math.sin(step*globals.twoPi)*cdata.r};
    return p;
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
