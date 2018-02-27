<template>
  <g :id="id" :transform="'translate('+x+' '+y+')'" v-dragable>
    <rect x="0" y="0" :width="w" :height="h" :style="{fill: object.inverted?'#000':'#fff'}"></rect>
    <path :d="path" v-for="path in paths"></path>
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
        return this.$store.getters.getPathById(this.id)
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
