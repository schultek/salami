<template>
  <g :id="id">
    <defs>
      <mask id="mask">
        <rect x="-100" y="-100" width="200" height="200" fill="url(#gradient)" />
     </mask>
    </defs>
    <g class="curve"  :transform="'translate('+x+' '+y+')'" :class="selected ? 'selected' : ''" >
      <g class="paths" mask="url(#mask)">
        <path :d="path.data" :style="{opacity: path.opacity}" :stroke-width="1.5 / zoom" v-for="path in paths"></path>
      </g>
      <circle cx="0" cy="0" :r="4 / zoom" v-dragable></circle>
    </g>
  </g>
</template>

<script>

  export default {
    props: ["id"],
    computed: {
      object() { return this.$store.getters.getObjectById(this.id) },
      paths() { return this.object.path || [] },
      x() { return this.object.x },
      y() { return this.object.y },
      zoom() { return this.$store.state.project.zoom },
      selected() { return this.$store.state.selectedObject == this.id }
    }
  }

</script>

<style>

.curve circle {
  fill: #505050;
}

.curve.selected circle{
  fill: #008dea;
}

.curve .paths {
  stroke: #505050;

  fill: transparent;
}

.curve.selected .paths {
  stroke: #008dea;
}

</style>
