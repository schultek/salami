<template>
  <div class="settings-dimensions" :class="['dimen-row-'+row, fw ? 'fw' : '']">
    <Dimen v-for="dimen in dimens_" v-model="object[dimen.prop]" :key="dimen.prop" :type="dimen.type" :title="dimen.title" :unit="dimen.unit" :options="dimen.options"></Dimen>
  </div>
</template>

<script>

import {createProxy} from "@/mixins.js"
import Dimen from "../Dimen.vue"

function getDefault(rot) {
  let dimens = [
    {title: "B", prop: "w", type: "number", unit: "mm"},
    {title: "X", prop: "x", type: "number", unit: "mm"},
    {title: "H", prop: "h", type: "number", unit: "mm"},
    {title: "Y", prop: "y", type: "number", unit: "mm"}
  ]
  if (rot) {
    dimens.splice(2, 0, {title: "fa-redo", prop: "rot", type: "number", unit: "deg"})
  }
  return dimens
}

export default {
  props: {
    row: {
      type: [Number, String]
    },
    fw: {
      type: Boolean,
      default: false
    },
    dimens: {
      type: [Array, String],
      default: () => getDefault(false)
    },
    add: {
      type: [Object, Array],
      default: () => []
    },
    id: String
  },
  components: {Dimen},
  computed: {
    dimens_() {
      let d;
      if (typeof this.dimens === "string") {
        if (this.dimens == "default") d = getDefault(false)
        else if (this.dimens == "rotation") d = getDefault(true)
        else d = this.dimens
      } else d = this.dimens
      if (this.add instanceof Array) {
        this.add.forEach(a => d.push())
      } else {
        d.push(this.add)
      }
      return d
    },
    object: {
      get() {
        let o = this.$store.getters.getObjectById(this.id);
        return createProxy(o, obj => {
          this.$store.commit("updateObject", {id: this.id, ...obj})
        })
      },
      set(o) {
        this.$store.commit("updateObject", o)
      }
    }
  }
}

</script>

<style>

.fw .dimen .title {
  text-align: right;
  width: 50%;
}

.fw.dimen-row-2 .dimen .title { width: 40%; }
.fw.dimen-row-3 .dimen .title { width: 30%; }
.fw.dimen-row-4 .dimen .title { width: 20%; }

</style>
