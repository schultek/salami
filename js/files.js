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
      app.pixels[image.$.id] = pixels;
      var h = Math.round(pixels.shape[1] / pixels.shape[0] * image.$.w);
      if (h >= image.$.h) {
        image.$.y = (image.$.h - h) / 2;
        image.$.h = h;
      } else {
        var w = Math.round(pixels.shape[0] / pixels.shape[1] * image.$.h);
        image.$.x = (image.$.w - w) / 2;
        image.$.w = w;
      }
      console.log("Image Data loaded for " + image.$.title);
      if (callback) callback();
    }
  });
}

function getDataURL(file, callback) {
  base64.base64(file, (err, data) => {
    if (err) throw err;
    callback(data);
  });
}

function loadFonts(app) {
  for (var t in app.texts) {
    opentype.load('fonts/' + app.texts[t].$.font, function(err, font) {
      if (err) {
        alert('Could not load font: ' + err);
      } else {
        app.fonts[app.texts[t].$.font] = font;
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
    if (app.images.length > 0) {
      let img = app.images[app.images.length - 1];
      img.$.url = file;
      getDataURL(file, (data) => {
        img.$.data = data;
        loadImage(img, data, callback);
      });
    }
  }
}

function buildProject(project) {
  app.layers = []; app.images = []; app.curves = []; app.texts = []; app.fonts = []; app.layouts = [];
  project.layers.forEach(e => Layer.fromObj(e));
  project.images.forEach(e => Image.fromObj(e));
  project.curves.forEach(e => Curve.fromObj(e));
  app.machine = Machine.fromObj(project.machine);
  app.project = project.project;
  project.texts.forEach(e => Text.fromObj(e));
  project.fonts.forEach(e => Font.fromObj(e));
  project.layouts.forEach(e => Layout.fromObj(e));
}

function saveProject(file, callback) {
  var fileObj = {
    layers: app.layers.map(e => e.toObj()),
    images: app.images.map(e => e.toObj()),
    curves: app.curves.map(e => e.toObj()),
    machine: app.machine.toObj(),
    project: app.project,
    texts: app.texts.map(e => e.toObj()),
    fonts: app.fonts,
    layouts: app.layouts.map(e => e.toObj())
  }
  fs.writeFile(file, JSON.stringify(fileObj), callback);
}

function saveLayout(file, callback) {
  var name = file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf('.'));
  var title = name.charAt(0).toUpperCase() + name.slice(1);
  fs.writeFile(file, JSON.stringify(Layout.createNew(title).toObj()), callback);
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
    let l = JSON.parse(data);
    var layout = Layout.fromObj(l);
    layout.deleteable = custom;
    if (l.init || custom) {
      layout.build();
      callback();
    }
  });
}

function saveGCode(file, callback) {

  for (var layer of app.layers) {
    var gcode = app.gcodes.find(el => el.id == layer.$.id);
    if (gcode) {
      fs.writeFile(file + "/" + layer.$.title+".gcode", gcode.data.gcode.join('\n'), (err) => {
        if (err) throw err;
      });
    }
  }
  var svg = $("#svg").clone()[0];
  svg.setAttribute("viewBox", "0 0 " + app.machine.$.w + " " + app.machine.$.h);
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
