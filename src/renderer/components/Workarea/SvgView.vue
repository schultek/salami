<template>
  <svg id="svg" height="100%" width="100%" @mousedown="drag = true" @mouseup="drag = false" @mousemove="spanObject" @click="setObject" v-zoomable>
    <g id="svgProject" :transform="'translate('+p.x+' '+p.y+') scale('+p.zoom+')'">
      <Machine></Machine>
      <g id="svgLayers" :style="{opacity: subLayersOpen ? 1 : 0.6}">
        <component v-for="layer in objects.layers" :key="layer.id" :is="layer.is+'X'" :ref="layer.id" :id="layer.id"></component>
      </g>
      <g id="svgImages" :style="{display: subLayersOpen ? 'none' : 'inherit'}">
        <ImageX v-for="image in objects.images" :key="image.id" :ref="image.id" :id="image.id"></ImageX>
      </g>
      <g id="svgCurves">
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
  import Machine from "./Objects/Machine.vue"
  import TextX from "./Objects/Text.vue"

  export default {
    data: () => ({
      drag: false
    }),
    components: {
      cpartX: CPart,
      formX: Form,
      Curve, ImageX, Machine, TextX
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
      }
    },
    methods: {
      spanObject(event) {
        if (!this.drag) return
        this.addObject(event, {x: 0, y: 0, w: 1, h: 1});
      },
      setObject(event) {
        this.addObject(event, {x: -20, y: -20, w: 40, h: 40})
      },
      addObject(event, {x, y, w, h}) {
        let tool = this.$store.state.selectedTool;
        if (tool == 'select') return;
        let p = this.$store.getters.getLocalPosition({x: event.x, y: event.y})
        let o = this.$store.getters.getNewObjectByType(type, {x: x + p.x, y: y + p.y, w, h});
        this.$store.commit("addObject", o)
      }
    }
  }

</script>

<style>

line {
  stroke: #008dea;
}

circle {
  fill: #008dea;
}

</style>
