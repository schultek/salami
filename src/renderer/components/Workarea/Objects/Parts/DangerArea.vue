<template>

  <g v-show="active" fill="url(#diagonalHatch)">
    <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M-1,1 l2,-2
             M0,4 l4,-4
             M3,5 l2,-2"
          style="stroke:red; stroke-width:1; opacity: .7" />
    </pattern>
    <path :d="path"></path>
  </g>


</template>

<script>

export default {

  props: ["w", "h"],
  computed: {
    active() {
      return this.w > this.$store.state.machine.w || this.h > this.$store.state.machine.h
    },
    borderW() {
      return Math.max(0, this.w - this.$store.state.machine.w) / 2;
    },
    borderH() {
      return Math.max(0, this.h - this.$store.state.machine.h) / 2
    },
    path() {
      return `M0,0 L${this.w},0 L${this.w},${this.h} L0,${this.h} Z
              M${this.borderW},${this.borderH} L${this.borderW},${this.h-this.borderH} L${this.w-this.borderW},${this.h-this.borderH} L${this.w-this.borderW},${this.borderH} Z`;
    }
  }

}

</script>
