<template>
  <div class="settings-panel">
    <div class="settings-header">
      <span>{{layer.title}}</span>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen" v-show="curves.length>1">
        <span>Kurve</span>
        <select v-model="layer.render.curve">
          <option :value="curve.id" v-for="curve in curves">
            {{curve.title}}
          </option>
        </select>
      </div>
      <div class="dimen" v-show="images.length>1">
        <span>Bild</span>
        <select v-model="layer.render.image">
          <option :value="image.id" v-for="image in images">
            {{image.title}}
          </option>
        </select>
      </div>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>Linien</span><span>L</span><input type="number" v-model.number.lazy="layer.render.lines.l" v-blur/>
      </div>
      <div class="dimen">
        <span>R</span><input type="number" v-model.number.lazy="layer.render.lines.r" v-blur/>
      </div>
      <div class="dimen">
        <input type="button" value="Füllen" @click="fillLayer"/>
      </div>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>Punkte</span><input type="checkbox" v-model="layer.render.dotted" />
      </div>
      <div class="dimen">
        <span><icon name="adjust"></icon></span><input type="checkbox" v-model="layer.inverted"/>
      </div>
    </div>
    <div v-if="layer.gcode" class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>Benötigte Zeit</span><span>{{asTimeString(layer.gcode.time)}}</span>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    props: ["id"],
    computed: {
      layer: {
        get() {
          return this.$store.getters.getObjectById(this.id)
        },
        set(l) {
          this.$store.commit("updateObject", l);
        }
      },
      objects() {
        return this.$store.getters.getObjectsByType
      },
      curves() {
        return this.objects.curves
      },
      images() {
        return this.objects.images
      }
    },
    methods: {
      fillLayer() {
        this.$store.dispatch("fillLinesForLayer", id)
      }
    }
  }

</script>

<style>

</style>
