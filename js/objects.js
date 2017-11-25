class Dimension {
  constructor(x, y, w, h, rot) {
    this.$ = {};
    this.$.x = x || 0;
    this.$.y = y || 0;
    this.$.w = w || 0;
    this.$.h = h || 0;
    this.$.rot = rot || 0;
  }
}

data.Dimension = Dimension;

class SVG extends Dimension {
  constructor(x, y, w, h, rot, objGroup, svgGroup) {
    super(x, y, w, h, rot);
    this.$.id = getId();
    this.objGroup = objGroup;
    this.svgGroup = svgGroup;
  }
  createSVG(svg) {
    this.svgObject = svg;
    this.add();
  }
  createSVGWatcher(func) {
    this.watcherFunc = func;
    let $this = this;
    this.unwatch();
    this.unwatchFunc = app.$watch(() => $this.$, ($, old) => func($this, old), {deep: true, immediate: true});
  }
  unwatch() {
    if (this.unwatchFunc) {
      this.unwatchFunc();
    }
  }
  add(index) {
    if (index === 0 || index) {
      this.objGroup.splice(index, 0, this);
      if (index == 0) {
        this.svgObject.prependTo(Snap("#svg").select(this.svgGroup));
      } else {
        let id = this.objGroup[index-1].$.id;
        this.svgObject.insertAfter(Snap("#svg").select("#"+id));
      }
    } else {
      this.objGroup.push(this);
      Snap("#svg").select(this.svgGroup).add(this.svgObject);
    }
    if (this.watcherFunc)
      this.createSVGWatcher(this.watcherFunc);
  }
  remove() {
    this.objGroup.splice(this.objGroup.indexOf(this), 1);
    this.svgObject.remove();
    this.unwatch();
    if (app.selectedLayer == this) {
      app.selectedLayer = null;
    }
  }
  idOf(e, arr) {
    if (arr.find(el => el.$.id == e)) {
      return e;
    } else if (arr.find(el => el.$.title == e)) {
      return arr.find(el => el.$.title == e).$.id;
    } else if (arr.indexOf(e) >= 0) {
      return e.$.id;
    } else if (arr.length > e){
      return arr[e].$.id;
    } else {
      return null;
    }
  }
  svgEquals(e) {
    return this.svgObject.node == e;
  }
}

data.SVG = SVG;

class Layer extends SVG {
  constructor(x, y, w, h, rot, title, render, fill) {
    super(x || 0, y || 0, w || 300, h || 200, rot || 0, app.layers, "#svgLayers");
    this.$.title = title || "Ebene";
    if (!render) render = {};
    this.$.render = {
      curve: super.idOf(render.curve || 0, app.curves),
      image: super.idOf(render.image || 0, app.images),
      lines: {
        l: render.lines ? render.lines.l || 100 : 100,
        r: render.lines ? render.lines.r || 100 : 100
      },
      dotted: render.dotted,
      refinedEdges: render.refinedEdges || 100,
      smooth: render.smooth || 50
    };
    this.$.links = {};
    this.fill = fill || false;

  }
  fixIdReference(render) {
    let r = JSON.parse(JSON.stringify(render));
    let c = app.curves.find(el => el.$.id == render.curve);
    let i = app.images.find(el => el.$.id == render.image);
    r.curve = c ? c.$.title : null;
    r.image = i ? i.$.title : null;
    return r;
  }
  linkTo(layer, prop) {
    this.$.links[prop] = layer;
    this.$[prop] = layer.$[prop];
    layer.$.links[prop] = this;
  }
  unlink(prop) {
    var newobj = JSON.parse(JSON.stringify(this.$[prop]));
    this.$[prop] = newobj;
    this.$.links[prop].$.links[prop]=undefined;
    this.$.links[prop]=undefined;
  }
  static fromObj(obj) {
    if (obj.type) {
      return Form.fromObj(obj);
    } else {
      return CPart.fromObj(obj);
    }
  }
}

data.Layer = Layer;

class CPart extends Layer {
  constructor(x, y, w, h, title, render, border, inverted, fill) {
    super(x, y, w, h, 0, title, render, fill);
    if (!border) border = {};
    this.$.border = {
      left: border.left || 5,
      right: border.right || 5,
      top: border.top || 5,
      bottom: border.bottom || 5
    };
    this.$.inverted = inverted || false;
    this.icon = "th-large";

    let s = Snap("#svg");

    super.createSVG(s.g(s.rect(0,0,0,0).attr({fill: "#fff", style: "stroke: #ddd"}),
      s.g()).attr({id: this.$.id, type: "layer" /*, filter: app.svg.shadow*/ }));

    super.createSVGWatcher((layer) => {
      layer.svgObject[0].attr({
        fill: layer.$.inverted?"#000":"#fff",
        x: layer.$.x,
        y: layer.$.y,
        width: layer.$.w,
        height: layer.$.h
      });

      workerFunc(el => el == layer);
    });
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h,
      title: this.$.title, render: super.fixIdReference(this.$.render), border: this.$.border, inverted: this.$.inverted, fill: this.fill
    }
  }
  static fromObj(obj) {
    new CPart(obj.x, obj.y, obj.w, obj.h, obj.title, obj.render, obj.border, obj.inverted, obj.fill);
  }
}

data.CPart = CPart;

class Form extends Layer {
  constructor(x, y, w, h, rot, title, render, mask, ownRenderer, fill) {
    super(x, y, w || 20, h || 20, rot, title, render, fill);
    this.$.mask = mask || false;
    this.$.ownRenderer = ownRenderer || false

    let i = app.layers.indexOf(this);
    this.workerFunc = () => {
      if (!this.$.ownRenderer) {
        this.gcode = null;
        this.svgObject[1].clear();
      }
      workerFunc(el => app.layers.indexOf(el) > i)
    };

    let s = Snap("#svg");

    super.createSVG(s.g(
      (this instanceof Ellipse ? s.ellipse(0,0,0,0) : s.rect(0,0,0,0))
        .attr({fill: "transparent", style: "stroke: #bbb; stroke-dasharray: 10px 20px", strokeWidth: 1}),
      s.g()).attr({id: this.$.id, type: "layer" /*, filter: app.svg.shadow*/ }));

  }
  remove() {
    super.remove();
    workerFunc(() => true);
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h, rot: this.$.rot,
      title: this.$.title, render: super.fixIdReference(this.$.render), mask: this.$.mask, ownRenderer: this.$.ownRenderer, fill: this.fill,
      type: this instanceof Rect ? "rect" : "ellipse"
    }
  }
  static fromObj(obj) {
    return obj.type == "rect" ?
      new Rect(obj.x, obj.y, obj.w, obj.h, obj.rot, obj.title, obj.render, obj.mask, obj.ownRenderer, obj.fill) :
      new Ellipse(obj.x, obj.y, obj.w, obj.h, obj.rot, obj.title, obj.render, obj.mask, obj.ownRenderer, obj.fill);
  }
}

data.Form = Form;

class Rect extends Form {
  constructor(x, y, w, h, rot, title, render, mask, ownRenderer, fill) {
    super(x, y, w, h, rot, title, render, mask, ownRenderer, fill);
    this.icon = "square-o";

    super.createSVGWatcher((layer) => {
      layer.svgObject[0].attr({
        x: layer.$.x,
        y: layer.$.y,
        width: layer.$.w,
        height: layer.$.h,
        transform: "rotate("+layer.$.rot+" "+(layer.$.x+layer.$.w/2)+" "+(layer.$.y+layer.$.h/2)+")"
      });
      layer.workerFunc();
    });
  }
}

data.Rect = Rect;

class Ellipse extends Form {
  constructor(x, y, w, h, rot, title, render, mask, ownRenderer, fill) {
    super(x, y, w, h, rot, title, render, mask, ownRenderer, fill);
    this.icon = "circle-o";

    super.createSVGWatcher((layer) => {
      layer.svgObject[0].attr({
        cx: layer.$.x+layer.$.w/2,
        cy: layer.$.y+layer.$.h/2,
        rx: layer.$.w/2,
        ry: layer.$.h/2,
        transform: "rotate("+layer.$.rot+" "+(layer.$.x+layer.$.w/2)+" "+(layer.$.y+layer.$.h/2)+")"
      });
      layer.workerFunc();
    });
  }
}

data.Ellipse = Ellipse;

class Image extends SVG {
  constructor(x, y, w, h, rot, title, url, data) {
    super(x || 0, y || 0, w || 300, h || 200, rot || 0, app.images, "#svgImages");
    this.$.title = title || "Bild";
    this.$.url = url || app.bufferURL;
    this.$.data = data || app.bufferData;
    if (data) {
      loadImage(this, data);
    } else if (url) {
      let $this = this;
      getDataURL(url, (d) => {
        $this.$.data = d;
        loadImage($this, d);
      });
    }

    let s = Snap("#svg");

    super.createSVG(s.image(0,0,0,0)
      .attr({id: this.$.id, type: "image" }));

    super.createSVGWatcher((img) => {
      img.svgObject.attr({
        "xlink:href": img.$.data || app.bufferData,
        width: img.$.w,
        height: img.$.h,
        transform: "translate("+img.$.x+" "+img.$.y+") rotate("+img.$.rot+" "+(img.$.w/2)+" "+(img.$.h/2)+")"
      });
      workerFunc(el => el.$.render.image == img.$.id);
    });
  }
  toObj(withPix) {
    let obj = {
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h, rot: this.$.rot,
      title: this.$.title, url: this.$.url, data: this.$.data
    }
    if (withPix) obj.pixels = app.pixels[this.$.id];
    return obj;
  }
  static fromObj(obj) {
    return new Image(obj.x, obj.y, obj.w, obj.h, obj.rot, obj.title, obj.url, obj.data);
  }
}

data.Image = Image;

class Curve extends SVG {
  constructor(x, y, title, type, direction, stretch, gap, steps) {
    super(x || 150, y || 100, 0, 0, 0, app.curves, "#svgCurves");
    this.$.title = title || "Linie";
    this.$.type = type || "Linie";
    this.$.direction = direction || 45;
    this.$.stretch = stretch || 80;
    this.$.gap = gap || 2;
    this.$.steps = steps || 400;

    let s = Snap("#svg");

    super.createSVG(s.g(
        makeCurves(s, this.toObj(), app.machine.toObj()),
        s.circle(this.$.x, this.$.y, 4/app.project.zoom, 4/app.project.zoom).attr({type: "curve"})
      ).attr({id: this.$.id, stroke: "#008dea", fill: "#008dea", style: "display: none"}));

    super.createSVGWatcher((curve) => {
      curve.svgObject[1].attr({cx: curve.$.x, cy: curve.$.y});
      curve.svgObject[0].remove();
      curve.svgObject.prepend(makeCurves(s, curve.toObj(), app.machine.toObj()));
      workerFunc(el => el.$.render.curve == curve.$.id);
    });
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, title: this.$.title, type: this.$.type,
      direction: this.$.direction, stretch: this.$.stretch, gap: this.$.gap, steps: this.$.steps
    }
  }
  static fromObj(obj) {
    return new Curve(obj.x, obj.y, obj.title, obj.type, obj.direction, obj.stretch, obj.gap, obj.steps);
  }
  svgEquals(e) {
    return this.svgObject[1].node == e;
  }
}

data.Curve = Curve;

class Machine extends SVG {
  constructor(x, y, w, h, bit, speed, outHeight) {
    super(x || 0, y || 0, w || 300, h || 200, 0, null, null);
    this.$.bit = bit || {
      width: 2.0,
      height: 3.2,
      tip: 0.1,
      inDepth: 1.5
    };
    this.$.speed = speed || {
      feedrate: 300,
      feedrateDot: 400,
      seekrate: 1000
    };
    this.$.outHeight = outHeight || 1;

    let s = Snap("#svg");

    this.svgObject = s.rect(0,0,this.$.w,this.$.h).attr({id: "svgMachine", fill: "#ccc", type: "machine"});
    app.svg.project.prepend(this.svgObject);

    super.createSVGWatcher(function(m) {
      m.svgObject.attr({width: m.$.w, height: m.$.h,
        transform: "translate("+m.$.x+" "+m.$.y+")"});
      app.curves.forEach(curve => {
        curve.svgObject[0].remove();
        curve.svgObject.prepend(makeCurves(s, curve.toObj(), m.toObj()));
      });
      workerFunc(el => true);
    });
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h,
      bit: this.$.bit, speed: this.$.speed, outHeight: this.$.outHeight
    }
  }
  static fromObj(obj) {
    return new Machine(obj.x, obj.y, obj.w, obj.h, obj.bit, obj.speed, obj.outHeight);
  }
  remove() {
    this.unwatch();
    this.svgObject.remove();
    if (app.selectedLayer == this) {
      app.selectedLayer = null;
    }
  }
}

data.Machine = Machine;

class Text extends SVG {
  constructor(x, y, text, size, stroke, font) {
    super(x, y, 0, 0, 0, app.texts, "#svgTexts");
    this.$.text = text || "Text";
    this.$.size = size || 12;
    this.$.font = super.idOf(font || "BalooBhaijaan-Regular", app.fonts) || new Font(font || "fonts/BalooBhaijaan-Regular.ttf").$.id;

    this.$.stroke = stroke || 0.5

    let s = Snap("#svg");

    super.createSVG(s.g(
      s.path("").attr({strokeWidth: this.$.stroke, stroke: "#505050", fill: "transparent"}),
      s.circle(0, 0, 4/app.project.zoom, 4/app.project.zoom).attr({fill: "#008dea", type: "text"})
    ).attr({id: this.$.id}));

    super.createSVGWatcher((text) => {
      if (app.fonts.find(el => el.$.id == text.$.font)) {
        app.fonts.find(el => el.$.id == text.$.font).getPath(text.$.text, 0, text.$.h, text.$.size)
          .then(path => {
            text.gcode = this.makeGCode(path);
            text.$.path = path.toPathData(3);
            text.svgObject[0].attr({
              d: text.$.path || ""
            });
          })
      }
      text.svgObject.attr({
        transform: "translate("+text.$.x+","+text.$.y+")"
      });
      text.svgObject[0].attr({
        strokeWidth: text.$.stroke
      });
    })
  }
  makeGCode(path) {
    let out = [];
    let depth = (-Math.max(this.$.stroke, app.machine.$.bit.tip)/app.machine.$.bit.width*app.machine.$.bit.height).toFixed(2);
    let pathBegin = null;
    let last = null;
    path.commands.forEach(c => {
      let p = {x: this.$.x+c.x, y: app.machine.$.h - (this.$.y+c.y)}
      if (c.x1) p.x1 = this.$.x+c.x1;
      if (c.y1) p.y1 = app.machine.$.h - (this.$.y+c.y1);
      if (c.type == "M") {
        out.push("G1 Z1");
        out.push("G1 X"+p.x.toFixed(2)+" Y"+p.y.toFixed(2));
        out.push("G1 Z"+depth);
        pathBegin = p;
      } else if (c.type == "L") {
        out.push("G1 X"+p.x.toFixed(2)+" Y"+p.y.toFixed(2)+" Z"+depth);
      } else if (c.type == "Z") {
        if (pathBegin) out.push("G1 X"+pathBegin.x.toFixed(2)+" Y"+pathBegin.y.toFixed(2)+" Z"+depth);
      } else if (c.type == "Q") {
        if (last) out.concat(this.makeQBezier(last, p).map(pt => "G1 X"+pt.x.toFixed(2)+" Y"+pt.y.toFixed(2)+" Z"+depth));
      } else {
        throw Error("Not implemented: "+c.type);
      }
      last = p;
    });
    return out;
  }
  makeQBezier(l, p) {
    let sq = a => a*a;
    let len = Math.sqrt(sq(p.x1-l.x)+sq(p.y1-l.y))+Math.sqrt(sq(p.x-p.x1)+sq(p.y-p.y1));
    let steps = Math.max(Math.round(len / 2), 1);
    let points = [];
    for (let i=1; i<=steps; i++) {
      let f = i/steps;
      let dx1 = l.x + (p.x1 - l.x) * f;
      let dx2 = p.x1 + (p.x - p.x1) * f;
      let x = dx1 + (dx2 - dx1) * f;
      let dy1 = l.y + (p.y1 - l.y) * f;
      let dy2 = p.y1 + (p.y - p.y1) * f;
      let y = dy1 + (dy2 - dy1) * f;
      points.push({x, y});
    }
    return points;
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, text: this.$.text, size: this.$.size, font: this.$.font
    };
  }
  static fromObj(obj) {
    return new Text(obj.x, obj.y, obj.text, obj.size, obj.font);
  }
  svgEquals(e) {
    return this.svgObject[1].node == e;
  }
}

data.Text = Text;

class Font {
  constructor(file) {
    this.$ = {};
    this.$.file = file;
    this.$.id = getId();
    this.$.title = file.substring(file.lastIndexOf("/")+1, file.lastIndexOf("."));

    app.fonts.push(this);
  }
  async getPath(text, x, y, size) {
    let $this = this;
    return new Promise((res, rej) => {
      if (this.font) {
        res($this.font.getPath(text, x, y, size));
      } else {
        opentype.load($this.$.file, (err, font) => {
          if (err) {
            app.fonts.splice(app.fonts.indexOf($this), 1);
            let id = app.fonts.length > 0 ? app.fonts[0].$.id : "";
            for (let t of app.texts) {
              if (t.$.font == $this.$.id) {
                t.$.font = id;
              }
            }
            app.alert("This Font cannot be used!");
          } else {
            $this.font = font;
            res($this.font.getPath(text, x, y, size));
          }
        });
      }
    })
  }
  toObj() {
    return {file};
  }
}

data.Font = Font;

class Layout {
  constructor(title, template, deleteable, url) {
    this.title = title;
    this.template = template;
    this.url = url;
    this.deleteable = deleteable;
    this.edit = false;

    app.layouts.push(this);
  }
  static createNew(title, url, deleteable) {
    return new Layout(title, {machine: app.machine.toObj(), layers: app.layers.map(e => e.toObj()),
      images: app.images.map(e => e.toObj()), curves: app.curves.map(e => e.toObj()),
      texts: app.texts.map(e => e.toObj()), fonts: app.fonts.map(e => e.toObj())}, deleteable, url);
  }
  static fromObj(obj, url) {
    return new Layout(obj.title, obj.template, obj.deleteable, url);
  }
  toObj() {
    return {title: this.title, template: this.template}
  }
  build() {
    app.selectedLayer = null;
    if (app.machine instanceof Machine)
      app.machine.remove();
    app.machine = Machine.fromObj(this.template.machine || {});
    app.layers.slice().forEach((l) => {
      l.remove();
    });
    let url;
    if (app.images.length == 1) {
      url = app.images[0].$.url;
    }
    app.images.slice().forEach(i => i.remove());
    app.images = [];
    if (this.template.images) {
      this.template.images.forEach((i) => Image.fromObj(i));
    } else {
      Image.fromObj({title: "Bild", url});
    }
    app.curves.slice().forEach(c => c.remove());
    app.curves = [];
    if (this.template.curves) {
      this.template.curves.forEach((c) => Curve.fromObj(c));
    } else {
      Curve.fromObj({title: "Linie"});
    }
    app.layers = [];
    if (this.template.layers) {
      this.template.layers.forEach((l) => Layer.fromObj(l));
    }
  }
  remove() {
    app.layouts.splice(app.layouts.indexOf(this), 1);
    fs.unlink(this.url, (err) => {
      if (err) throw err;
    });
  }
  startEdit() {
    app.layouts.forEach(l => { if (l.edit) l.closeEdit() });
    this.edit = true;
  }
  closeEdit() {
    this.edit = false;
    let $this = this;
    fs.readFile(this.url, (err, data) => {
      let l = JSON.parse(data);
      l.title = $this.title;
      fs.writeFile($this.url, JSON.stringify(l), (err) => {
        if (err) throw err;
      });
    });
  }
}

data.Layout = Layout;
