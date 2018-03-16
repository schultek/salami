<template>
  <div class="settings-panel linked-layer-list">
    <div class="settings-header">
      <span>Zeit</span>
    </div>
    <div class="linked-layer-item" v-for="time in times">
      <i class="fas fa-fw icon" :class="time.icon"></i>
      {{time.value}}
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
