<template>
  <div class="sidebar panel" :class="selectedObject ? 'open' : ''">
    <transition name="delay">
      <component v-if="selectedObject" class="settings" :is="type+'X'" :id="selectedObject"></component>
    </transition>
  </div>

</template>

<script>

  import Artboard from "./Artboard.vue"
  import Form from "./Form.vue"
  import Machine from "./Machine.vue"
  import Text from "./Text.vue"
  import Image from "./Image.vue"
  import HalftoneRenderer from "./Renderer/HalftoneRenderer.vue"
  import StippleRenderer from "./Renderer/StippleRenderer.vue"

  export default {
    components: {
      artboardX: Artboard,
      halftoneX: HalftoneRenderer,
      stippleX: StippleRenderer,
      formX: Form,
      machineX: Machine,
      textX: Text,
      imageX: Image
    },
    computed: {
      selectedObject() {
        return this.$store.state.selectedObject;
      },
      type() {
        if (!this.selectedObject) return
        if (this.selectedObject == "machine") return "machine";
        return this.$store.getters.getObjectTypeById(this.selectedObject);
      }
    }
  }

</script>

<style>


.sidebar {
  width: 0;
  transition: width .8s;
  border-left-style: solid;
  overflow: scroll;
}

.sidebar > div {
  width: 300px;
}

.sidebar.open {
  width: 300px;
}

input[type="text"], input[type="number"] {
  background: none;
  border: none;
  border-bottom: 1px solid #e4e4e4;
  outline: none;
  color: #505050;
  padding-bottom: 4px;
}

input[type="text"]:focus, input[type="number"]:focus {
  border-bottom-color: #008dea;
}

.panel select {
  outline: none;
  border: none;
  color: #505050;
}

.settings > div {
  border-bottom: 2px solid #e4e4e4;
  padding: 10px;
}

.settings-dimensions {
  display: flex;
  flex-flow: row wrap;
}

.settings-panel {
  padding-top: 30px !important;
  position: relative;
}

.settings-header {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  color: #9f9f9f;
    font-size: 10px;
}

.settings-header > span:first-child {
  margin: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.settings-header span span {
  margin: 1px 5px;
}

.settings-header ul {
  position: absolute;
  top: 15px;
  right: 17px;
  margin: 0;
  padding: 0;
  list-style: none;
  background-color: #fcfcfc;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 0 5px 0 #9f9f9f;
}

.settings-header ul li {
  font-size: 10px;
  color: #9f9f9f;
  width: 100px;
  padding: 5px 15px;
}

.settings-header ul li:hover {
  background-color: #ededed;
}

.buttons img {
  width: 20px;
  height: 20px;
  color: #ededed;
}

.buttons img::after {
  content: "";
  display: block;
  height: 20px;
  width: 20px;
  background-color: blue;
}



.linked-layer-list {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.linked-layer-item {
  padding-left: 15px;
  font-size: 12px;
  height: 25px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.linked-layer-item .icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.linked-layer-item span:first-of-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.linked-layer-item .stretch {
  flex-grow: 1;
}

.linked-layer-item select {
  margin-left: -7px;
}

.linked-layer-item select {
  height: 100%;
  font-size: .95em;
}

.linked-layer-item:hover select {
  background: #ededed;
}

.linked-layer-item:hover select:hover {
  color: #008dea;
}

.linked-layer-item span:last-of-type {
  padding-right: 5px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  color: #aaa;
}

.linked-layer-item span:last-child i {
  padding: 5px;
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

.linked-layer-item.toggled {
  background: #ededed;
}

.toggle .toggle_icon {
  transform: rotate(-90deg);
  transition: transform .8s;
}

.toggle:hover .toggle_icon, .toggle.toggled .toggle_icon {
  transform: rotate(90deg);
}

</style>
