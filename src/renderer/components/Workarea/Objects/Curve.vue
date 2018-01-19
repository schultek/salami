<template>
  <g :id="id" v-if="selected">
    <path :d="path.data" class="paths" :style="{opacity: path.opacity}" :stroke-width="2 / zoom" v-for="path in paths"></path>
    <circle :cx="x" :cy="y" :r="4 / zoom" v-dragable></circle>
  </g>
</template>

<script>

  export default {
    props: ["id"],
    computed: {
      object() {
        return this.$store.getters.getObjectById(this.id)
      },
      paths() {
        return this.$store.getters.getCurvePathsById(this.id)
      },
      x() { return this.object.x },
      y() { return this.object.y },
      zoom() { return this.$store.state.project.zoom },
      selected() { return this.$store.state.selectedObject == this.id }
    }
  }

</script>

<style>

.paths {
  stroke: #008dea;
  fill: transparent;
}

</style>
