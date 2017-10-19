var socket;

function initConnection(app) {
  socket = io("http://31.187.91.242:6789");
  var newdata = {
    machine: false, curves: false, images: false, layers: false
  }
  var update = (prop, data, rerender) => {
    if (newdata[prop]) newdata[prop] = false;
    else {
      var obj = {};
      obj[prop] = data;
      socket.emit('update-project', obj);
      app.rerender = false;
    }
  }
  var checkRerender = function(oldD, newD) {
    if (oldD.length != newD.length) return true;
    else {
      for (var d in newD) {
        if (oldD[d].id != newD[d].id) {
          return true;
        }
      }
      return false;
    }
  }
  app.$watch('machine', (data) => update("machine", data), {deep: true});
  app.$watch('curves', (data, old) => update("curves", data), {deep: true});
  app.$watch('images', (data, old) => update("images", data), {deep: true});
  app.$watch('layers', (data, old) => update("layers", data), {deep: true});
  socket.on('update-project', (data, init) => {
    var rerender = init;
    if (data.machine) { newdata.machine = true; app.machine = data.machine; }
    if (data.curves) {
      newdata.curves = true;
      rerender = checkRerender(app.curves, data.curves);
      app.curves = data.curves;
    }
    if (data.images) {
      newdata.images = true;
      for (var img of data.images) {
        var ai = app.images.find(el => el.$.id == img.$.id);
        if ((!ai && img.$.data) || (ai && ai.$.data != img.$.data)) {
          loadImage(img, img.$.data);
        }
      }
      rerender = checkRerender(app.images, data.images);
      app.images = data.images;
    }
    if (data.layers) {
      newdata.layers = true;
      rerender = checkRerender(app.layers, data.layers);
      app.layers = data.layers;
    }
    if (rerender) initSVG();
  });
}

function joinProject(id) {
  socket.emit('join-project', id, {machine: app.machine, curves: app.curves, images: app.images, layers: app.layers, render: true});
}
