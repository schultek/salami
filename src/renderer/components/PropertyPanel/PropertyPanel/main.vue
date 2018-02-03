<template>
  <component class="settings" :is="type+'X'" :id="id"></component>
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


.linked-layer-list {
  padding-left: 0 !important;
  padding-right: 0 !important;
  padding-top: 40px !important;
}

.linked-layer-item:first-child {
  margin-top: 15px;
}

.linked-layer-item {
  padding-left: 15px;
  font-size: 12px;
  height: 25px;
  display: flex;
  align-items: center;
  position: relative;
}

.linked-layer-item i:first-child {
  margin-right: 5px;
}

.linked-layer-item i:last-child {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translate(0, -50%);
  color: #aaa;
}

.linked-layer-item:hover {
  background-color: #ededed;
}

.linked-layer-item:hover i:last-child {
  color: #555;
}

</style>
