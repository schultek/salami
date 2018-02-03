<template>
  <div>
    <div class="settings-title">
      <span>Titel <input type="text" v-model.lazy="object.title" v-blur/></span>
      <i class="fa fa-trash-alt" @click="removeObject"></i>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Form</span>
      </div>

      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <select v-model="object.type">
            <option>Linie</option>
            <option>Bogen</option>
            <option>Kreis</option>
            <option>Welle</option>
          </select>
        </div>
        <div class="dimen">
          <span>Biegung</span><input type="number" v-model.number.lazy="object.stretch" v-blur/>
        </div>
        <div class="dimen">
          <span>Richtung</span><input type="number" v-model.number.lazy="object.direction" v-blur/>
        </div>
      </div>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Anordnung</span>
      </div>
      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <span style="width: 40px; text-align: right">X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
        </div>
        <div class="dimen">
          <span style="width: 40px; text-align: right">Y</span><input type="number" v-model.number.lazy="object.y" v-blur/>
        </div>
      </div>
      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <span style="width: 40px; text-align: right">Schritte</span><input type="number" v-model.number.lazy="object.steps" v-blur/>
        </div>
        <div class="dimen">
          <span style="width: 40px; text-align: right">Abstand</span><input type="number" v-model.number.lazy="object.gap" v-blur/>
        </div>
      </div>
    </div>
    <div class="settings-panel linked-layer-list">
      <div class="settings-header">
        <span>Ebenen</span>
      </div>
      <div class="linked-layer-item" v-for="layer in layers" @click="selectLayer(layer.id)">
        <i class="fa fa-fw" :class="'fa-'+icon(layer)"></i>
        {{layer.title}}
        <span>
          <i class="fa fa-angle-right"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

  import BasePropertyPanel from "./BasePropertyPanel.vue"

  export default {
    extends: BasePropertyPanel,
    computed: {
      layers() {
        let l = this.$store.state.objects
          .filter(this.$store.getters.isSublayer)
          .filter(el => el.render.curve == this.id)
        return l;
      }
    },
    methods: {
      icon(layer) {
        return layer.is == "cpart" ? "th-large" : layer.type == "rect" ? "square" : layer.type == "ellipse" ? "circle" : ""
      },
      selectLayer(id) {
        this.$store.commit("selectObject", id)
      }
    }
  }

</script>

<style>

</style>
