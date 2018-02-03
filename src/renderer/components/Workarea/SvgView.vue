<template>
  <svg id="svg" height="100%" width="100%" @mousedown="drag = true" @mouseup="mouseUp" @mousemove="spanObject" @click="unselectObject" :class="[adding?'cursor-add':'']" v-zoomable>
    <defs>
      <radialGradient id="gradient">
        <stop offset="0.8" stop-color="white" stop-opacity="1" />
        <stop offset="1" stop-color="white" stop-opacity="0" />
      </radialGradient>
    </defs>
    <g id="svgProject" :transform="'translate('+p.x+' '+p.y+') scale('+p.zoom+')'">
      <g id="svgLayers" :style="{opacity: subLayersOpen ? 1 : 0.6}">
        <component v-for="layer in objects.layers" :key="layer.id" :is="layer.is+'X'" :ref="layer.id" :id="layer.id"></component>
      </g>
      <g id="svgImages" :style="{display: subLayersOpen ? 'none' : 'inherit'}">
        <ImageX v-for="image in objects.images" :key="image.id" :ref="image.id" :id="image.id"></ImageX>
      </g>
      <g id="svgCurves" :style="{display: subLayersOpen ? 'none' : 'inherit'}">
        <Curve v-for="curve in objects.curves" :key="curve.id" :ref="curve.id" :id="curve.id"></Curve>
      </g>
      <g id="svgTexts">
        <TextX v-for="text in objects.texts" :key="text.id" :ref="text.id" :id="text.id"></TextX>
      </g>
    </g>
  </svg>
</template>

<script>

  import CPart from "./Objects/CPart.vue"
  import Curve from "./Objects/Curve.vue"
  import ImageX from "./Objects/Image.vue"
  import Form from "./Objects/Form.vue"
  import TextX from "./Objects/Text.vue"

  export default {
    data: () => ({
      drag: false,
      objectId: null
    }),
    components: {
      cpartX: CPart,
      formX: Form,
      Curve, ImageX, TextX
    },
    computed: {
      objects() {
        return this.$store.getters.getObjectsByType
      },
      p() {
        return this.$store.state.project
      },
      subLayersOpen() {
        return this.$store.state.subLayersOpen
      },
      adding() {
        return this.$store.state.selectedTool != "select"
      }
    },
    methods: {
      unselectObject() {
        this.$store.commit("selectObject", null);
      },
      mouseUp(event) {
        if (this.adding) {
          debugger;
          if (this.objectId) {
            this.$store.commit("putObject", {id: this.objectId})
          } else {
            this.objectId = this.addObject(event, {x: -20, y: -20, w: 40, h: 40})
          }
          this.$store.commit("selectObject", this.objectId)
          this.$store.commit("selectTool", "select")
        }

        this.drag = false;
        this.dragData = null;
        this.objectId = null;
      },
      spanObject(event) {
        if (!this.drag || !this.adding) return
        if (!this.objectId) {
          this.objectId = this.addObject(event, {x: 0, y: 0, w: 1, h: 1});
        }

        let object = this.$store.getters.getObjectById(this.objectId)

        if (!this.dragData) {
          this.dragData = this.$store.getters.getLocalPosition(event)
          this.dragData.pro = object.w/object.h
          this.dragData.mode = "exey"
        }

        let p = this.$store.getters.getLocalPosition(event)

        p = rotate(p, object, false);

        let start = {x: object.x, y: object.y};
        let end = {x: object.x+object.w, y: object.y+object.h};

        if (this.dragData.mode.includes("sy")) start.y = p.y;
        if (this.dragData.mode.includes("ex")) end.x = p.x;
        if (this.dragData.mode.includes("ey")) end.y = p.y;
        if (this.dragData.mode.includes("sx")) start.x = p.x;

        if (event.shiftKey && (this.dragData.mode.length == 4)) {
          let h = (end.x-start.x)/data.pro;
          if (this.dragData.mode.includes("sy")) {
            start.y = end.y - h;
          } else {
            end.y = start.y + h
          }
        }

        start = rotate(start, object, true);
        end = rotate(end, object, true);
        let mid = {x: (start.x+end.x)/2, y: (start.y+end.y)/2};
        start = rotate(start, object, false, mid);
        end = rotate(end, object, false, mid);

        let o = {
          id: object.id,
          x: start.x, y: start.y,
          w: end.x-start.x,
          h: end.y-start.y
        }

        if (o.w < 0) {
          o.x += o.w;
          o.w *= -1;
          this.dragData.mode = this.dragData.mode.replace(/sx/g, "tx").replace(/ex/g, "sx").replace(/tx/g, "ex");
        }
        if (o.h < 0) {
          o.y += o.h;
          o.h *= -1;
          this.dragData.mode = this.dragData.mode.replace(/sy/g, "ty").replace(/ey/g, "sy").replace(/ty/g, "ey");
        }

        this.$store.commit("resizeObject", o)
      },
      addObject(event, {x, y, w, h}) {
        if (!this.adding) return;
        let p = this.$store.getters.getLocalPosition({x: event.x, y: event.y})
        let o = this.$store.getters.getNewObjectByType(this.$store.state.selectedTool, {x: x + p.x, y: y + p.y, w, h});
        this.$store.commit("addObject", o)
        return o.id
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
 transition: transform 1s;
}

line {
  stroke: #008dea;
}

circle {
  fill: #008dea;
}

.cursor-add {
  cursor: cell;
}

</style>
