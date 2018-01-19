<template>
  <LayoutsPanel v-if="navigationPanel==1||quickMode"></LayoutsPanel>
  <LayersPanel v-else-if="navigationPanel==0"></LayersPanel>
  <SyncPanel v-else-if="navigationPanel==2"></SyncPanel>
</template>

<script>

  import LayersPanel from "./LayersPanel/main.vue"
  import LayoutsPanel from "./LayoutsPanel.vue"
  import SyncPanel from "./SyncPanel.vue"

  import {mapState} from "vuex"

  export default {
    components: {LayersPanel, LayoutsPanel, SyncPanel},
    computed: mapState(["quickMode", "navigationPanel"])
  }

</script>

<style>

.sidepanel {
  width: 200px;
  border-right-style: solid;
  position: relative;
}

</style>
