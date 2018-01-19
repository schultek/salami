<template>
  <g id="svgMachine" v-dragable>
    <rect :x="x" :y="y" :width="w" :height="h"></rect>
    <SelectBox id="machine"></SelectBox>
  </g>
</template>

<script>

  import SelectBox from "./SelectBox.vue"

  export default {
    components: {SelectBox},
    data: () => ({
      id: "machine"
    }),
    computed: {
      x() { return this.$store.state.machine.x },
      y() { return this.$store.state.machine.y },
      w() { return this.$store.state.machine.w },
      h() { return this.$store.state.machine.h }
    }
  }

</script>

<style>
  rect {
    fill: #ccc
  }
</style>
