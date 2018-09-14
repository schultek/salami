<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading" @click="closeSublayers">
      <fa-icon v-if="subLayersOpen" icon="angle-left"></fa-icon>
      <span>{{subLayersOpen?'Layers':'Workarea'}}</span>
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

#layer-heading .fa-angle-left {
  margin-right: 5px;
}

#layer-heading span {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
}

#layer-heading:hover .fa-angle-left {
  color: #008dea;
}

.layer-list {
  overflow: scroll;
  padding-bottom: 20px;
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

.layer-item .icon {
  margin-right: 5px;
  flex-shrink: 0;
}


.layer-item span:first-of-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-item .stretch {
  flex-grow: 1;
}

.layer-item span:last-of-type {
  color: #aaa;
  margin-right: 5px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.layer-item span:last-of-type .svg-inline--fa {
  margin: 0 2px;
}

.layer-item span .svg-inline--fa:hover {
  color: #555;
}

</style>
