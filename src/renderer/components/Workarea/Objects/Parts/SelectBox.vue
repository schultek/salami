<template>
  <g v-if="visible" id="selectBox" class="filled stroked" :style="{strokeWidth: 1/zoom}">
    <line  x1="0"  y1="0" :x2="w"  y2="0" ></line>
    <line :x1="w"  y1="0" :x2="w" :y2="h" ></line>
    <line :x1="w" :y1="h"  x2="0" :y2="h" ></line>
    <line  x1="0" :y1="h"  x2="0"  y2="0" ></line>

    <circle  cx="0"    cy="0"   :r="r" class="cursor-resize-diag-1" v-resizeable:sxsy></circle>
    <circle :cx="w/2"  cy="0"   :r="r" class="cursor-resize-vert"   v-resizeable:sy  ></circle>
    <circle :cx="w"    cy="0"   :r="r" class="cursor-resize-diag-2" v-resizeable:syex></circle>
    <circle :cx="w"   :cy="h/2" :r="r" class="cursor-resize-hori"   v-resizeable:ex  ></circle>
    <circle :cx="w"   :cy="h"   :r="r" class="cursor-resize-diag-1" v-resizeable:exey></circle>
    <circle :cx="w/2" :cy="h"   :r="r" class="cursor-resize-vert"   v-resizeable:ey  ></circle>
    <circle  cx="0"   :cy="h"   :r="r" class="cursor-resize-diag-2" v-resizeable:eysx></circle>
    <circle  cx="0"   :cy="h/2" :r="r" class="cursor-resize-hori"   v-resizeable:sx  ></circle>

    <template v-if="canRotate">
      <line :x1="w/2" y1="0" :x2="w/2" y2="-15"></line>
      <circle :cx="w/2" cy="-15" :r="r" class="cursor-rotate" v-rotateable></circle>
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
