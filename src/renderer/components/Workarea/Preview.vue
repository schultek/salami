<template>
  <g v-if="mode == 'rect' || mode == 'ellipse'" class="filled stroked" :transform="'translate('+value.x+' '+value.y+')'" :style="{strokeWidth: 1/zoom}" v-resizeable:sxsy="object">

    <pattern id="diagonalFill" patternUnits="userSpaceOnUse" width="8" height="8">
      <path d="M-2,2 l4,-4
             M0,8 l8,-8
             M6,10 l4,-4"
          style="stroke:#008dea; stroke-width:3; opacity: .6" />
    </pattern>

    <rect v-if="mode == 'rect'" x="0" y="0" :width="w" :height="h" fill="url(#diagonalFill)"></rect>
    <ellipse v-else-if="mode == 'ellipse'" :cx="w/2" :cy="h/2" :rx="w/2" :ry="h/2" fill="url(#diagonalFill)"></ellipse>

    <line  x1="0"  y1="0" :x2="w"  y2="0" ></line>
    <line :x1="w"  y1="0" :x2="w" :y2="h" ></line>
    <line :x1="w" :y1="h"  x2="0" :y2="h" ></line>
    <line  x1="0" :y1="h"  x2="0"  y2="0" ></line>

    <circle  cx="0"    cy="0"   :r="r"></circle>
    <circle :cx="w/2"  cy="0"   :r="r"></circle>
    <circle :cx="w"    cy="0"   :r="r"></circle>
    <circle :cx="w"   :cy="h/2" :r="r"></circle>
    <circle :cx="w"   :cy="h"   :r="r"></circle>
    <circle :cx="w/2" :cy="h"   :r="r"></circle>
    <circle  cx="0"   :cy="h"   :r="r"></circle>
    <circle  cx="0"   :cy="h/2" :r="r"></circle>
  </g>
  <g v-else-if="mode == 'point'" v-dragable="object" :transform="'translate('+value.x+' '+value.y+')'" :style="{strokeWidth: .5/zoom}">
    <line x1="0"   x2="0"  y1="-10" y2="-5"></line>
    <line x1="0"   x2="0"  y1="5"   y2="10"></line>
    <line x1="-10" x2="-5" y1="0"   y2="0" ></line>
    <line x1="5"   x2="10" y1="0"   y2="0" ></line>
    <circle class="filled" cx="0" cy="0" :r="r"></circle>
  </g>
</template>

<script>


export default {
  props: ["value", "mouse", "mode"],
  mounted() {
    this.$el.dispatchEvent(new MouseEvent("mousedown", {
      clientX: this.mouse.x, clientY: this.mouse.y
    }))
  },
  computed: {
    object() {
      let $this = this;
      return new Proxy(this.value, {
        get(target, prop) { return target[prop] },
        set(target, prop, v) {
          target[prop] = v;
          $this.$emit("input", target);
          return true;
        }
      })
    },
    zoom() { return this.$store.state.project.zoom },
    r() { return 3 / this.zoom },
    w() { return this.value.w; },
    h() { return this.value.h },
  }
}

</script>
