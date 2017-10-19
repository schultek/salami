function handleTool(event) {
  if (this.selectedTool!=null) {
    var e = event.target;
    while ($(e).attr("type")===undefined&&e!==undefined) {
      e = $(e).parent().get(0);
      if ($(e).attr("id")=="workarea") {
        e = null; break;
      }
    }
    if ($(e).attr("type")=="resize") {
      this.lastTool = this.selectedTool;
      this.selectedTool = this.tools.select;
    }
    if ($(e).attr("type")=="zoom") {
      var e = {x: $("#workarea").position().left+$("#workarea").width()/2,y: $("#workarea").position().top+$("#workarea").height()/2 };
      var p = localPos(e.x, e.y);
      this.mouse = {x: p.x, y: p.y, ex: e.x, ey: e.y, type: "zoom", mode: "tool"};
    } else if ($(e).attr("type")=="action") {
      //wait
    } else if (this.selectedTool == this.tools.select && this.selectedTool.mode == "move") {
      this.mouse = {x: this.project.xPos-event.x, y: this.project.yPos-event.y, mode: "tool"};
    } else if (this.selectedTool == this.tools.select && this.selectedTool.mode == "zoom") {
      var p = localPos(event.x, event.y);
      this.mouse = {x: p.x, y: p.y, ex: event.x, ey: event.y, zoom: this.project.zoom*100-event.y, mode: "tool"};
    } else if (this.selectedTool == this.tools.select && this.selectedTool.mode == "select") {
      if ($(e).attr("type")=="resize") {
        this.mouse.resize = $(e).attr("num");
      } else {
        this.mouse.resize = "0";
        this.selectedLayer = null;
        if (this.svg.workarea.node == e) {
          this.selectedLayer = this.machine;
        } else {
            for (var l in this.svg.layers) {
              if (this.svg.layers[l].node == e) {
                this.selectedLayer = this.layers[this.layers.length-1-l];
                break;
              }
            }
          if (!this.selectedLayer) {
            for (var i in this.images) {
              if (this.svg.images[i].node == e) {
                this.selectedLayer = this.images[i];
                if (!this.selectedLayer.data) {
                  this.loadImage();
                }
                break;
              }
            }
          }
          if (!this.selectedLayer) {
            for (var c in this.curves) {
              if (this.svg.curves[c][1].node == e) {
                this.selectedLayer = this.curves[c];
                break;
              }
            }
          }
          if (!this.selectedLayer) {
            for (var t in this.texts) {
              if (this.svg.texts[t].node == e) {
                this.selectedLayer = this.texts[t];
                break;
              }
            }
          }
        }
      }
      if (this.selectedLayer!=null) {
        var p = localPos(event.x, event.y);
        this.mouse.x = this.selectedLayer.dimens.x - p.x;
        this.mouse.y = this.selectedLayer.dimens.y - p.y;
        if (this.layerType(this.selectedLayer) != 4) {
          this.mouse.pro = this.selectedLayer.dimens.w/this.selectedLayer.dimens.h;
        }
        this.mouse.mode="tool";
      }
    } else if (this.selectedTool == this.tools.image) {
      this.sublayers_open = false;
      var p = localPos(event.x, event.y);
      this.images.push({
        title: "Image "+(this.images.length+1),
        id: getId(),
        dimens: {w: 0, h: 0, x: p.x, y: p.y, rot: 0}
      });
      this.selectedLayer = this.images[this.images.length-1];
      this.mouse = p;
      this.mouse.mode="tool";
      initSVG.call(this);
    } else if (this.selectedTool == this.tools.part || this.selectedTool == this.tools.rect || this.selectedTool == this.tools.ellipse) {
      this.sublayers_open = true;
      var p = localPos(event.x, event.y);
      this.layers.unshift(
        this.selectedTool==this.tools.part ?
        {
          title: "Part "+(this.layers.length+1),
          id: getId(),
          dimens: {w: 0, h: 0, x: p.x, y: p.y, rot: 0},
          border: {left: 5, right: 5, top: 5, bottom: 5},
          render: {
            curve: this.curves[0].id,
            image: this.images[0].id,
            lines: {l: 10, r: 10, fill: false},
            inverted: false,
            dotted: false,
            refinedEdges: 100,
            smooth: 50
          },
          links: {}
        }:{
          title: "Form "+(this.layers.length+1),
          id: getId(),
          type: this.selectedTool==this.tools.rect?"rect":"ellipse",
          dimens: {w: 0, h: 0, x: p.x, y: p.y, rot: 0},
          mask: false,
          ownRenderer: false,
          render: {
            curve: this.curves[0].id,
            image: this.images[0].id,
            lines: {
              l: 200,
              r: 200,
              fill: false
            },
            dotted: false,
            refinedEdges: 100,
            smooth: 50
          }
        }
      );
      this.selectedLayer = this.layers[0];
      this.mouse = p;
      this.mouse.mode="tool"
      initSVG.call(this);
    } else if (this.selectedTool == this.tools.curve) {
      this.sublayers_open = false;
      var p = localPos(event.x, event.y);
      this.curves.push(
        {
          title: "Curve "+(this.curves.length+1),
          id: getId(),
          type: "Linie",
          dimens: {x: p.x, y: p.y},
          direction: 0,
          stretch: 0,
          gap: 1.5,
          steps: 100
        }
      );
      this.selectedLayer = this.curves[this.curves.length-1];
      this.selectedTool = this.tools.select;
      this.mouse.mode="tool";
      this.mouse.x = this.selectedLayer.dimens.x - p.x;
      this.mouse.y = this.selectedLayer.dimens.y - p.y;
      initSVG.call(this);
    } else if (this.selectedTool == this.tools.text) {
      this.sublayers_open = false;
      var p = localPos(event.x, event.y);
      this.texts.push({
        text: "Text",
        id: getId(),
        dimens: {
          x: p.x,
          y: p.y,
          w: 0,
          h: 0
        },
        size: 12,
        font: "BalooBhaijaan-Regular.ttf"
      });
      this.selectedLayer = this.texts[this.texts.length-1];
      this.selectedTool = this.tools.select;
      initSVG.call(this);
    }
  }
}

function mouseMove(event) {
  if (this.mouse && this.mouse.mode=="layer") {
    this.moveItem(event);
  }
  if (this.selectedTool != null && this.mouse.mode == "tool") {
    if (this.selectedTool == this.tools.select && this.mouse.type == "zoom") {
      var z = (event.y-$("#workarea").position().top-parseInt($("#corner-zoom-bar").css("margin-top")))/$("#corner-zoom-bar").height()*100/22.36;
      this.project.zoom = z>0?z*z:0;
      if (this.project.zoom < 0.1) this.project.zoom = 0.1;
      if (this.project.zoom > 20) this.project.zoom = 20;
      this.project.xPos = this.mouse.ex-(this.mouse.x*this.project.zoom)-$("#svg").position().left;
      this.project.yPos = this.mouse.ey-(this.mouse.y*this.project.zoom)-$("#svg").position().top;
    } else if (this.selectedTool == this.tools.select && this.selectedTool.mode == "select") {
      var p = localPos(event.x, event.y);
      p.x = Math.round(p.x*10)/10;
      p.y = Math.round(p.y*10)/10;
      if (this.mouse.resize == "0" && this.selectedLayer != this.machine) {
        this.selectedLayer.dimens.x = this.mouse.x+p.x;
        this.selectedLayer.dimens.y = this.mouse.y+p.y;
      }
      if (this.layerType(this.selectedLayer) != 4) {
        if (this.mouse.resize == "1" || this.mouse.resize == "2" || this.mouse.resize == "3") {
          var bottom = this.selectedLayer.dimens.y+this.selectedLayer.dimens.h;
          this.selectedLayer.dimens.h = this.selectedLayer.dimens.h-p.y+this.selectedLayer.dimens.y<=0?0:this.selectedLayer.dimens.h-p.y+this.selectedLayer.dimens.y;
          this.selectedLayer.dimens.y = p.y;
        }
        if (this.mouse.resize == "3" || this.mouse.resize == "4" || this.mouse.resize == "5") {
          this.selectedLayer.dimens.w = p.x-this.selectedLayer.dimens.x<=0?0:p.x-this.selectedLayer.dimens.x;
        }
        if (this.mouse.resize == "5" || this.mouse.resize == "6" || this.mouse.resize == "7") {
          this.selectedLayer.dimens.h = p.y-this.selectedLayer.dimens.y<=0?0:p.y-this.selectedLayer.dimens.y;
        }
        if (this.mouse.resize == "7" || this.mouse.resize == "8" || this.mouse.resize == "1") {
          this.selectedLayer.dimens.w = this.selectedLayer.dimens.w-p.x+this.selectedLayer.dimens.x<=0?0:this.selectedLayer.dimens.w-p.x+this.selectedLayer.dimens.x;
          this.selectedLayer.dimens.x = p.x;
        }
        if (event.shiftKey && (this.mouse.resize == "1" || this.mouse.resize == "3" || this.mouse.resize == "5" || this.mouse.resize == "7")) {
          this.selectedLayer.dimens.h = this.selectedLayer.dimens.w/this.mouse.pro;
          if (this.mouse.resize == "1" || this.mouse.resize == "3") {
            this.selectedLayer.dimens.y = bottom - this.selectedLayer.dimens.w/this.mouse.pro;
          }
        }
      }
    } else if (this.selectedTool == this.tools.select && this.selectedTool.mode == "move") {
      this.project.xPos = this.mouse.x+event.x;
      this.project.yPos = this.mouse.y+event.y;
    } else if (this.selectedTool == this.tools.select && this.selectedTool.mode == "zoom") {
      this.project.zoom = (this.mouse.zoom+event.y)/100;
      if (this.project.zoom < 0.1) this.project.zoom = 0.1;
      if (this.project.zoom > 20) this.project.zoom = 20;
      this.project.xPos = this.mouse.ex-(this.mouse.x*this.project.zoom)-$("#svg").position().left;
      this.project.yPos = this.mouse.ey-(this.mouse.y*this.project.zoom)-$("#svg").position().top;

    } else if (this.selectedTool == this.tools.image || this.selectedTool == this.tools.part || this.selectedTool == this.tools.rect || this.selectedTool == this.tools.ellipse) {
      var p = localPos(event.x, event.y);
      this.selectedLayer.dimens.w = Math.round((p.x-this.mouse.x<=0?0:p.x-this.mouse.x)*10)/10;
      this.selectedLayer.dimens.h = Math.round((p.y-this.mouse.y<=0?0:p.y-this.mouse.y)*10)/10;
    }
  }
}

function mouseUp(event) {
  if (this.mouse && this.mouse.mode=="layer") {
    this.placeItem(event);
  }
  if (this.selectedTool != null && this.mouse.mode=="tool") {
    this.mouse.mode = null;
    this.mouse.resize = null;
    this.mouse.type = null;
    if (this.selectedTool == this.tools.image || this.selectedTool == this.tools.part || this.selectedTool == this.tools.rect || this.selectedTool == this.tools.ellipse) {
      this.selectedTool = this.tools.select;
    }
    if (this.project.autoAdjustMachine) {
      this.adjustMachine();
    }
    handleToolKey(event);
  }
}
