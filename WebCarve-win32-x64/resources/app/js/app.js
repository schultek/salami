var getPixels = require("get-pixels");

var app = new Vue({
  el: "#app",
  data: data,
  mounted: function() { $("#overlay").fadeOut(1000); },
  created: function() {
    this.selectedTool = this.tools.select;
    var $this = this;
    getDataURL(dir+"img/imgbuf.png", (url) => {
      $this.bufferURL = url;
    });
    loadLayouts(this, () => {
      this.centerProject();
    });
    loadFonts(this);
    initConnection(this);
  },
  computed: {
    cursor: function() {
      return this.project.workers>0?"wait":this.selectedTool==this.tools.select?this.selectedTool.mode=="move"?"move":this.selectedTool.mode=="zoom"?"zoom-in":"auto":"cell";
    },
    progress: function() {
      var sum = 0;
      for (var p in this.project.progress)
        sum += this.project.progress[p];
      return this.project.progress.length ? sum / this.project.progress.length : 0;
    }
  },
  methods: {
    loadProject: function() {
      dialog.showOpenDialog({filters: [{name: "Carve", extensions: ['crv']}, {name: "Image", extensions: ['jpg', 'png', 'gif']}, {name: "Layout", extensions: ['json']}]}, files => {
        if (files && files[0])
          loadProject(files[0], err => {
            if (err) throw err;
            app.centerProject();
            console.log("Project loaded from "+files[0]);
            app.project.name = files[0].slice(files[0].lastIndexOf("/")+1);
          });
        else console.log("No File selected");
      })
    },
    saveProject: function() {
      dialog.showSaveDialog({filters: [{name: 'Carve', extensions: ['crv']}]}, file => {
        if (file)
          saveProject(file, (err) => {
            if (err) throw err;
            console.log("Project saved to "+file);
            app.project.name = file.slice(file.lastIndexOf("/")+1);
          });
      });
    },
    saveLayout: function() {
      dialog.showSaveDialog({filters: [{name: "Template", extensions: ["json"]}]}, file => {
        if (file) {
          saveLayout(file, (err) => {
            if (err) throw err;
            console.log("Layout saved to "+file);
          });
        }
      });
    },
    saveGCode: function() {
      dialog.showOpenDialog({properties: ['openDirectory', 'createDirectory']}, files => {
        if (files && files[0]) {
          app.selectedLayer = null;
          app.fullPreview = true;
          app.sublayers_open = true;
          setTimeout(() => {
            saveGCode(files[0], (err) => {
              if (err) throw err;
              console.log("GCode saved to "+files[0]);
            });
          }, 200);
        }
      });
    },
    centerProject: function() {
      this.project.zoom = $("#workarea").width()/this.machine.dimens.w*0.9;
      this.project.xPos = $("#workarea").width()/2-this.machine.dimens.w*this.project.zoom/2;
      this.project.yPos = $("#workarea").height()/2-this.machine.dimens.h*this.project.zoom/2;
    },
    layerType: function(l) { //0: Part | 1: Machine | 2: Image | 3: Form | 4: Curve | 5: Text | 6: Layout
      return l==null?-1:l.bit!==undefined?1:l.border!==undefined?0:l.mask!==undefined?3:l.stretch!==undefined?4:l.text!==undefined?5:l.template!==undefined?6:2;
    },
    getLayerIcon: function(layer) {
      return layer.type!==undefined?layer.type=='rect'?'square-o':'circle-o':'th-large';
    },
    removeLayer: function(layer) {
      var rm = function(arr) { arr.splice(arr.indexOf(layer), 1); }
      rm.call(this, this.layerType(layer)==2?this.images:this.layerType(layer)==4?this.curves:this.layerType(layer)==5?this.texts:this.layerType(layer)==6?this.layouts:this.layers);
      if (layer == this.selectedLayer) {
        this.selectedLayer = null;
      }
      initSVG.call(this);
    },
    removeSelectedLayer: function() {
      this.removeLayer(this.selectedLayer);
    },
    prepareLinking(prop) {
      this.linking.layer = this.selectedLayer;
      this.linking.prop=prop;
    },
    linkTo: function(layer) {
      this.linking.layer[this.linking.prop] = layer[this.linking.prop];
      this.linking.layer.links[this.linking.prop] = layer.title;
      layer.links[this.linking.prop] = this.linking.layer.title;
      this.linking.layer = null;
      this.linking.prop = null;
    },
    unlink: function(prop) {
      var newobj = JSON.parse(JSON.stringify(this.selectedLayer[prop]));
      this.selectedLayer[prop] = newobj;
      this.layers.find(el=>el.title==this.selectedLayer.links[prop]).links[prop]=undefined;
      this.selectedLayer.links[prop]=undefined;
    },
    handleTool: handleTool,
    mouseMove: mouseMove,
    mouseUp: mouseUp,
    liftItem: function(event, layer) {
      var elem = $(event.srcElement).parent().parent();
      elem.css("top", elem.position().top).css("left", elem.position().left).css("width", elem.width()).addClass("moving");
      this.mouse = {y: elem.position().top-event.y, mode: "layer", elem: elem, layer: layer};
      $("body").append("<div id='move-line'>");
      $("#move-line").css("left", elem.position().left);
      this["linePositions"] = [];
      var pos = $(".layer-item:first-child").position().top;
      var h = 25;
      for (layer in this.layers) {
        this.linePositions.push(pos);
        pos += h;
      }
      this.moveLine(elem.position().top+h/2);
    },
    moveItem: function(event) {
      this.mouse.elem.css("top", this.mouse.y+event.y);
      this.moveLine(this.mouse.y+event.y+25/2);
    },
    placeItem: function(event) {
      var i = this.moveLine(this.mouse.y+event.y+25/2);
      this.layers.splice(this.layers.indexOf(this.mouse.layer), 1);
      this.layers.splice(i, 0, this.mouse.layer);
      this.mouse.elem.css("top", 0).css("left", 0).css("width", "auto").removeClass("moving");
      this.mouse.mode = null;
      $("#move-line").remove();
      initSVG.call(this);
    },
    moveLine(y) {
      var min = -1;
      var minI = 0;
      for (i in this.linePositions) {
        var d = Math.abs(y-this.linePositions[i]);
        if (min < 0 || d < min) {
          min = d;
          minI = i;
        }
      }
      $("#move-line").css("top", this.linePositions[minI]);
      return minI;
    },
    loadImage: function() {
      var layer = this.selectedLayer;
      dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]}, (files) => {
        if (files && files[0]) {
          getDataURL(files[0], (url) => {
            layer.data = url;
            loadImage(layer, url);
          });
        }
      });
    },
    mapRotation: function(prop, obj) {
      while (obj[prop]<0) obj[prop]+=360;
      while (obj[prop]>=360) obj[prop]-=360;
    },
    adjustMachine: function() {
      var min = {}, max = {};
      for (var l in this.layers) {
        if (min.x==undefined || this.layers[l].dimens.x < min.x) {
          min.x = this.layers[l].dimens.x;
        }
        if (min.y==undefined || this.layers[l].dimens.y < min.y) {
          min.y = this.layers[l].dimens.y;
        }
        if (max.x==undefined || this.layers[l].dimens.x+this.layers[l].dimens.w > max.x) {
          max.x = this.layers[l].dimens.x+this.layers[l].dimens.w;
        }
        if (max.y==undefined || this.layers[l].dimens.y+this.layers[l].dimens.h > max.y) {
          max.y = this.layers[l].dimens.y+this.layers[l].dimens.h;
        }
      }
      if (this.layers.length > 0) {
        this.machine.dimens.x = min.x;
        this.machine.dimens.y = min.y;
        this.machine.dimens.w = max.x-min.x;
        this.machine.dimens.h = max.y-min.y;
      }
    },
    asTimeString: function(min) {
      var h = Math.floor(min/60);
      var m = Math.round(min - h*60);
      return (h>0?h+"h ":"")+m+"m";
    },
    handleZoom: function(event) {
      if (event.ctrlKey) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var p = localPos(event.x, event.y);
        this.project.zoom -= event.deltaY/20;
        if (this.project.zoom < 0.1) this.project.zoom = 0.1;
        if (this.project.zoom > 20) this.project.zoom = 20;
        this.project.xPos = event.x-(p.x*this.project.zoom)-$("#svg").position().left;
        this.project.yPos = event.y-(p.y*this.project.zoom)-$("#svg").position().top;
      } else {
        this.project.xPos -= event.deltaX/2;
        this.project.yPos -= event.deltaY/2;
      }
    },
    joinProject: function() {
      joinProject(this.live.id);
    }
  }
});

function handleShortcuts(event) {
  if (event.ctrlKey) {
    switch (event.key) {
      case "1": case "s": app.selectedTool = app.tools.select; break;
      case "2": case "i": app.selectedTool = app.tools.image; break;
      case "3": case "p": app.selectedTool = app.tools.part; break;
      case "4": case "c": app.selectedTool = app.tools.curve; break;
      case "5": case "r": app.selectedTool = app.tools.rect; break;
      case "6": case "e": app.selectedTool = app.tools.ellipse; break;
    }
  }
  if (event.key == "Backspace" && app.selectedLayer && event.target.nodeName != "INPUT") {
    console.log(event);
    app.removeSelectedLayer();
  }
  handleToolKey(event);
}

function handleToolKey(event) {
  if (event.ctrlKey || event.altKey) {
    app.tools.select.mode = app.tools.select.mode == "select" ? event.ctrlKey ? "zoom" : event.altKey ? "move" : "select" : app.tools.select.mode;
  } else {
    app.tools.select.mode = "select";
  }


}
