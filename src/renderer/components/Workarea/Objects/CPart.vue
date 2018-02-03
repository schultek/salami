<template>
  <g :id="id" :transform="'translate('+x+' '+y+')'" v-dragable>
    <rect x="0" y="0" :width="w" :height="h" :style="{fill: object.inverted?'#000':'#fff'}"></rect>
    <transition-group name="fade" tag="g" v-if="paths">
      <path :d="path.path" :key="path.k" v-for="(path,i) in paths"></path>
    </transition-group>
    <SelectBox :id="id" can-resize="true"></SelectBox>
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
