<template>
  <div class="quickSettings panel">
    <MachineQuickPanel></MachineQuickPanel>
    <CPartQuickPanel v-for="layer in parts" :key="layer.id" :id="layer.id"></CPartQuickPanel>
    <ImageQuickPanel v-for="image in objects.images" :key="image.id" :id="image.id"></ImageQuickPanel>
    <CurveQuickPanel v-for="curve in objects.curves" :key="curve.id" :id="curve.id"></CurveQuickPanel>
    <TextQuickPanel v-for="text in objects.texts" :key="text.id" :id="text.id"></TextQuickPanel>
    <QuickActions></QuickActions>
  </div>
</template>

<script>

  import MachineQuickPanel from "./MachineQuickPanel.vue"
  import CPartQuickPanel from "./CPartQuickPanel.vue"
  import CurveQuickPanel from "./CurveQuickPanel.vue"
  import ImageQuickPanel from "./ImageQuickPanel.vue"
  import TextQuickPanel from "./TextQuickPanel.vue"
  import QuickActions from "./QuickActions.vue"

  export default {
    components: {
      MachineQuickPanel, CPartQuickPanel, ImageQuickPanel, CurveQuickPanel, TextQuickPanel, QuickActions
    },
    computed: {
      objects() {
        return this.$store.getters.getObjectsByType
      },
      parts() {
        return this.objects.layers.filter(el => el.is == 'cpart')
      }
    }
  }

</script>

<style>

</style>
