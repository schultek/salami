<template>
  <div id="corner-tools">
    <vue-slider v-model="zoom" v-bind="sliderOptions"></vue-slider>
    <div class="corner-action" @click="centerProject">
      <i class="fa fa-expand"></i>
    </div>
  </div>
</template>

<script>

  import $ from "jquery"
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
          return 20-Math.cbrt(z/0.0025)
        },
        set(z) {
          let zoom = Math.pow(20-z, 3)*0.0025

          let centered = this.$store.state.centered;

          let pos = {x: $("#workarea").position().left, y: $("#workarea").position().top}
          let e = {
            x: pos.x + $("#workarea").width()/2,
            y: pos.y + $("#workarea").height()/2
          }
          var p = this.$store.getters.getLocalPosition(e);

          let x = e.x-(p.x*zoom)-pos.x;
          let y = e.y-(p.y*zoom)-pos.y;

          this.$store.commit("translateProject", {x, y})
          this.$store.commit("zoomProject", zoom)

          if (centered) this.$store.commit("setCentered", true)

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

.vue-slider-dot {
  box-shadow: none !important;
}

.vue-slider-dot:hover {
  box-shadow: 0 0 10px 0 rgba(0,0,0,.5) !important;
}

 .fa-expand:hover {
   color: #008dea;
 }

</style>
