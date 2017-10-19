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
    this.unwatchFunc = app.$watch(() => $this.$, ($) => func($this), {deep: true, immediate: true});
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
  svgEquals(e) {
    return this.svgObject.node == e;
  }
}

data.SVG = SVG;

class Layer extends SVG {
  constructor(x, y, w, h, rot, title, render, fill) {
    super(x || 0, y || 0, w || 300, h || 200, rot || 0, app.layers, "#svgLayers");
    this.$.title = title || "Layer";
    if (!render) render = {};
    this.$.render = {
      curve: this.idOf(render.curve, app.curves),
      image: this.idOf(render.image, app.images),
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
  idOf(e, arr) {
    if (arr.find(el => el.id == e)) {
      return e;
    } else if (arr.find(el => el.title == e)) {
      return arr.find(el => el.title == e).id;
    } else if (arr.indexOf(e) >= 0) {
      return e.id;
    } else {
      return null;
    }
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
  constructor(x, y, w, h, rot, title, render, border, inverted, fill) {
    super(x, y, w, h, rot, title, render, fill);
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
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h, rot: this.$.rot,
      title: this.$.title, render: this.$.render, border: this.$.border, inverted: this.$.inverted, fill: this.fill
    }
  }
  static fromObj(obj) {
    new CPart(obj.x, obj.y, obj.w, obj.h, obj.rot, obj.title, obj.render, obj.border, obj.inverted, obj.fill);
  }
}

data.CPart = CPart;

class Form extends Layer {
  constructor(x, y, w, h, rot, title, render, mask, ownRenderer, fill) {
    super(x, y, w || 20, h || 20, rot, title, render, fill);
    this.$.mask = mask || false;
    this.$.ownRenderer = ownRenderer || false

    let i = app.layers.indexOf(this);
    this.workerFunc = () => workerFunc(el => app.layers.indexOf(el) > i);

    this.svgAttr = {
      id: this.$.id,
      fill: "transparent",
      style: "stroke: #bbb; stroke-dasharray: 10px 20px",
      strokeWidth: 1,
      type: "layer"
      /*, filter: app.svg.shadow*/
    };
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h, rot: this.$.rot,
      title: this.$.title, render: this.$.render, mask: this.$.mask, ownRenderer: this.$.ownRenderer, fill: this.fill,
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

    let s = Snap("#svg");

    super.createSVG(s.rect(0,0,0,0)
      .attr(this.svgAttr));

    super.createSVGWatcher((layer) => {
      layer.svgObject.attr({
        x: layer.$.x,
        y: layer.$.y,
        width: layer.$.w,
        height: layer.$.h
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

    let s = Snap("#svg");

    super.createSVG(s.ellipse(0,0,0,0)
      .attr(this.svgAttr));

    super.createSVGWatcher((layer) => {
      layer.svgObject.attr({
        cx: layer.$.x+layer.$.w/2,
        cy: layer.$.y+layer.$.h/2,
        rx: layer.$.w/2,
        ry: layer.$.h/2
      });
      layer.workerFunc();
    });
  }
}

data.Ellipse = Ellipse;

class Image extends SVG {
  constructor(x, y, w, h, rot, title, url, data) {
    super(x || 0, y || 0, w || 300, h || 200, rot, app.images, "#svgImages");
    this.$.title = title || "Image";
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
    this.$.type = type || "Bogen";
    this.$.direction = direction || 45;
    this.$.stretch = stretch || 80;
    this.$.gap = gap || 2;
    this.$.steps = steps || 400;

    let s = Snap("#svg");

    super.createSVG(s.g()
      .add(makeCurves(s, this.toObj(), app.machine.toObj()))
      .add(s.circle(this.$.x, this.$.y, 4/app.project.zoom, 4/app.project.zoom).attr({type: "curve"}))
      .attr({id: this.$.id, stroke: "#008dea", fill: "#008dea", style: "display: none"}));

    super.createSVGWatcher((curve) => {
      curve.svgObject[1].attr({cx: curve.$.x, cy: curve.$.y});
      curve.svgObject[0].remove();
      curve.svgObject.prepend(makeCurves(s, this.toObj(), app.machine.toObj()));
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

    this.svgObject = s.rect(0,0,w,h).attr({id: "svgMachine", fill: "#ccc", type: "machine"});
    app.svg.project.prepend(this.svgObject);

    console.log("create watcher");
    super.createSVGWatcher(function(m) {
      m.svgObject.attr({width: m.$.w, height: m.$.h,
        transform: "translate("+m.$.x+" "+m.$.y+")"});
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
  constructor(x, y, w, h, rot, text, size, font) {
    super(x, y, w, h, rot, app.texts, "#svgTexts");
    this.$.text = text;
    this.$.size = size || 12;
    this.$.font = font || "BalooBhaijaan-Regular.ttf";

    super.createSVG(s.text(x, y, text).attr({id: this.$.id, fill: "#505050", type: "text"}));

    super.createSVGWatcher((text) => {
      text.svgObject.attr({
        x: text.$.x,
        y: text.$.y+text.$.h,
        style: "font-size: "+text.$.size+"px",
        text: text.$.text
      });
      text.$.w = $(text.svgObject.node).width();
      text.$.h = $(text.svgObject.node).height();
      if (app.fonts[text.font]) {
        text.$.path = app.fonts[text.$.font].getPath(text.$.text, text.$.x, text.$.y+text.$.h, text.$.size);
      }
    })
  }
  toObj() {
    return {
      x: this.$.x, y: this.$.y, w: this.$.w, h: this.$.h, rot: this.$.rot,
      text: this.$.text, size: this.$.size, font: this.$.font
    };
  }
  static fromObj(obj) {
    return new Text(obj.x, obj.y, obj.w, obj.h, obj.rot, obj.text, obj.size, obj.font);
  }
}

data.Text = Text;

class Font {
  constructor(file) {
    this.file = file;
  }
  toObj() {
    return {file};
  }
}

data.Font = Font;

class Layout {
  constructor(title, template) {
    this.title = title;
    this.template = template;

    app.layouts.push(this);
  }
  static createNew(title) {
    return new Layout(title, {machine: app.machine.toObj(), layers: app.layers.map(e => e.toObj()),
      images: app.images.map(e => e.toObj()), curves: app.curves.map(e => e.toObj()),
      texts: app.texts.map(e => e.toObj()), fonts: app.fonts.map(e => e.toObj())});
  }
  static fromObj(obj) {
    return new Layout(obj.title, obj.template);
  }
  toObj() {
    return {title: this.title, template: this.template}
  }
  build() {
    app.selectedLayer = null;
    if (app.machine instanceof Machine)
      app.machine.remove();
    app.machine = Machine.fromObj(this.template.machine);
    app.layers.forEach(l => l.remove());
    app.layers = [];
    if (this.template.layers) {
      this.template.layers.forEach((l) => Layer.fromObj(l));
    }
    app.images.forEach(i => i.remove());
    app.images = [];
    if (this.template.images) {
      this.template.images.forEach((i) => Image.fromObj(i));
    } else {
      Image.fromObj({title: "Image"});
    }
    app.curves.forEach(c => c.remove());
    app.curves = [];
    if (this.template.curves) {
      this.template.curves.forEach((c) => Curve.fromObj(c));
    } else {
      Curve.fromObj({title: "Curve"});
    }
    app.layers.forEach((l) => {
      if (!l.$.render.curve && app.curves.length>0) l.$.render.curve = app.curves[0].$.id;
      if (!l.$.render.image && app.images.length>0) l.$.render.image = app.images[0].$.id;
    });
  }
  remove() {
    app.layouts.splice(app.layouts.indexOf(this), 1);
  }
}

data.Layout = Layout;
