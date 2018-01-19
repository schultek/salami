<template>
  <div>
    <div class="settings-title">
      <span>Titel <input type="text" v-model.lazy="object.title" v-blur/></span>
      <icon name="trash-o" @click="removeObject"></icon>
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
          <span>Richtung</span><input type="number" v-model.number.lazy="object.direction" @change="mapRotation('direction')" v-blur/>
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
  </div>
</template>

<script>

  import BasePropertyPanel from "./BasePropertyPanel.vue"

  export default {
    extends: BasePropertyPanel
  }

</script>

<style>

</style>
