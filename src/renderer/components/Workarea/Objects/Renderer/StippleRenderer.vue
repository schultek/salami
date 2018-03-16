<template>
  <g :id="id" :class="selected ? 'selected' : ''">
    <Hotspot v-for="hotspot in object.hotspots" :key="hotspot.id" :id="id" :hotspot="hotspot"></Hotspot>
  </g>
</template>

<script>

import Hotspot from "./Hotspot.vue"

export default {
  props: ["id"],
  components: {Hotspot},
  computed: {
    object() {
      return this.$store.getters.getObjectById(this.id)
    },
    selected() {
      return this.$store.state.selectedObject == this.id
    }
  }
}

</script>

<style>


</style>
