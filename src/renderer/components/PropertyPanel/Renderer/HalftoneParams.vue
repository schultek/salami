<template>
  <div class="settings-dimensions halftone-params">
    <div class="lines">
      <div class="dimen">
        <span class="title">Lines</span>
      </div>
      <Dimen title="L" type="number" v-model="params.lines.l"></Dimen>
      <Dimen title="R" type="number" v-model="params.lines.r"></Dimen>
      <div class="dimen">
        <input type="button" value=" Fill " @click="fillLines"/>
      </div>
    </div>
    <Dimen title="Dots" type="checkbox" v-model="params.dotted"></Dimen>
  </div>
</template>

<script>

import Dimen from "../Dimen.vue"

export default {
  props: ["params"],
  components: {Dimen},
  methods: {
    fillLines() {
      this.$emit("cmd", {cmd: "fill"})
    }
  }
}

</script>

<style>

.halftone-params .dimen {
  width: 30%;
}

.lines {
  display: flex;
  flex-flow: row nowrap;
}
.lines .dimen:first-child {
  width: auto;
}
.lines .input {
  width: 70%;
}

</style>
