<template>
  <g :id="id" :transform="'translate('+x+' '+y+')'" v-dragable>
    <rect x="0" y="0" :width="w" :height="h" :style="{fill: object.inverted?'#000':'#fff'}"></rect>
    <!-- <image v-if="img && voronoi" style="image-rendering: pixelated; opacity: .5" :x="img.x" :y="img.y" :width="img.w" :height="img.height" :xlink:href="voronoi" /> -->
    <path :d="path" v-for="path in paths" :style="{opacity: 1, fill: object.inverted?'#fff':'#000'}"></path>
    <DangerArea :w="w" :h="h"></DangerArea>
    <SelectBox :id="id" can-resize="true"></SelectBox>
  </g>
</template>

<script>

  import SelectBox from "./Parts/SelectBox.vue"
  import BaseObject from "./Parts/BaseObject.vue"
  import DangerArea from "./Parts/DangerArea.vue"

  export default {
    components: {SelectBox, DangerArea},
    extends: BaseObject,
    computed: {
      paths() {
        return this.object.renderParams.map(p => p.path)
      },
      voronoi() {
        if (this.object.renderParams.length > 0)
          return this.object.renderParams[0].params.voronoi;
        else
          return null;
      },
      img() {
        if (this.object.renderParams.length > 0)
          return this.$store.getters.getObjectById(this.object.renderParams[0].image);
        else
          return null;
      }
    }
  }

</script>

<style>
  /* path {
    stroke: black;
    fill: transparent;
    stroke-width: .5px;
  } */

  .fade-enter-active, .fade-leave-active {
    transition: opacity .8s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
