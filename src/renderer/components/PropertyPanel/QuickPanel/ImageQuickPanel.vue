<template>
  <div class="settings-panel">
    <div class="settings-header">
      <span>{{image.title}}</span>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <input id="imageInput" type="button" value="Datei auswählen" @click="loadImage" style="width: auto"/>
      </div>
      <div v-show="image.data" class="dimen" style="height: auto">
        <img id="preview" :src="image.data" width="100%" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  props: ["id"],
  computed: {
    image: {
      get() {
        return this.$store.getters.getObjectById(this.id)
      },
      set(l) {
        this.$store.commit("updateObject", l);
      }
    }
  },
  methods: {
    loadImage() {
      this.$store.dispatch("loadNewImage", this.id)
    }
  }
}

</script>

<style>

</style>
