<template>
  <component class="settings panel" :is="type+'X'" :id="id"></component>
</template>

<script>

  import CPartPropertyPanel from "./CPartPropertyPanel.vue"
  import CurvePropertyPanel from "./CurvePropertyPanel.vue"
  import FormPropertyPanel from "./FormPropertyPanel.vue"
  import MachinePropertyPanel from "./MachinePropertyPanel.vue"
  import TextPropertyPanel from "./TextPropertyPanel.vue"
  import ImagePropertyPanel from "./ImagePropertyPanel.vue"

  export default {
    props: ["type", "id"],
    components: {
      cpartX: CPartPropertyPanel,
      curveX: CurvePropertyPanel,
      formX: FormPropertyPanel,
      machineX: MachinePropertyPanel,
      textX: TextPropertyPanel,
      imageX: ImagePropertyPanel
    }
  }

</script>

<style>

</style>
