<template>
  <g :id="id" :transform="'translate('+x+' '+y+') rotate('+rot+' '+(object.w/2)+' '+(object.h/2)+')'" v-dragable>
    <rect x="0" y="0" :height="object.h" :width="object.w" fill="transparent"></rect>
    <path :transform="'translate('+offset.x+' '+offset.y+')'" :d="path" :stroke-width="object.stroke/2" class="text-path" :class="selected || fullPreview ? 'strong' : ''"></path>
    <SelectBox :id="id" can-rotate="true" can-resize="true" :proportion="proportion"></SelectBox>
  </g>
</template>

<script>

  import SelectBox from "./Parts/SelectBox.vue"

  export default {
    props: ["id"],
    components: {SelectBox},
    computed: {
      object() { return this.$store.getters.getObjectById(this.id); },
      offset() {
        return {
          x: this.object.border.left + this.object.stroke/4,
          y: this.object.h - this.object.border.bottom - this.object.stroke/4
        }
      },
      selected() {
        return this.$store.state.selectedObject == this.id
      },
      fullPreview() {
        return this.$store.state.fullPreview
      },
      x() { return this.object.x },
      y() { return this.object.y },
      rot() { return this.object.rot },
      zoom() { return this.$store.state.project.zoom },
      path() { return this.object.path }
    },
    methods: {
      proportion(w, h) {
        return w ? this.getH(w) : h ? this.getW(h) : null
      },
      getW(h) {
        let _h = h - this.object.getYBorder()
        return (this.object._w / this.object._h * _h) + this.object.getXBorder()
      },
      getH(w) {
        let _w = w - this.object.getXBorder()
        return (this.object._h / this.object._w * _w) + this.object.getYBorder()
      }
    }
  }

</script>

<style>

.text-path {
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: #505050;
  fill: none;
}

.text-path.strong {
  stroke: #000;
}

</style>
