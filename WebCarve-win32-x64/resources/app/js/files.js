var {ipcRenderer, remote} = require('electron');
var base64 = require('base64-img');
var dialog = remote.dialog;
var fs = require("fs");
var dir = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/")+1);

ipcRenderer.on('file', (event, arg) => {
  if (arg == 'save-project') app.saveProject();
  else if (arg == 'load-project') app.loadProject();
  else if (arg == 'save-layout') app.saveLayout();
  else if (arg == 'save-gcode') app.saveGCode();
});

console.log();
function loadImage(image, url, callback) {
  getPixels(url, function(err, pixels) {
    if (err) {
      console.log("Bad Image", err);
    } else {
      var pix = app.pixels.find(el => el.image == image.id);
      if (pix) {
        pix.pixels = pixels;
      } else {
        app.pixels.push({
          image: image.id,
          pixels: pixels
        });
      }
      var h = Math.round(pixels.shape[1] / pixels.shape[0] * image.dimens.w);
      if (h >= image.dimens.h) {
        image.dimens.y = (image.dimens.h - h) / 2;
        image.dimens.h = h;
      } else {
        var w = Math.round(pixels.shape[0] / pixels.shape[1] * image.dimens.h);
        image.dimens.x = (image.dimens.w - w) / 2;
        image.dimens.w = w;
      }
      console.log("Image Data loaded for " + image.title);
      if (callback) callback();
    }
  });
}

function getDataURL(file, callback) {
  fs.readdir("./", (err, files) => {

  })
  base64.base64(file, (err, data) => {
    if (err) throw err;
    callback(data);
  });
}

function loadFonts(app) {
  for (var t in app.texts) {
    opentype.load('fonts/' + app.texts[t].font, function(err, font) {
      if (err) {
        alert('Could not load font: ' + err);
      } else {
        app.fonts[app.texts[t].font] = font;
      }
    });
  }
}

function loadProject(file, callback) {
  if (file.endsWith(".crv")) {
    fs.readFile(file, 'utf-8', (err, data) => {
      if (err) throw err;
      buildProject(JSON.parse(data));
      callback();
    });
  } else if (file.endsWith(".json")) {
    loadLayout(file, true, callback);
  } else if (file.endsWith(".jpg") || file.endsWith(".png") || file.endsWith(".gif")) {
    if (app.images.length > 0)
      getDataURL(file, (url) => {
        image.data = url;
        loadImage(app.images[app.images.length - 1], url, callback);
      });
  }
}

function buildProject(project) {
  app.pixels = [];
  for (var p in project) {
    app[p] = project[p];
  }
  for (var img of app.images)
    if (img.data) {
      loadImage(img, img.data);
    }
  initSVG();
}

function saveProject(file, callback) {
  var fileObj = {
    layers: app.layers,
    images: app.images,
    curves: app.curves,
    machine: app.machine,
    project: app.project,
    texts: app.texts,
    fonts: app.fonts,
    layouts: app.layouts
  }
  fs.writeFile(file, JSON.stringify(fileObj), callback);
}

function saveLayout(file, callback) {
  var fileObj = {
    layers: app.layers,
    images: app.images,
    curves: app.curves,
    machine: app.machine,
    texts: app.texts,
    fonts: app.fonts
  }
  var name = file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf('.'));
  var title = name.charAt(0).toUpperCase() + name.slice(1);
  fs.writeFile(file, JSON.stringify({
    title: title,
    template: fileObj
  }), callback);
}

function loadLayouts(app, callback) {
  fs.readdir(dir+"layouts/", (err, files) => {
    if (files) {
      for (var f in files) {
        loadLayout(dir+"layouts/" + files[f], false, callback);
      }
    }
  });
}

function loadLayout(file, custom, callback) {
  fs.readFile(file, (err, data) => {
    var layout = JSON.parse(data);
    layout.deleteable = custom;
    app.layouts.push(layout);
    if (layout.init || custom) {
      buildLayout(layout.template);
      callback();
    }
  });
}

function buildLayout(template) {
  app.selectedLayer = null;
  app.machine = buildProp(app.proto.machine, template.machine);
  app.layers = [];
  for (var l in template.layers) {
    if (template.layers[l].type)
      app.layers.push(buildProp(app.proto.form, template.layers[l]));
    else
      app.layers.push(buildProp(app.proto.layer, template.layers[l]));
  }
  app.images = [];
  if (template.images) {
    for (var i in template.images) {
      app.images.push(buildProp(app.proto.image, template.images[i]));
      if (!app.images[app.images.length - 1].data) {
        getDataURL(template.images[i].file, (url) => {
          app.images[app.images.length-1].data = url;
          loadImage(app.images[app.images.length - 1], url);
        });
      }
    }
  } else {
    app.images.push(buildProp(app.proto.image, null));
  }
  app.curves = [];
  if (template.curves) {
    for (var i in template.curves) {
      app.curves.push(buildProp(app.proto.curve, template.curves[i]));
    }
  } else {
    app.curves.push(buildProp(app.proto.curve, null));
  }
  for (var l of app.layers) {
    if (!l.render.curve && app.curves.length>0) l.render.curve = app.curves[0].id;
    if (!l.render.image && app.images.length>0) l.render.image = app.images[0].id;
  }
  initSVG();
}

function buildProp(proto, template) {
  if (!template) {
    return JSON.parse(JSON.stringify(proto));
  }
  var obj = {};
  for (var p in proto) {
    if (template[p]) {
      if (typeof template[p] == "object")
        obj[p] = buildProp(proto[p], template[p]);
      else {
        obj[p] = template[p];
      }
    } else {
      obj[p] = JSON.parse(JSON.stringify(proto[p]));
      if (obj[p] && typeof obj[p] == "object" && "id" in obj[p]) {
        obj[p].id = getId();
      }
    }
  }
  return obj;
}

function saveGCode(file, callback) {

  for (var layer of app.layers) {
    var gcode = app.gcodes.find(el => el.id == layer.id)
    if (gcode) {
      fs.writeFile(file + "/" + layer.title.str+".gcode", gcode.data.gcode.join('\n'), (err) => {
        if (err) throw err;
      });
    }
  }
  var svg = $("#svg").clone()[0];
  svg.setAttribute("viewBox", "0 0 " + app.machine.dimens.w + " " + app.machine.dimens.h);
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.childNodes[1].attributes.removeNamedItem("transform");
  if (svg.childNodes[1].childNodes.length>2) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[2]);
  if (svg.childNodes[1].childNodes.length>3) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[3]);
  if (svg.childNodes[1].childNodes.length>4) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[4]);
  if (svg.childNodes[1].childNodes.length>5) svg.childNodes[1].removeChild(svg.childNodes[1].childNodes[5]);
  fs.writeFile(file + "/screenshot.svg", svg.outerHTML, (err) => {
    if (err) throw err;
  });

}
