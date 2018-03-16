<template>
</template>

<script>

import Base from "../Base.vue"
import LayerModule from "../Modules/LayersModule.vue"
import DimensModule from "../Modules/DimensModule.vue"

import {CPart, Form} from "@/models.js"

export default {
  extends: Base,
  components: {LayerModule, DimensModule},
  computed: {
    layers() {
      return this.$store.state.layers
        .filter(el => el instanceof CPart || (el instanceof Form && el.ownRenderer))
        .filter(el => el.renderParams.find(p => p.renderer == this.id))
    }
  }
}

</script>
