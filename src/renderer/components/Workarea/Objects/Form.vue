<template>
  <g :id="id" v-dragable>
    <path :d="path" v-for="path in object.paths"></path>
    <g v-if="!fullPreview" :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'">
      <rect v-if="object.type=='rect'" x="0" y="0" :width="w" :height="h" class="form"></rect>
      <ellipse v-if="object.type=='ellipse'" :cx="w/2" :cy="h/2" :rx="w/2" :ry="h/2" class="form"></ellipse>
      <path v-if="object.type == 'triangle'" :d="'M0 '+h+' L'+(w*d)+' 0 L'+w+' '+h+' L0 '+h" class="form"></path>
      <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>

      <circle v-if="selected && object.type == 'triangle'" :cx="w*d" cy="0" :r="r*1.5" v-dragable.nosnap="tripoint" class="tri-point"></circle>
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
    computed: {
      selected() { return this.$store.state.selectedObject == this.id; },
      fullPreview() { return this.$store.state.fullPreview; },
      d() { return this.object.d; },
      r() { return 3 / this.$store.state.project.zoom },
      tripoint() {
        let obj = this.object, commit = this.$store.commit;
        let p = rotate({x: obj.x + obj.w * obj.d, y: obj.y}, obj, true)
        p.put = () => {
          commit("putObject", {id: obj.id})
        }
        let update = () => {
          let pd = rotate(p, obj, false)
          let d = Math.max(0, Math.min(1, (pd.x - obj.x) / obj.w))
          commit("updateObjectSilent", {
            id: obj.id, d
          })
        }
        return new Proxy(p, {
          get(target, prop) {
            if (prop == "x" || prop == "y") {
              let tp = rotate({x: obj.x + obj.w * obj.d, y: obj.y}, obj, true)
              target.x = tp.x
              target.y = tp.y
              return target[prop]
            } else if (["w", "h", "id"].indexOf(prop) >= 0) {
              return obj[prop]
            } else if (prop == "put") {
              return target.put
            }
          },
          set(target, prop, v) {
            if (prop == "x" || prop == "y") {
              target[prop] = v;
              update();
            }
            return true;
          }
        })
      }
    }
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
