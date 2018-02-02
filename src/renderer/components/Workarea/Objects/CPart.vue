<template>
  <g :id="id" v-dragable>
    <rect :x="x" :y="y" :width="w" :height="h" :style="{fill: object.inverted?'#000':'#fff'}"></rect>
    <transition-group name="fade" tag="g" v-if="paths">
      <path :d="path.path" :key="path.k" v-for="(path,i) in paths"></path>
    </transition-group>
    <SelectBox :id="id" can-resize="true" :transform="'translate('+x+' '+y+')'" ></SelectBox>
  </g>
</template>

<script>

  import SelectBox from "./SelectBox.vue"
  import BaseObject from "./BaseObject.vue"

  export default {
    components: {SelectBox},
    extends: BaseObject,
    computed: {
      paths() {
        let paths = this.$store.getters.getPathById(this.id)
        return paths;
      }
    }
  }


</script>

<style>
  .fade-enter-active, .fade-leave-active {
    transition: opacity .8s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
</style>
