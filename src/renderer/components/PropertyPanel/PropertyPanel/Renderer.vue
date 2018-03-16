<template>
  <component :is="type" :id="id"></component>
</template>

<script>

import HalftoneRenderer from "./Renderer/HalftoneRenderer.vue"
import StippleRenderer from "./Renderer/StippleRenderer.vue"

import {HalftoneRenderer as HalftoneRendererObject, StippleRenderer as StippleRendererObject} from "@/models.js"

export default {
  props: ["id"],
  components: {halftone: HalftoneRenderer, stipple: StippleRenderer},
  computed: {
    type() {
      let o = this.$store.getters.getObjectById(this.id)
      if (!o) return
      if (o instanceof HalftoneRendererObject) return "halftone"
      if (o instanceof StippleRendererObject)  return "stipple"
    }
  }
}

</script>
