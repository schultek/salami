<template>
  <div class="settings-panel linked-layer-list">
    <div class="settings-header">
      <span>Time</span>
    </div>
    <div class="linked-layer-item" v-for="time in times">
      <i class="fas fa-fw icon" :class="time.icon"></i>
      <span>{{time.value}}</span>
      <span></span>
    </div>
  </div>

</template>


<script>

import {ToTimeString, Icon} from "@/mixins.js"

export default {
  props: ["id"],
  mixins: [ToTimeString, Icon],
  computed: {
    times() {
      let o = this.$store.getters.getObjectById(this.id)
      return o.renderParams.map(p => ({
        icon: this.icon(p.renderer),
        value: this.toTimeString(p.gcode.time)
      }))
    }
  }
}

</script>
