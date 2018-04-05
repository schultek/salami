<template>
    <g :id="hotspot.id" class="hotspot" :class="selected ? 'selected' : ''" :transform="'translate('+hotspot.x+' '+hotspot.y+')'">
      <circle cx="0" cy="0" :r="hotspot.r" v-if="hotspot.weight != 50" :stroke-width="1 / zoom" class="outline"></circle>
      <circle cx="0" cy="0" :r="rw" :stroke-width="1 / zoom" class="outline" transform="rotate(270)" :stroke-dasharray="u.l+' '+u.g"></circle>
      <circle cx="0" cy="0" :r="4 / zoom" v-dragable.nosnap.point="object" class="fill" @mousedown.capture="selectHotspot"></circle>
      <g v-if="selected">
        <circle cx="0" :cy="-this.hotspot.r" :r="4 / zoom" class="fill cursor-resize-vert" v-dragable.point.nosnap="ctrlProxy"></circle>
        <path :d="weightArc" class="stroked" :stroke-width="1 / zoom"></path>
        <circle :cx="arcPos.x" :cy="arcPos.y" :r="4 / zoom" class="fill cursor-resize-hori" v-dragable.point.nosnap="weightProxy"></circle>
      </g>
    </g>
</template>

<script>

import {createProxy} from "@/mixins.js"
import Vue from "vue"

import {dist, round} from "@/functions.js"

export default {
  props: ["id", "hotspot", "selected"],
  computed: {
    object() {
      return createProxy(this.hotspot, obj => {
        this.$store.commit("updateObject", {id: this.id, hotspot: {set: {id: this.hotspot.id, ...obj}}})
      })
    },
    zoom() { return this.$store.state.project.zoom },
    rw() {
      return this.hotspot.r * 2 * (this.hotspot.weight / 100)
    },
    u() {
      let u = 2 * Math.PI * this.rw / Math.round(this.rw / 2);
      return {l: u * (1 - this.hotspot.reduce / 100), g: u * this.hotspot.reduce / 100}
    },
    arcR() {
      let r = this.hotspot.r * this.hotspot.weight / 100 * 2
      return r + r / 100 * 15;
    },
    arcA() {
      return 150 + this.hotspot.reduce / 100 * 60
    },
    arcPos() {
      return {
        x: this.arcR * Math.cos(this.deg(this.arcA)),
        y: this.arcR * Math.sin(this.deg(this.arcA))
      }
    },
    weightArc() {
      let r = this.arcR;
      let x1 = r * Math.cos(this.deg(150))
      let y1 = r * Math.sin(this.deg(150))
      let x2 = r * Math.cos(this.deg(210))
      let y2 = r * Math.sin(this.deg(210))
      return `M ${x1}, ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
    },
    ctrlProxy() {
      let $this = this;
      let point = {x: this.hotspot.x, y: this.hotspot.y - this.hotspot.r}
      return new Proxy(point, {
        get(target, prop) {
          if (prop == "x")
            return $this.hotspot.x
          else if (prop == "y")
            return $this.hotspot.y - $this.hotspot.r
        },
        set(target, prop, v) {
          target[prop] = v;
          $this.object.r = dist($this.hotspot.x, $this.hotspot.y, target.x, target.y)
          $this.object.r = round($this.object.r, 10)
          return true;
        }
      })
    },
    weightProxy() {
      let $this = this;
      let point = {...this.arcPos}
      return new Proxy(point, {
        get(target, prop) {
          if (prop == "x")
            return $this.arcPos.x
          else if (prop == "y")
            return $this.arcPos.y
        },
        set(target, prop, v) {
          target[prop] = v;
          $this.object.weight *= dist(0, 0, target.x, target.y) / $this.arcR
          if (Math.abs($this.object.weight - 50) < 5) $this.object.weight = 50
          $this.object.weight = round($this.object.weight, 10)
          $this.object.reduce = (120 - Math.atan2(-target.x, -target.y)*360/Math.PI/2) / 60 * 100
          if (Math.abs($this.object.reduce - 50) < 5) $this.object.reduce = 50
          $this.object.reduce = round($this.object.reduce, 10)
          return true;
        }
      })
    }
  },
  methods: {
    selectHotspot() {
      this.$emit("select")
    },
    deg(r) {
      return r * Math.PI * 2 / 360;
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
  color: #505050;
}
.selected .hotspot.selected {
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
