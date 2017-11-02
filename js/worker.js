
var startWorkers = _.debounce(function(start) {
  start();
}, 1500);

function createWorker(layer) {

  var i = app.layers.indexOf(layer);
  var image = app.images.find(el=>el.$.id==layer.$.render.image);
  var curve = app.curves.find(el=>el.$.id==layer.$.render.curve);
  var forms = app.layers.filter((el, id)=>id>i && el instanceof Form);

  if (!curve || !image || !layer) {
    return;
  }

  var workers = {
    count: 0,
    paths: []
  };

  var finishWorkers = function() {
    workers.count--;
    workers.paths = workers.paths.concat(event.data.paths);

    if (workers.count==0) {
      layer.svgObject[1].clear();
      layer.svgObject[1].attr({
        fill: layer.$.inverted ? "#fff":"#000"
      });
      for (var p in workers.paths)
        layer.svgObject[1].path(workers.paths[p]);
      app.project.progress = [];
    }
  }

  workers.count++;
  runWorker(finishWorkers, layer, forms, image, curve);

  console.log("Start "+(forms.filter(el=>el.$.mask&&el.$.ownRenderer).length+1)+" Workers for one Layer");

  for (var f in forms) {
    if (forms[f].$.mask && forms[f].$.ownRenderer) {
      var subforms = forms.filter((el, i)=>i>f);
      var subimage = app.images.find(el=>el.$.id==forms[f].$.render.image);
      var subcurve = app.curves.find(el=>el.$.id==forms[f].$.render.curve);
      if (subcurve && subimage) {
        workers.count++;
        runWorker(finishWorkers, forms[f], subforms, subimage, subcurve);
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
      if (event.data.progress<0) {
        progress.p = 100;
        finishWorkers();
      } else {
        progress.p = event.data.progress;
      }
    } else {
      worker.terminate();
      progress.p = 100;
      finishWorkers();
      console.log("Finished Rendering, took "+(Date.now()-startmillis)+"ms");
      if (layer.fill) {
        layer.$.render.lines.l = event.data.lines.l;
        layer.$.render.lines.r = event.data.lines.r;
        layer.fill = false;
      }
      layer.gcode = event.data.gcode;
    }
  }, false);
  startmillis = Date.now();
  worker.postMessage({layer: layer.toObj(), forms: forms.map(e => e.toObj()), image: image.toObj(true), curve: curve.toObj(), machine: app.machine.toObj(), gcode: store.get('gcode')});
}

function workerFunc(filterFunc) {
  startWorkers(function() {
    var layers = app.layers.filter((el, i) => (el instanceof CPart || (el instanceof Form && el.$.ownRenderer)) && filterFunc(el, i));
    console.log("Start workers for "+layers.length+" Layers");
    for (var l of layers) {
      createWorker(l);
    }
  });
}
