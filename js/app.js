var getPixels = require("get-pixels");
var Store = require("electron-store");

var store = new Store({
  defaults: {
    madeTour: false,
    gcode: {
      pre: "G92 X0 Y0 Z0\nG21\nG90\nG1 Z5\nG1 X$W\nG1 Y$H\nG1 X0\nG1 Y0",
      post: "G1 Z2\nG0 X0 Y0"
    }
  }
})

var app;

new Vue({
  el: "#app",
  data: data,
  mounted: function() {
    $("#overlay").fadeOut(1000);
    if (!store.get('madeTour')) {
      startTour();
      store.set('madeTour', true);
    }
  },
  created: function() {
    app = this;
    this.selectedTool = this.tools.select;
    var $this = this;
    this.workerFunc = workerFunc;
    this.bufferURL = dir+"img/imgbuf.png";
    getDataURL(this.bufferURL, (data) => {
      this.bufferData = data;
      this.s = Snap("#svg");
      initSVG(this);
      loadLayouts(this, () => {
        this.centerProject();
        this.machine.createSVGWatcher(this.machine.watcherFunc);
      });
    });
    this.$watch(function() { return {l: this.layers, i: this.images, c: this.curves, m: this.machine} }, (arr) => {
      console.log("change");
      $this.project.saved = false;
    }, {deep: true});
    //initConnection(this);
  },
  computed: {
    cursor: function() {
      return this.project.workers>0?"wait":this.selectedTool?this.selectedTool==this.tools.select?this.selectedTool.data.mode=="move"?"move":this.selectedTool.data.mode=="zoom"?"zoom-in":"auto":"cell":"auto";
    },
    progress: function() {
      return this.project.progress.length ? this.project.progress.reduce((sum, el) => sum+el.p, 0) / this.project.progress.length : 100;
    }
  },
  watch: {
    selectedLayer: function(sl, oldSl) {
      if (sl instanceof Image) {
        setTimeout(() => tourEvent("image-selected"), 100);
      }
    },
    selectedTool: function(st) {
      if (st == this.tools.rect) {
        tourEvent("rect-selected");
      }
    }
  },
  methods: {
    is: function(o, c) {
      if (!o || !c) {
        return false;
      } else {
        return o instanceof c;
      }
    },
    showPreview: function() {
      this.fullPreview = true;
      this.selectedLayer = null;
      let $this = this;
      setTimeout(() => $this.centerProject(), 100);
    },
    loadProject: function() {
      dialog.showOpenDialog({filters: [{name: "Carve", extensions: ['crv']}, {name: "Image", extensions: ['jpg', 'png', 'gif']}, {name: "Layout", extensions: ['json']}]}, files => {
        if (files && files[0])
          loadProject(files[0], err => {
            if (err) throw err;
            app.centerProject();
            console.log("Project loaded from "+files[0]);
            app.project.name = files[0].substring(files[0].lastIndexOf("/")+1, files[0].lastIndexOf("."));
            app.project.file = files[0];
          });
        else console.log("No File selected");
      })
    },
    saveProject: function() {
      let save = (file) => {
        if (file)
          saveProject(file, (err) => {
            if (err) throw err;
            console.log("Project saved to "+file);
            app.project.file = file;
            app.project.name = file.substring(file.lastIndexOf("/")+1, file.lastIndexOf("."));
            app.project.saved = true;
          });
      };
      if (app.project.file) {
        save(app.project.file);
      } else {
        dialog.showSaveDialog({filters: [{name: 'Carve', extensions: ['crv']}]}, save);
      }
    },
    saveLayout: function() {
      dialog.showSaveDialog({filters: [{name: "Template", extensions: ["json"]}]}, file => {
        if (file) {
          var name = file.substring(file.lastIndexOf("/") + 1, file.lastIndexOf('.'));
          var title = name.charAt(0).toUpperCase() + name.slice(1);
          saveLayout(file, title, (err) => {
            if (err) throw err;
            console.log("Layout saved to "+file);
          });
        }
      });
    },
    addLayout: function() {
      let p = (i) => remote.app.getPath('userData')+"/layouts/"+this.project.name+i+".json";
      let i = "";
      while (this.layouts.find(l => l.url == p(i))) {
        i = i === "" ? 0 : i + 1;
      }
      saveLayout(p(i), this.project.name, (err) => {
        if (err) throw err;
        console.log("Layout saved to "+p);
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
      this.project.zoom = $("#workarea").width()/this.machine.$.w*0.9;
      this.project.xPos = $("#workarea").width()/2-(this.machine.$.x+this.machine.$.w/2)*this.project.zoom;
      this.project.yPos = $("#workarea").height()/2-(this.machine.$.y+this.machine.$.h/2)*this.project.zoom;
    },
    mouseDown: function(event) {
      if (!this.quickMode && this.selectedTool!=null) {
        var e = event.target;
        while ($(e).attr("type")===undefined&&e!==undefined) {
          e = $(e).parent().get(0);
          if ($(e).attr("id")=="workarea") {
            e = null; break;
          }
        }
        switch ($(e).attr("type")) {
          case "action": break;
          case "resize":
          case "zoom":
            this.lastTool = this.selectedTool;
            this.selectedTool = this.tools.select;
          default:
            this.selectedTool.mouseDown(event, e);
        }
      }
    },
    mouseMove: function(event) {
      if (this.selectedLayer && this.selectedTool) {
        this.selectedTool.mouseMove(event);
      }
    },
    mouseUp: function(event) {
      if (!this.quickMode && this.selectedTool) {
        this.selectedTool.mouseUp(event);
        if (this.lastTool) {
          this.selectedTool = this.lastTool;
        } else {
          this.selectedTool = this.tools.select;
        }
        if (this.project.autoAdjustMachine) {
          this.adjustMachine();
        }
        handleToolKey(event);
      }
    },
    liftItem: function(event, layer) {
      var elem = $(event.srcElement).parent().parent();
      this.lastTool = this.selectedTool;
      this.selectedTool = liftTool;
      liftTool.mouseDown(event, {elem, layer});
    },
    loadImage: function(l) {
      var layer = l || this.selectedLayer;
      dialog.showOpenDialog({filters: [{name: 'Images', extensions: ['jpg', 'png', 'gif']}]}, (files) => {
        if (files && files[0]) {
          layer.$.url = files[0];
          getDataURL(files[0], (data) => {
            layer.$.data = data;
            loadImage(layer, data, () => {
              tourEvent("image-loaded");
            });
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
      for (var layer of this.layers) {
        if (min.x===undefined || layer.$.x < min.x) {
          min.x = layer.$.x;
        }
        if (min.y===undefined || layer.$.y < min.y) {
          min.y = layer.$.y;
        }
        if (max.x===undefined || layer.$.x+layer.$.w > max.x) {
          max.x = layer.$.x+layer.$.w;
        }
        if (max.y===undefined || layer.$.y+layer.$.h > max.y) {
          max.y = layer.$.y+layer.$.h;
        }
      }
      if (this.layers.length > 0) {
        this.machine.$.x = min.x;
        this.machine.$.y = min.y;
        this.machine.$.w = max.x-this.machine.$.x;
        this.machine.$.h = max.y-this.machine.$.y;
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
    },
    loadLayout: function(layout) {
      layout.build();
      this.selectedLayout = layout;
      this.centerProject();
      this.machine.createSVGWatcher(this.machine.watcherFunc);
    },
    changeQuickMode: function() {
      this.quickMode = !this.quickMode;
      this.selectedTool = this.tools.select;
      this.selectedLayer = null;
      this.sublayers_open = this.quickMode ? true : false;
    }
  }
});

function editGcodeSnippet(id) {
  $("body").append("<div id='gcode-config'><p>Verwende '$W' für die Breite und '$H' für die Höhe der Arbeitsfläche.</p><textarea id='gcode-snippet'>"+store.get(id)+"</textarea><input type='button' value='Speichern' onclick='saveGcodeSnippet(\""+id+"\")'/></div>");
}

function saveGcodeSnippet(id) {
  store.set(id, document.getElementById("gcode-snippet").value);
  document.getElementById("gcode-config").remove();
  workerFunc(() => true);
}

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
    if (app.selectedLayer != app.machine) {
      app.selectedLayer.remove();
    }
  }
  handleToolKey(event);
}

function handleToolKey(event) {
  if (event.ctrlKey || event.altKey) {
    app.tools.select.data.mode = app.tools.select.data.mode == "select" ? event.ctrlKey ? "zoom" : event.altKey ? "move" : "select" : app.tools.select.data.mode;
  } else {
    app.tools.select.data.mode = "select";
  }
}
