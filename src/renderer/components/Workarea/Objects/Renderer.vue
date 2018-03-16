<template>
  <HalftoneRenderer v-if="type == 'halftone'" :id="id"></HalftoneRenderer>
  <StippleRenderer v-else-if="type == 'stipple'" :id="id"></StippleRenderer>
</template>

<script>

  import HalftoneRenderer from "./Renderer/HalftoneRenderer.vue"
  import StippleRenderer from "./Renderer/StippleRenderer.vue"

  export default {
    props: ["id", "type"],
    components: {HalftoneRenderer, StippleRenderer}
  }

</script>

<style>

</style>
