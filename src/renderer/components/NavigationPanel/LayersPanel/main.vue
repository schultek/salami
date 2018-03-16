<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading" @click="closeSublayers">
      <i v-if="subLayersOpen" class="fa fa-angle-left"></i>
      <span>{{subLayersOpen?'Fräsbereich':'Arbeitsbereich'}}</span>
    </div>
    <SubLayers v-if="subLayersOpen"></SubLayers>
    <RootLayers v-else></RootLayers>
  </div>
</template>

<script>

  import SubLayers from "./SubLayers.vue"
  import RootLayers from "./RootLayers.vue"

  import {mapState} from "vuex"

  export default {
    components: {SubLayers, RootLayers},
    computed: mapState(["subLayersOpen", "selectedObject"]),
    watch: {
      selectedObject(id) {
        if (id && (this.subLayersOpen != this.$store.getters.isLayerById(id)))
          this.$store.commit("setSubLayersOpen", !this.subLayersOpen)
      }
    },
    methods: {
      closeSublayers() {
        this.$store.commit("setSubLayersOpen", false)
      }
    }
  }

</script>

<style>

#layer-heading {
  height: 40px;
  width: 100%;
  margin-left: 15px;
  color: #959595;
  display: flex;
  align-items: center;
}

#layer-heading i {
  margin-right: 5px;
}

#layer-heading span {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
}

#layer-heading:hover i {
  color: #008dea;
}

.layer-item {
  padding-left: 15px;
  font-size: 12px;
  height: 25px;
  display: flex;
  align-items: center;
  position: relative;
}

.layer-item.selected {
  background-color: #ededed;
}

.layer-item i {
  margin-right: 5px;
}

.layer-item span {
  display: block;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translate(0, -50%);
  color: #aaa;
}

.layer-item span i:hover {
  color: #555;
}

</style>
