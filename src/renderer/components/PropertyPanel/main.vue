<template>
  <transition name="slide-right">
    <div class="sidebar panel" v-if="quickMode">
      <QuickPanel></QuickPanel>
    </div>
    <div class="sidebar panel" v-else-if="selectedObject">
      <PropertyPanel :type="type" :id="selectedObject"></PropertyPanel>
    </div>
  </transition>
</template>
<script>

  import QuickPanel from "./QuickPanel/main.vue"
  import PropertyPanel from "./PropertyPanel/main.vue"

  import {mapState} from "vuex"

  export default {
    components: {QuickPanel, PropertyPanel},
    computed: {
      ...mapState(["quickMode", "selectedObject"]),
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
  width: 300px;
  transition: width 1s;
  border-left-style: solid;
}

.sidebar > div {
  width: 300px;
}

.slide-right-enter, .slide-right-leave-to {
  width: 0;
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

.settings > div, .quickSettings > div {
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


</style>
