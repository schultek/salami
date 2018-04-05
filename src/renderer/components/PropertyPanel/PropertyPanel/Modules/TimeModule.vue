<template>
  <div v-if="times && times.length > 0" class="settings-panel linked-layer-list">
    <div class="settings-header">
      <span>Time</span>
    </div>
    <div class="linked-layer-item" v-for="time in times">
      <Icon :for="time.for"></Icon>
      <span>{{time.value}}</span>
      <span></span>
    </div>
  </div>

</template>


<script>

import {ToTimeString} from "@/mixins.js"
import Icon from "@/components/Icon.vue"

export default {
  props: ["id"],
  components: {Icon},
  mixins: [ToTimeString],
  computed: {
    times() {
      let o = this.$store.getters.getObjectById(this.id)
      return o.renderParams.map(p => ({
        for: p.renderer,
        value: this.toTimeString(p.gcode.time)
      }))
    }
  }
}

</script>
