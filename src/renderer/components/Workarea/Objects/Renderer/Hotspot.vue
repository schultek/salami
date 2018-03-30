<template>
    <g :id="hotspot.id" class="hotspot" :transform="'translate('+hotspot.x+' '+hotspot.y+')'">
      <circle cx="0" cy="0" :r="hotspot.r" :stroke-width="1 / zoom" class="outline"></circle>
      <circle cx="0" cy="0" :r="hotspot.r * 2 * (hotspot.weight / 100)" :stroke-width="1 / zoom" class="outline" stroke-dasharray="5 10"></circle>
      <circle cx="0" cy="0" :r="4 / zoom" v-dragable.nosnap.point="object" class="fill"></circle>
    </g>
</template>

<script>

import {createProxy} from "@/mixins.js"

export default {
  props: ["id", "hotspot"],
  computed: {
    object() {
      return createProxy(this.hotspot, obj => {
        console.log(obj)
        this.$store.commit("updateObject", {id: this.id, hotspot: {set: {id: this.hotspot.id, ...obj}}})
      })
    },
    zoom() { return this.$store.state.project.zoom },
    d() {
      return (this.hotspot.weight / 100) * 10;
    }
  }
}

</script>

<style>

.hotspot {
  display: none;
}
.selected .hotspot {
  display: inherit;
  color: #008dea;
}
.hotspot .outline {
  stroke: currentColor;
  fill: transparent;
}
.hotspot .fill {
  fill: currentColor;
}

</style>
