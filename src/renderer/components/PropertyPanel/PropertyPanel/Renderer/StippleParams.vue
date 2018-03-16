<template>
  <div>
    <div class="settings-dimensions dimen-row-4" >
      <div class="dimen">
        <input type="button" :value="running ? 'Stop' : 'Start'" @click="togglePrim()"/>
      </div>
      <div class="dimen">
        <input type="button" :value="running ? paused ? 'Resume' : 'Pause' : 'Next'" @click="toggleSnd()" />
      </div>
    </div>
    <div class="stipple-status" v-if="params.status">
      <i class="fa fa-compass"></i>
      <span>
        <b>Iteration:</b> {{params.status.iteration}}
        <br />
        <b>Points:</b> {{params.status.points}}
        <b>Quality:</b> {{params.status.quality.toFixed(2)}}
        <br/>
        <b>Splits:</b> {{params.status.splits}}
        <b>Merges:</b> {{params.status.merges}}
      </span>
    </div>
    <img class="voronoi" :src="params.voronoi" />
  </div>
</template>

<script>

export default {
  props: ["params"],
  data: () => ({
    running: false,
    paused: false
  }),
  methods: {
    cmd(cmd) {
      this.$emit("cmd", {cmd})
    },
    togglePrim() {
      this.running = !this.running;
      if (!this.running) this.paused = false;
      this.cmd(this.running ? "start" : "stop")
    },
    toggleSnd() {
      if (this.running) {
        this.paused = !this.paused;
        this.cmd(this.paused ? "pause" : "resume")
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
