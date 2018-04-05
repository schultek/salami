<template>
  <div id="workarea">
    <SvgView></SvgView>
    <CornerTools v-if="selectedTool=='select'" ></CornerTools>
  </div>
</template>

<script>

  import SvgView from "./SvgView.vue"
  import CornerTools from "./CornerTools.vue"

  export default {
    components: {SvgView, CornerTools},
    computed: {
      selectedTool() {
        return this.$store.state.selectedTool
      },
      selectedObject() {
        return this.$store.state.selectedObject
      }
    }
  }

</script>

<style>

#workarea {
  flex-grow: 1;
  flex-shrink: 1;
  background-color: #e4e4e4;
  position: relative;
}

</style>
