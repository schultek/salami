<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading" @click="closeSublayers">
      <icon v-if="subLayersOpen" name="angle-left"></icon>
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
        if (id && (this.subLayersOpen != this.$store.getters.isSublayerById(id)))
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

#layer-heading .fa-icon {
  margin-right: 5px;
}

#layer-heading span {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
}

#layer-heading:hover .fa-icon {
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

.layer-item .fa-icon {
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

.layer-item span .fa-icon:hover {
  fill: #555;
}

.layer-item .sublayer_link {
  flex-grow: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 25px;
}

.layer-item .sublayer_link .fa-icon {
  font-size: 15px;
  padding: 6px 10px;
}

.layer-item .sublayer_link .fa-icon:hover {
  color: #008dea;
}


</style>
