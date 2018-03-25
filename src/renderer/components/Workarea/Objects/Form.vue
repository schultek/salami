<template>
  <g :id="id" v-dragable>
    <g :transform="'translate('+x+' '+y+')'">
      <path :d="path" v-for="path in paths"></path>
    </g>
    <g v-if="!fullPreview">
      <g :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'">
        <rect v-if="object.type=='rect'" x="0" y="0" :width="w" :height="h" class="form"></rect>
        <ellipse v-if="object.type=='ellipse'" :cx="w/2" :cy="h/2" :rx="w/2" :ry="h/2" class="form"></ellipse>
        <path v-if="object.type == 'triangle'" :d="'M0 '+h+' L'+(w*d)+' 0 L'+w+' '+h+' L0 '+h" class="form"></path>
        <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>

        <circle v-if="selected && object.type == 'triangle'" :cx="w*d" cy="0" :r="r*1.5" v-dragable.point="tripoint" class="tri-point"></circle>
      </g>
      <g class="stroked" v-if="object.type == 'polygon'">
        <polygon :points="pointsStr" class="form" :transform="'rotate('+rot+' '+(x+w/2)+' '+(y+h/2)+')'"></polygon>
        <circle v-if="selected" v-for="point in points" :cx="point.x" :cy="point.y" :r="r" :style="{strokeWidth: 1/zoom}" v-dragable.point="point"></circle>
      </g>

    </g>
  </g>
</template>

<script>

  import SelectBox from "./Parts/SelectBox.vue"
  import BaseObject from "./Parts/BaseObject.vue"

  import {rotate} from "@/functions.js"

  export default {
    components: {SelectBox},
    extends: BaseObject,
    data: () => ({
      tripoint: null,
      points: null
    }),
    created() {
      this.tripoint = getPointProxy({dx: this.object.d, dy: 0}, this.object, (p) => {
        p.dy = 0;
        this.$store.commit("updateObjectSilent", {id: this.object.id, d: p.dx})
      }, () => {
        this.$store.commit("putObject", {id: this.object.id})
      })
      if (this.object.points)
        this.points = this.object.points.map((p, i) => getPointProxy({dx: p.x, dy: p.y}, this.object, (p) => {
          this.$store.commit("updateObjectSilent", {id: this.object.id, points: {[i] : {x: p.dx, y: p.dy}}})
        }, () => {
          this.$store.commit("putObject", {id: this.object.id})
        }))
    },
    computed: {
      selected() { return this.$store.state.selectedObject == this.id; },
      fullPreview() { return this.$store.state.fullPreview; },
      d() { return this.object.d; },
      r() { return 3 / this.zoom },
      zoom() { return this.$store.state.project.zoom },
      pointsStr() {
        return this.object.points ? this.object.points.map(p => (this.object.x + p.x * this.object.w)+","+(this.object.y + p.y * this.object.h)).join(" ") : ""
      },
      paths() {
        return this.object.renderParams.map(p => p.path)
      }
    }
  }

  function getPointProxy(p, obj, update, put) {
    let pos = rotate({x: obj.x + obj.w * p.dx, y: obj.y + obj.h * p.dy}, obj, true)
    p.x = pos.x
    p.y = pos.y
    return new Proxy({}, {
      get(target, prop) {
        if (prop == "x" || prop == "y") {
          let pos = rotate({x: obj.x + obj.w * p.dx, y: obj.y + obj.h * p.dy}, obj, true)
          p.x = pos.x
          p.y = pos.y
          return p[prop]
        } else if (prop == "put") {
          return put
        } else {
          return obj[prop]
        }
      },
      set(target, prop, v) {
        if (prop == "x" || prop == "y") {
          p[prop] = v;
          let pos = rotate(p, obj, false)
          p.dx = Math.max(0, Math.min(1, (pos.x - obj.x) / obj.w))
          p.dy = Math.max(0, Math.min(1, (pos.y - obj.y) / obj.h))
          update(p);
        }
        return true;
      }
    })
  }


</script>

<style>

  .form {
    stroke: #bbb;
    stroke-dasharray: 5px 10px;
    strokeWidth: 1;
    fill: transparent;
  }

  .tri-point {
    fill: #008dea;
  }

</style>
