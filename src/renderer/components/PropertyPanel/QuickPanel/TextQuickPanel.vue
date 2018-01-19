<template>
  <div class="settings-panel">
    <div class="settings-header">
      <span>Titel <input type="text" v-model.lazy="text.title" v-blur/></span>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>Size</span><input type="number" v-model.number.lazy="text.size" v-blur/>
      </div>
      <div class="dimen">
        <span>Stroke</span><input type="number" v-model.number.lazy="text.stroke" step=".1" v-blur/>
      </div>
      <div class="dimen">
        <span>Font</span>
        <select v-model="text.font">
          <option v-for="font in fonts" :value="font.id">
            {{font.title}}
          </option>
        </select>
      </div>
      <div class="dimen">
        <input type="button" @click="loadFont" value="Load"/>
      </div>
    </div>
    </div>
</template>

<script>

export default {
  props: ["id"],
  computed: {
    text: {
      get() {
        return this.$store.getters.getObjectById(this.id)
      },
      set(t) {
        this.$store.commit("updateObject", t);
      }
    },
    fonts() {
      return this.$store.state.fonts
    }
  },
  methods: {
    loadFont() {
      this.$store.dispatch("loadNewFont")
    }
  }
}

</script>

<style>

</style>
