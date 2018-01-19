<template>
  <QuickPanel v-if="quickMode"></QuickPanel>
  <PropertyPanel v-else-if="selectedObject" :type="type" :id="selectedObject"></PropertyPanel>
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
        if (this.selectedObject == "machine") return "machine";
        let o = this.$store.getters.getObjectById(this.selectedObject);
        return o ? o.is : ""
      }
    }
  }

</script>

<style>

.settings, .quickSettings {
  width: 300px;
  border-left-style: solid;
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

.settings-title {
  display: flex;
  justify-content: space-between;
  height: 25px;
  letter-spacing: 1px;
}

.settings-title span {
  font-size: 10px;
  margin: 6px 0;
  margin-right: 10px;
  display: inline-block;
  color: #9f9f9f;
  text-transform: uppercase;
}

.settings-title .fa-icon {
  font-size: 14px;
  margin: 6px;
  color: #9f9f9f;
}

.settings-title .fa-icon:hover {
  color: #008dea;
}

.settings-dimensions {
  display: flex;
  flex-flow: row wrap;
}

.dimen-row-3 .dimen {
  width: 80px;
}

.dimen-row-2 .dimen {
  width: 120px;
}

.dimen-row-4 .dimen {
  width: 55px;
}

.dimen-row .dimen {
  width: auto;
}

.dimen-row .dimen input {
  width: 45px;
}

.dimen {
  height: 20px;
  margin: 10px 5px;
}

.dimen span {
  display: inline-block;
  font-size: 11px;
  margin: 5px;
}

.dimen input {
  width: 60%;
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
}

.settings-header > span {
  margin: 10px;
  font-size: 10px;
}

.settings-header > span:first-child {
  letter-spacing: 2px;
  text-transform: uppercase;
}

.settings-header .fa-icon {
  font-size: 12px;
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
