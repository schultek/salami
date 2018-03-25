<template>
  <g id="snapping">
    <line v-if="sx" y1="0" :x1="sx" :y2="h()" :x2="sx"></line>
    <line v-if="sy" :y1="sy" x1="0" :y2="sy" :x2="w()"></line>
    <line v-if="ex" y1="0" :x1="ex" :y2="h()" :x2="ex"></line>
    <line v-if="ey" :y1="ey" x1="0" :y2="ey" :x2="w()"></line>
  </g>
</template>

<script>

import $ from "jquery"

import Snapping from "@/includes/Snapping.js"

export default {
  data: () => ({
    sx: null, sy: null, ex: null, ey: null
  }),
  mounted() {
    Snapping.setDrawCallback((sx, sy, ex, ey) => {
      this.sx = sx || sx === 0 ? this.p.x + sx * this.p.zoom : null;
      this.sy = sy || sy === 0 ? this.p.y + sy * this.p.zoom : null;
      this.ex = ex || ex === 0 ? this.p.x + ex * this.p.zoom : null;
      this.ey = ey || ey === 0 ? this.p.y + ey * this.p.zoom : null;
    })
  },
  computed: {
    p() {
      return this.$store.state.project
    }
  },
  methods: {
    w() {
      return $("#svg").width()
    },
    h() {
      return $("#svg").height()
    }
  }
}

</script>

<style>

#snapping line {
  stroke-width: .5px;
  stroke: #008dea;
}

</style>
