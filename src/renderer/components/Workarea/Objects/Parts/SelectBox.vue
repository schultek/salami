<template>
  <g v-if="visible" id="selectBox" class="filled stroked" :style="{strokeWidth: 1/zoom}">
    <line  x1="0"  y1="0" :x2="w"  y2="0" ></line>
    <line :x1="w"  y1="0" :x2="w" :y2="h" ></line>
    <line :x1="w" :y1="h"  x2="0" :y2="h" ></line>
    <line  x1="0" :y1="h"  x2="0"  y2="0" ></line>

    <circle  cx="0"    cy="0"   :r="r" class="cursor-resize-diag-1" v-resizeable:sxsy="{proportion}"></circle>
    <circle :cx="w/2"  cy="0"   :r="r" class="cursor-resize-vert"   v-resizeable:sy  ="{proportion}"></circle>
    <circle :cx="w"    cy="0"   :r="r" class="cursor-resize-diag-2" v-resizeable:syex="{proportion}"></circle>
    <circle :cx="w"   :cy="h/2" :r="r" class="cursor-resize-hori"   v-resizeable:ex  ="{proportion}"></circle>
    <circle :cx="w"   :cy="h"   :r="r" class="cursor-resize-diag-1" v-resizeable:exey="{proportion}"></circle>
    <circle :cx="w/2" :cy="h"   :r="r" class="cursor-resize-vert"   v-resizeable:ey  ="{proportion}"></circle>
    <circle  cx="0"   :cy="h"   :r="r" class="cursor-resize-diag-2" v-resizeable:eysx="{proportion}"></circle>
    <circle  cx="0"   :cy="h/2" :r="r" class="cursor-resize-hori"   v-resizeable:sx  ="{proportion}"></circle>

    <template v-if="canRotate">
      <line :x1="w/2" y1="0" :x2="w/2" :y2="-35/Math.sqrt(zoom)"></line>
      <circle :cx="w/2" :cy="-35/Math.sqrt(zoom)" :r="r" class="cursor-rotate" v-rotateable></circle>
    </template>
  </g>
</template>

<script>

  import BaseObject from './BaseObject.vue'

  export default {
    props: {
      canRotate: {
        default: false
      },
      canResize: {
        default: false
      },
      proportion: {
        default: false
      }
    },
    extends: BaseObject,
    computed: {
      zoom() { return this.$store.state.project.zoom },
      visible() { return this.$store.state.selectedObject == this.id },
      r() { return 3 / this.zoom }
    }
  }

</script>

<style>

#selectBox {
  z-index: 100;
}

.cursor-resize-diag-1:hover {
  cursor: nwse-resize;
}

.cursor-resize-diag-2:hover {
  cursor: nesw-resize;
}

.cursor-resize-hori:hover {
  cursor: ew-resize;
}

.cursor-resize-vert:hover {
  cursor: ns-resize;
}

</style>
