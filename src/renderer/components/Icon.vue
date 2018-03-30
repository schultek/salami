<template>

  <i v-if="mode == 'font-awesome'" class="fa fa-fw icon" :class="i"></i>
  <component v-else :is="i" class="svg-icon icon"></component>

</template>

<script>

import TriangleIcon from "@/assets/icons/triangle.svg"
import HalftoneIcon from "@/assets/icons/halftone.svg"
import StippleIcon from "@/assets/icons/stipple.svg"
import PolygonIcon from "@/assets/icons/polygon.svg"

import {Artboard, Form, Image, HalftoneRenderer, StippleRenderer, Text} from "@/models.js"

export default {
  props: ["icon", "for"],
  components: {triangle: TriangleIcon, halftone: HalftoneIcon, stipple: StippleIcon, poly: PolygonIcon},
  computed: {
    compIcon() {
      return this.icon ? this.icon : this.getIconFor(this.for)
    },
    mode() {
      return this.compIcon.startsWith("/") ? "file" : "font-awesome"
    },
    i() {
      return this.compIcon.startsWith("/") ? this.compIcon.slice(1) : "fa-" + this.compIcon
    },
    icons() {
      let icons = {}
      this.$store.state.tools.map(tool => {
        if (tool.id)
          icons[tool.id] = tool.icon
        else
          tool.tools.forEach(t => icons[t.id] = t.icon)
      })
      return icons
    }
  },
  methods: {
    getIconFor(payload) {
      let o = {};
      if (typeof payload === "object") o = payload;
      if (typeof payload === "string") o = this.$store.getters.getObjectById(payload);
      if (o instanceof Artboard) {
        return this.icons.artboard;
      } else if (o instanceof Form) {
        return this.icons[o.type];
      } else if (o instanceof Image) {
        return this.icons.image
      } else if (o instanceof HalftoneRenderer) {
        return this.icons.halftone
      } else if (o instanceof StippleRenderer) {
        return this.icons.stipple
      } else if (o instanceof Text) {
        return this.icons.text
      } else {
        return "exclamation-circle"
      }
    }
  }
}

</script>

<style>

.svg-icon {
  width: 1.25em;
  height: .9em;
  fill: currentColor;
}

</style>
