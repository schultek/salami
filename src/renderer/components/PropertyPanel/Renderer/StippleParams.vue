<template>
  <div>
    <div class="settings-dimensions dimen-row-4" >
      <div class="dimen">
        <input type="button" :value="params.running ? 'Stop' : 'Start'" @click="togglePrim()"/>
      </div>
      <div class="dimen">
        <input type="button" :value="params.running ? params.paused ? 'Resume' : 'Pause' : 'Next'" @click="toggleSnd()" />
      </div>
      <Dimen type="checkbox" title="Preview" v-model="params.preview"></Dimen>
    </div>
    <div class="stipple-status" v-if="params.status">
      <i class="fa fa-compass"></i>
      <span>
        <b>Iteration:</b> {{params.status.iteration}}
        &nbsp;&nbsp;
        <b>Points:</b> {{params.status.points}}
        <br/>
        <b>Splits:</b> {{params.status.splits}}
        &nbsp;&nbsp;
        <b>Merges:</b> {{params.status.merges}}
      </span>
    </div>
    <img class="voronoi" :src="params.voronoi" />
  </div>
</template>

<script>

import Dimen from "../Dimen.vue"

export default {
  props: ["params"],
  components: {Dimen},
  methods: {
    cmd(cmd) {
      this.$emit("cmd", {cmd})
    },
    togglePrim() {
      this.params.running = !this.params.running;
      if (!this.params.running) this.params.paused = false;
      this.cmd(this.params.running ? "start" : "stop")
    },
    toggleSnd() {
      if (this.params.running) {
        this.params.paused = !this.params.paused;
        this.cmd(this.params.paused ? "pause" : "resume")
      } else {
        this.cmd("next")
      }
    }
  }
}

</script>

<style>

.stipple-status {
  background: #ededed;
  font-size: 12px;
  padding: 5px;
  border-left: 3px solid #008dea;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  margin: 0 -10px;
}

.stipple-status i {
  margin: 5px
}

.voronoi {
  width: 100%;
}

</style>
