<template>
  <g :id="id" :transform="'translate('+x+' '+y+') rotate('+rot+')'" v-dragable>
    <path :d="path" :stroke-width="object.stroke" stroke="#505050"></path>
    <g :transform="'scale('+(1/zoom)+')'" :style="{display: selected}">
      <circle cx="0" cy="0" r="4" class="cursor-move"></circle>
      <g>
        <circle cx="-10" cy="-15" r="4" class="cursor-rotate" v-rotateable></circle>
        <path d="M-25 0A41 41 0 0 0 0 25"></path>
      </g>
    </g>
  </g>
</template>

<script>

  export default {
    props: ["id"],
    computed: {
      object() { return this.$store.getters.getObjectById(this.id); },
      x() { return this.object.x },
      y() { return this.obejct.y },
      rot() { return this.object.rot },
      selected() { return this.$store.state.selectedObject == this.id },
      zoom() { return this.$store.state.project.zoom },
      path() { return this.$store.getters.getCPartPathById(this.id) }
    }
  }

</script>

<style>

</style>
