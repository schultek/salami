<template>
  <g :id="id" :transform="'translate('+x+' '+y+')'" v-dragable>
    <rect :x="x" :y="y" :width="w" :height="h" :style="{fill: object.inverted?'#000':'#fff'}"></rect>
    <path :d="path"></path>
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
      path() {
        return this.$store.getters.getCPartPathById(this.id)
      }
    }
  }


</script>

<style>

</style>
