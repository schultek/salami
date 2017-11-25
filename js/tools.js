class Tool {
  constructor(icon, data, mD, mM, mU) {
    this.icon = icon;
    this.data = data;
    this.mD = mD.bind(this);
    this.mM = mM.bind(this);
    this.mU = mU.bind(this);
  }
  mouseDown(event, target, qM) {
    return this.mD(event, target, qM);
  }
  mouseMove(event) {
    return this.mM.call(this, event);
  }
  mouseUp(event) {
    return this.mU(event);
  }
}

data.Tool = Tool;

function spanObject(event) {
  var p = localPos(event.x, event.y);
  if (p.x-this.data.x > 0) {
    app.selectedLayer.$.w = Math.round((p.x-this.data.x)*10)/10;
  } else {
    app.selectedLayer.$.w = Math.round((this.data.x-p.x)*10)/10;
    app.selectedLayer.$.x = p.x;
  }
  if (p.y-this.data.y > 0) {
    app.selectedLayer.$.h = Math.round((p.y-this.data.y)*10)/10;
  } else {
    app.selectedLayer.$.h = Math.round((this.data.y-p.y)*10)/10;
    app.selectedLayer.$.y = p.y;
  }
}

function resetData(event) {
  this.data.mode = null;
  this.data.resize = null;
  this.data.type = null;
  this.data.x = null;
  this.data.y = null;
}

data.tools = {};

data.tools.select = new Tool("mouse-pointer", {mode: "select"}, function(event, target, quickMode) {
  if ($(target).attr("type") == "zoom") {
    var e = {x: $("#workarea").position().left+$("#workarea").width()/2,y: $("#workarea").position().top+$("#workarea").height()/2 };
    var p = localPos(e.x, e.y);
    this.data = {x: p.x, y: p.y, ex: e.x, ey: e.y, type: "zoom", mode: this.data.mode};
  } else if (this.data.mode == "move") {
    this.data.x = app.project.xPos-event.x;
    this.data.y = app.project.yPos-event.y;
  } else if (this.data.mode == "zoom") {
    var p = localPos(event.x, event.y);
    this.data = {x: p.x, y: p.y, ex: event.x, ey: event.y, zoom: app.project.zoom*100-event.y, mode: "zoom"};
  } else if (this.data.mode == "select") {
    if ($(target).attr("type")=="resize") {
      this.data.resize = $(target).attr("rzmode");
      if (app.selectedLayer == app.machine) {
        app.project.autoAdjustMachine = false;
      }
    } else if ($(target).attr("type")=="rotate") {
      this.data.type = "rotate";
    } else {
      if (!quickMode) {
        app.selectedLayer = null;

        if (app.machine.svgEquals(target)) {
          app.selectedLayer = app.machine;
        } else {
          for (var l in app.layers) {
            if (app.layers[l].svgEquals(target)) {
              app.selectedLayer = app.layers[l];
              break;
            }
          }
          if (!app.selectedLayer) {
            for (var i in app.images) {
              if (app.images[i].svgEquals(target)) {
                app.selectedLayer = app.images[i];
                if (app.selectedLayer.$.url == app.bufferURL) {
                  app.loadImage(app.selectedLayer);
                }
                break;
              }
            }
          }
          if (!app.selectedLayer) {
            for (var c in app.curves) {
              if (app.curves[c].svgEquals(target)) {
                app.selectedLayer = app.curves[c];
                break;
              }
            }
          }
          if (!app.selectedLayer) {
            for (var t in app.texts) {
              if (app.texts[t].svgEquals(target)) {
                app.selectedLayer = app.texts[t];
                break;
              }
            }
          }
        }
      }
      this.data.resize = "0";
    }
    if (app.selectedLayer!=null) {
      var p = localPos(event.x, event.y);
      this.data.x = app.selectedLayer.$.x - p.x;
      this.data.y = app.selectedLayer.$.y - p.y;
      if (!(app.selectedLayer instanceof Curve)) {
        this.data.pro = app.selectedLayer.$.w/app.selectedLayer.$.h;
      }
    }
  }
}, function(event) {
  if (this.data.x == null || this.data.y == null) return;
  if (this.data.type == "zoom") {
    var z = (event.y-$("#workarea").position().top-parseInt($("#corner-zoom-bar").css("margin-top")))/$("#corner-zoom-bar").height()*100/22.36;
    app.project.zoom = z>0?z*z:0;
    if (app.project.zoom < 0.1) app.project.zoom = 0.1;
    if (app.project.zoom > 20) app.project.zoom = 20;
    app.project.xPos = this.data.ex-(this.data.x*app.project.zoom)-$("#svg").position().left;
    app.project.yPos = this.data.ey-(this.data.y*app.project.zoom)-$("#svg").position().top;
  } else if (this.data.type == "rotate") {
    let p = localPos(event.x, event.y);
    let m = {
      x: app.selectedLayer.$.x+app.selectedLayer.$.w/2,
      y: app.selectedLayer.$.y+app.selectedLayer.$.h/2
    };
    app.selectedLayer.$.rot = Math.atan2(m.y-p.y, m.x-p.x)*360/Math.PI/2-90;
    app.mapRotation('rot', app.selectedLayer.$);
  } else if (this.data.mode == "select") {
    var p = localPos(event.x, event.y);
    p.x = Math.round(p.x*10)/10;
    p.y = Math.round(p.y*10)/10;
    if (this.data.resize == "0" && app.selectedLayer != app.machine) {
      app.selectedLayer.$.x = this.data.x+p.x;
      app.selectedLayer.$.y = this.data.y+p.y;
    }
    if (!(app.selectedLayer instanceof Curve || app.selectedLayer instanceof Text)) {
      p = rotate(p, app.selectedLayer.$, false);
      let start = {x: app.selectedLayer.$.x, y: app.selectedLayer.$.y};
      let end = {x: app.selectedLayer.$.x+app.selectedLayer.$.w, y: app.selectedLayer.$.y+app.selectedLayer.$.h};

      if (this.data.resize.includes("sy")) start.y = p.y;
      if (this.data.resize.includes("ex")) end.x = p.x;
      if (this.data.resize.includes("ey")) end.y = p.y;
      if (this.data.resize.includes("sx")) start.x = p.x;

      if (event.shiftKey && (this.data.resize.length == 4)) {
        let h = (end.x-start.x)/this.data.pro;
        if (this.data.resize.includes("sy")) {
          start.y = end.y - h;
        } else {
          end.y = start.y + h
        }
      }

      start = rotate(start, app.selectedLayer.$, true);
      end = rotate(end, app.selectedLayer.$, true);
      let mid = {x: (start.x+end.x)/2, y: (start.y+end.y)/2};
      start = rotate(start, app.selectedLayer.$, false, mid);
      end = rotate(end, app.selectedLayer.$, false, mid);
      app.selectedLayer.$.x = start.x;
      app.selectedLayer.$.y = start.y;
      app.selectedLayer.$.w = end.x-start.x;
      app.selectedLayer.$.h = end.y-start.y;

      if (app.selectedLayer.$.w < 0) {
        app.selectedLayer.$.x += app.selectedLayer.$.w;
        app.selectedLayer.$.w *= -1;
        console.log(this.data.resize);
        this.data.resize = this.data.resize.replace(/sx/g, "tx").replace(/ex/g, "sx").replace(/tx/g, "ex");
        console.log(this.data.resize);
      }
      if (app.selectedLayer.$.h < 0) {
        app.selectedLayer.$.y += app.selectedLayer.$.h;
        app.selectedLayer.$.h *= -1;
        this.data.resize = this.data.resize.replace(/sy/g, "ty").replace(/ey/g, "sy").replace(/ty/g, "ey");
      }
    }
  } else if (this.data.mode == "move") {
    app.project.xPos = this.data.x+event.x;
    app.project.yPos = this.data.y+event.y;
  } else if (this.data.mode == "zoom") {
    app.project.zoom = (this.data.zoom+event.y)/100;
    if (app.project.zoom < 0.1) app.project.zoom = 0.1;
    if (app.project.zoom > 20) app.project.zoom = 20;
    app.project.xPos = this.data.ex-(this.data.x*app.project.zoom)-$("#svg").position().left;
    app.project.yPos = this.data.ey-(this.data.y*app.project.zoom)-$("#svg").position().top;
  }
}, resetData);

data.tools.image = new Tool("picture-o", {}, function(event, target) {
  app.sublayers_open = false;
  var p = localPos(event.x, event.y);
  app.selectedLayer = new Image(p.x, p.y, 0, 0, 0, "Image "+(app.images.length+1));
  this.data = p;
}, spanObject, resetData);

data.tools.part = new Tool("th-large", {}, function(event, target) {
  app.sublayers_open = true;
  var p = localPos(event.x, event.y);
  app.selectedLayer = new CPart(p.x, p.y, 0, 0, 0, "Part "+(app.layers.length+1), {
    curve: app.curves[0] ? app.curves[0].$.id : null,
    image: app.images[0] ? app.images[0].$.id : null,
    lines: {l: 10, r: 10},
    inverted: false,
    dotted: false,
    refinedEdges: 100,
    smooth: 50
  }, null, false);
  this.data = p;
}, spanObject, resetData);

data.tools.rect = new Tool("square-o", {}, function(event, target) {
  app.sublayers_open = true;
  var p = localPos(event.x, event.y);
  app.selectedLayer = new Rect(p.x, p.y, 0, 0, 0, "Form "+(app.layers.length+1), {
    curve: app.curves[0] ? app.curves[0].$.id : null,
    image: app.images[0] ? app.images[0].$.id : null,
    lines: {l: 10, r: 10},
    inverted: false,
    dotted: false,
    refinedEdges: 100,
    smooth: 50
  }, false, false);
  this.data = p;
}, spanObject, function() {
  resetData.call(this);
  tourEvent("rect-added");
});

data.tools.ellipse = new Tool("circle-o", {}, function(event, target) {
  app.sublayers_open = true;
  var p = localPos(event.x, event.y);
  app.selectedLayer = new Ellipse(p.x, p.y, 0, 0, 0, "Form "+(app.layers.length+1), {
    curve: app.curves[0] ? app.curves[0].$.id : null,
    image: app.images[0] ? app.images[0].$.id : null,
    lines: {l: 10, r: 10},
    inverted: false,
    dotted: false,
    refinedEdges: 100,
    smooth: 50
  }, false, false);
  this.data = p;
}, spanObject, resetData);

data.tools.curve = new Tool("leaf", {}, function(event, target) {
  app.sublayers_open = false;
  var p = localPos(event.x, event.y);
  app.selectedLayer = new Curve(p.x, p.y, "Curve "+(app.curves.length+1), "Linie")
  app.selectedTool = app.tools.select;
}, function(event) {
  let p = localPos(event.x, event.y);
  app.selectedLayer.$.x = p.x;
  app.selectedLayer.$.y = p.y;
}, resetData);

data.tools.text = new Tool("font", {}, function(event, target) {
  app.sublayers_open = false;
  var p = localPos(event.x, event.y);
  app.selectedLayer = new Text(p.x, p.y, "Text "+(app.texts.length+1));
  app.selectedTool = app.tools.select;
}, (event) => {}, (event) => {});


let liftTool = new Tool("", {}, function(event, target) {
  let elem = target.elem;
  let layer = target.layer;
  elem.css("top", elem.position().top).css("left", elem.position().left).css("width", elem.width()).addClass("moving");
  this.data = {y: elem.position().top-event.y, elem, layer, lines: []};
  $("#layers").append("<div id='move-line'>");
  $("#move-line").css("left", elem.position().left);
  var pos = $(".layer-item:first-child").position().top;
  var h = 25;
  for (layer in app.layers) {
    this.data.lines.push(pos);
    pos += h;
  }
  moveLine(elem.position().top+h/2, this.data.lines);
}, function(event) {
  this.data.elem.css("top", this.data.y+event.y);
  moveLine(this.data.y+event.y+25/2, this.data.lines);
}, function(event) {
  var i = app.layers.length-1-moveLine(this.data.y+event.y+25/2, this.data.lines);
  this.data.layer.remove();
  this.data.layer.add(i);
  this.data.elem.css("top", 0).css("left", 0).css("width", "auto").removeClass("moving");
  $("#move-line").remove();
});

function moveLine(y, lines) {
  var min = -1;
  var minI = 0;
  for (i in lines) {
    var d = Math.abs(y-lines[i]);
    if (min < 0 || d < min) {
      min = d;
      minI = i;
    }
  }
  $("#move-line").css("top", lines[minI]);
  return parseInt(minI);
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
