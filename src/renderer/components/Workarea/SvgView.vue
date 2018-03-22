<template>
  <svg id="svg" height="100%" width="100%" @mousedown.capture="mouseDown" @mouseup="mouseUp" :class="[adding?'cursor-add':'']" v-zoomable>
    <defs>
      <radialGradient id="gradient">
        <stop offset="0.8" stop-color="white" stop-opacity="1" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
    </defs>
    <g id="svgProject" :transform="'translate('+p.x+' '+p.y+') scale('+p.zoom+')'">
      <g id="svgLayers" :style="{opacity: subLayersOpen ? 1 : 0.6}">
        <component v-for="layer in layers" :key="layer.id" :is="compType(layer)+'X'" :ref="layer.id" :id="layer.id"></component>
      </g>
      <g id="svgImages" :style="{display: subLayersOpen ? 'none' : 'inherit'}">
        <imageX v-for="image in images" :key="image.id" :ref="image.id" :id="image.id"></imageX>
      </g>
      <g id="svgRenderer" :style="{display: subLayersOpen ? 'none' : 'inherit'}">
        <rendererX v-for="renderer in renderer" :key="renderer.id" :ref="renderer.id" :id="renderer.id" :type="rendererType(renderer)"></rendererX>
      </g>
      <g id="svgTexts" :style="{display: subLayersOpen && !fullPreview ? 'none' : 'inherit'}">
        <textX v-for="text in texts" :key="text.id" :ref="text.id" :id="text.id"></textX>
      </g>
      <Preview v-if="object" v-model="object" :mouse="mouse" :mode="objectMode"></Preview>
    </g>
  </svg>
</template>

<script>

  import CPart from "./Objects/CPart.vue"
  import Renderer from "./Objects/Renderer.vue"
  import Image from "./Objects/Image.vue"
  import Form from "./Objects/Form.vue"
  import Text from "./Objects/Text.vue"

  import Preview from "./Preview.vue"

  import {CPart as CPartObject, HalftoneRenderer, StippleRenderer, Image as ImageObject, Text as TextObject, Form as FormObject} from "@/models.js"

  export default {
    data: () => ({
      drag: false,
      objectMode: null,
      object: null,
      mouse: null
    }),
    components: {
      cpartX: CPart,
      formX: Form,
      rendererX: Renderer,
      imageX: Image,
      textX: Text,
      Preview
    },
    computed: {
      layers()   { return this.$store.state.layers   },
      images()   { return this.$store.state.images   },
      renderer() { return this.$store.state.renderer },
      texts()    { return this.$store.state.texts    },
      p() {
        return this.$store.state.project
      },
      subLayersOpen() {
        return this.$store.state.subLayersOpen
      },
      adding() {
        return this.$store.state.selectedTool != "select"
      },
      fullPreview() {
        return this.$store.state.fullPreview
      }
    },
    methods: {
      rendererType(renderer) {
        return renderer instanceof HalftoneRenderer ? "halftone" : renderer instanceof StippleRenderer ? "stipple" : ""
      },
      compType(layer) {
        return layer instanceof CPartObject ? "cpart" : "form"
      },
      mouseUp(event) {
        if (this.adding) {
          if (this.object instanceof StippleRenderer) {
            this.object.hotspots[0].x = this.object.x;
            this.object.hotspots[0].y = this.object.y;
            delete this.object.x;
            delete this.object.y;
          }
          if (this.object instanceof ImageObject || this.object instanceof CPartObject || this.object instanceof FormObject) {
            if (this.object.w == 1 && this.object.h == 1) {
              this.object.x -= 20;
              this.object.y -= 20;
              this.object.w = this.object.h = 40;
            }
          }
          if (this.object instanceof ImageObject) {
            this.object.data = this.$store.state.default.data;
          }
          this.$store.commit("addObject", this.object);
          this.$store.commit("selectObject", this.object.id);
          this.$store.commit("selectTool", "select");
          this.object = null;

        } else if (event.target == this.$el) {
          this.$store.commit("selectObject", null)
        }
      },
      mouseDown(event) {
        if (!this.adding || this.object) return
        this.createObject(event, {x: 0, y: 0, w: 1, h: 1});
        event.stopPropagation();
      },
      createObject(event, {x, y, w, h}) {
        if (!this.adding) return;
        let p = this.$store.getters.getLocalPosition({x: event.x, y: event.y})
        this.object = this.$store.getters.getNewObjectByType(this.$store.state.selectedTool, {x: x + p.x, y: y + p.y, w, h});
        this.objectMode = ["halftone", "stipple"].indexOf(this.$store.state.selectedTool) >= 0 ? "point" : this.$store.state.selectedTool == 'ellipse' ? 'ellipse' : "rect";
        this.mouse = {x: event.x, y: event.y}
      }
    }
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


</script>

<style>

.fade-zoom #svgProject {
 transition: transform .8s;
}

line {
  stroke: #008dea;
}

circle {
  fill: #008dea;
}

.fill {
  fill: #008dea;
  stroke: none;
}

.stroked {
  fill: none;
  stroke: #008dea;
}

.cursor-add {
  cursor: cell;
}

</style>
