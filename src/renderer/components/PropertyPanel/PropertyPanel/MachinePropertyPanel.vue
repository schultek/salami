<template>
  <div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>B</span><input type="number" v-model.number.lazy="object.w" v-blur/>
      </div>
      <div class="dimen">
        <span>H</span><input type="number" v-model.number.lazy="object.h" v-blur/>
      </div>
      <div class="dimen">
        <span>Tiefe</span><input type="number" v-model.number.lazy="object.bit.inDepth" v-blur/>
      </div>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Bit</span>
      </div>
      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <span>Breite</span><input type="number" v-model.number.lazy="object.bit.width" v-blur/>
        </div>
        <div class="dimen">
          <span>Höhe</span><input type="number" v-model.number.lazy="object.bit.height" v-blur/>
        </div>
        <div class="dimen">
          <span>Spitze</span><input type="number" v-model.number.lazy="object.bit.tip" v-blur/>
        </div>
      </div>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Speed</span>
      </div>
      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <span>Seekrate</span><input type="number" v-model.number.lazy="object.speed.seekrate" v-blur/>
        </div>
        <div class="dimen">
          <span>Feedrate</span><input type="number" v-model.number.lazy="object.speed.feedrate" v-blur/>
        </div>
        <div class="dimen">
          <span>Feedrate (Dot.)</span><input type="number" v-model.number.lazy="object.speed.feedrateDot" v-blur/>
        </div>
        <div class="dimen">
          <span>Höhe über Material</span><input type="number" v-model.number.lazy="object.outHeight" v-blur/>
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
