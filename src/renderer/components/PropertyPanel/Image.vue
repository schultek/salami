<template>
  <div>
    <TitleModule :id="id" v-model="object.title"></TitleModule>
    <DimensModule :id="id" row="3" dimens="rotation"></DimensModule>
    <div class="settings-dimensions dimen-row settings-panel">
      <div class="settings-header">
        <span>File</span>
      </div>
      <div class="dimen">
        <input id="imageInput" type="button" value="Choose File" @click="loadImage" style="width: auto"/>
      </div>
      <div v-show="object.data" class="dimen" style="height: auto">
        <img id="preview" :src="object.data" width="100%" />
      </div>
    </div>
    <LayerModule :layers="layers"></LayerModule>
  </div>
</template>

<script>

  import Base from "./Base.vue"
  import LayerModule from "./Modules/LayersModule.vue"
  import DimensModule from "./Modules/DimensModule.vue"

  import {Artboard, Form} from "@/models.js"

  export default {
    extends: Base,
    components: {LayerModule, DimensModule},
    computed: {
      layers() {
        return this.$store.state.layers
          .filter(el => el instanceof Artboard || (el instanceof Form && el.ownRenderer))
          .filter(el => el.renderParams.find(p => p.image == this.id))
      }
    },
    methods: {
      loadImage() {
        this.$store.dispatch("loadNewImage", this.id)
      }
    }
  }

</script>

<style>

</style>
