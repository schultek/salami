<template>
  <div id="corner-tools">
    <vue-slider v-model="zoom" v-bind="sliderOptions"></vue-slider>
    <div class="corner-action" @click="centerProject">
      <icon name="compress"></icon>
    </div>
  </div>
</template>

<script>

  import vueSlider from 'vue-slider-component'

  export default {
    data: () => ({
      sliderOptions: {
        direction: "vertical",
        dotSize: 10, width: 2, height: 80,
        min: 0, max: 19.9, interval: 0.1,
        tooltip: false,
        bgStyle: { background: "#ccc" },
        sliderStyle: { background: "#444" },
        processStyle: { background: "#ccc" }
      }
    }),
    components: { vueSlider },
    computed: {
      zoom: {
        get() {
          let z = this.$store.state.project.zoom;
          let zz = 20-Math.cbrt(z/0.0025)
          return zz
        },
        set(z) {
          let zz = Math.pow(20-z, 3)*0.0025
          this.$store.commit("zoomProject", zz)
        }
      }
    },
    methods: {
      centerProject() {
        this.$store.dispatch("centerProject")
      }
    }
  }

</script>

<style>

#corner-tools {
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background: rgba(229,229,229,.8);
  border-radius: 0 0 0 10px;
}

.corner-action {
  margin: 5px;
  color: #444;
  font-size: 14px;
}

</style>
