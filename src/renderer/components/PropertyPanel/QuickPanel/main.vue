<template>
  <div class="quickSettings">
    <ProjectQuickPanel></ProjectQuickPanel>
    <ArtboardQuickPanel v-for="layer in layers" :key="layer.id" :id="layer.id"></ArtboardQuickPanel>
    <ImageQuickPanel v-for="image in images" :key="image.id" :id="image.id"></ImageQuickPanel>
    <RendererQuickPanel v-for="renderer in renderer" :key="renderer.id" :id="renderer.id"></RendererQuickPanel>
    <TextQuickPanel v-for="text in texts" :key="text.id" :id="text.id"></TextQuickPanel>
    <QuickActions></QuickActions>
  </div>
</template>

<script>

  import ProjectQuickPanel from "./ProjectQuickPanel.vue"
  import ArtboardQuickPanel from "./ArtboardQuickPanel.vue"
  import RendererQuickPanel from "./RendererQuickPanel.vue"
  import ImageQuickPanel from "./ImageQuickPanel.vue"
  import TextQuickPanel from "./TextQuickPanel.vue"
  import QuickActions from "./QuickActions.vue"

  import {Artboard} from "@/models.js"

  export default {
    components: {
      ProjectQuickPanel, ArtboardQuickPanel, ImageQuickPanel, RendererQuickPanel, TextQuickPanel, QuickActions
    },
    computed: {
      layers()   { return this.$store.state.layers.filter(l => l instanceof Artboard) },
      images()   { return this.$store.state.images   },
      renderer() { return this.$store.state.renderer },
      texts()    { return this.$store.state.layers.filter(l => l instanceof Text)    },
    }
  }

</script>

<style>

</style>
