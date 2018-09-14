<template>
  <div class="settings-panel linked-layer-list">
    <div class="settings-header">
      <span>Rendering</span>
    </div>
    <RenderParams v-for="pId in params" :key="pId" :pId="pId" :id="id"></RenderParams>
    <div class="linked-layer-item" v-for="r in renderer" @click="addRenderParams(r)">
      <Icon :for="r"></Icon>
      <span>{{r.title}}</span>
      <span class="stretch"></span>
      <span>
        <fa-icon icon="plus" size="xs" class="link"></fa-icon>
      </span>
    </div>
  </div>
</template>

<script>

import {createProxy} from "@/mixins.js"
import RenderParams from "../Renderer/RenderParams.vue"

import {HalftoneRenderer, StippleRenderer, RenderParams as RenderParamsObject} from "@/models.js"

import Icon from "@/components/Icon.vue"

export default {
  props: ["id"],
  components: {RenderParams, Icon},
  computed: {
    params() {
      let o = this.$store.getters.getObjectById(this.id)
      if (o) return o.renderParams.map(p => p.id)
    },
    renderer() {
      return this.$store.state.renderer
    }
  },
  methods: {
    addRenderParams(r) {
      let type = r instanceof HalftoneRenderer ? "halftone" : "stipple";
      let image = this.$store.state.images[0]
      let renderParams = new RenderParamsObject({renderer: r.id, type, image: image ? image.id : ""})
      this.$store.commit("addRenderParams", {id: this.id, params: renderParams});
    }
  }
}

</script>
