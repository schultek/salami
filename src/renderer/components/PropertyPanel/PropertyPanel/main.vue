<template>
  <component class="settings" :is="type+'X'" :id="id"></component>
</template>

<script>

  import CPart from "./CPart.vue"
  import Renderer from "./Renderer.vue"
  import Form from "./Form.vue"
  import Machine from "./Machine.vue"
  import Text from "./Text.vue"
  import Image from "./Image.vue"

  export default {
    props: ["type", "id"],
    components: {
      cpartX: CPart,
      rendererX: Renderer,
      formX: Form,
      machineX: Machine,
      textX: Text,
      imageX: Image
    }
  }

</script>

<style>

.linked-layer-list {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.linked-layer-item {
  padding-left: 15px;
  font-size: 12px;
  height: 25px;
  display: flex;
  align-items: center;
  position: relative;
}

.linked-layer-item i.icon {
  margin-right: 12px;
}

.linked-layer-item select {
  margin-left: -7px;
}

.linked-layer-item span:last-child {
  position: absolute;
  padding-right: 5px;
  right: 0;
  top: 0;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: #aaa;
}

.linked-layer-item span:last-child i {
  margin: auto 5px;
}

.linked-layer-item:hover, .linked-layer-item.selected {
  background-color: #ededed;
}

.linked-layer-item span:last-child i:hover {
  color: #555;
}

.linked-layer-item:hover i.link {
  color: #555;
}

</style>
