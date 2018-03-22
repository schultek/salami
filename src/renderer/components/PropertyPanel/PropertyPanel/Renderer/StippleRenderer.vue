<template>
  <div>
    <TitleModule :id="id" v-model="object.title"></TitleModule>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Points</span>
      </div>
      <DimensModule row="2" :id="id" :dimens="stippleParams" fw></DimensModule>
    </div>
    <div class="settings-panel linked-layer-list">
      <div class="settings-header">
        <span>Hotspots</span>
        <span class="add-hotspot" @click="addHotspot"><i class="fa fa-plus"></i></span>
      </div>
      <template v-for="(hotspot, i) in object.hotspots">
        <div class="linked-layer-item" :class="openSettings == i ? 'selected' : ''">
          <i class="far fa-fw fa-dot-circle icon"></i>
          <span>Hotspot {{i+1}}</span>
          <span class="stretch"></span>
          <span class="hotspot-controls">
            <i class="fas fa-cog" @click="toggleHotspotSettings(i)"></i>
            <i class="far fa-trash-alt" @click="removeHotspot(i)"></i>
          </span>
        </div>
        <div class="params hotspot-settings" v-if="openSettings == i">
          <div class="settings-dimensions dimen-row-2">
            <Dimen v-model="hotspot.r" type="number" title="Radius" unit="mm"></Dimen>
            <Dimen v-model="hotspot.weight" type="number" title="Weight" unit="%"></Dimen>
            <Dimen v-model="hotspot.reduce" type="number" title="Reduce" unit="%"></Dimen>
          </div>
        </div>
      </template>

    </div>
    <LayerModule :layers="layers"></LayerModule>
  </div>
</template>

<script>

  import BaseRenderer from "./BaseRenderer.vue"
  import Dimen from "../Dimen.vue"

  import {Hotspot} from "@/models.js"

  export default {
    extends: BaseRenderer,
    components: {Dimen},
    data: () => ({
      stippleParams: [
        {title: "Size", prop: "pointSize", type:"number", unit:"%"},
        {title: "Min Size", prop: "pointSizeMin", type:"number", unit:"%"},
        {title: "Max Size", prop: "pointSizeMax", type:"number", unit:"%"},
        {title: "Adaptive Size", prop: "adaptivePointSize", type:"checkbox"}
      ],
      openSettings: null
    }),
    methods: {
      toggleHotspotSettings(i) {
        this.openSettings = this.openSettings == i ? null : i;
      },
      addHotspot() {
        this.$store.commit("updateObject", {
          id: this.id,
          hotspot: {add: new Hotspot()}
        })
      },
      removeHotspot(i) {
        this.$store.commit("updateObject", {
          id: this.id,
          hotspot: {remove: i}
        })
      }
    }
  }

</script>

<style>

.add-hotspot {
  margin: 0;
  padding: 9px 16px;
  font-size: 11px;
}

.add-hotspot:hover {
  color: #008dea;
}

.linked-layer-item:hover .hotspot-controls i {
  color: #aaa;
}
.linked-layer-item .hotspot-controls i:hover {
  color: #555;
}

.hotspot-settings {
  height: auto;
}

</style>
