<template>
  <div>
    <div class="settings-title">
      <span>Title <input type="text" v-model.lazy="object.title" v-blur/></span>
      <i class="fa fa-trash-alt" @click="removeObject"></i>
    </div>
    <div class="settings-dimensions dimen-row-3">
      <div class="dimen">
        <span>B</span><input type="number" v-model.number.lazy="object.w" v-blur/>
      </div>
      <div class="dimen">
        <span>X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
      </div>
      <div class="dimen">
        <span><i class="fa fa-repeat"></i></span><input type="number" v-model.number.lazy="object.rot" v-blur/>
      </div>
      <div class="dimen">
        <span>H</span><input type="number" v-model.number.lazy="object.h" v-blur/>
      </div>
      <div class="dimen">
        <span>Y</span><input type="number" v-model.number.lazy="object.y" v-blur/>
      </div>
    </div>
    <div class="settings-dimensions dimen-row settings-panel">
      <div class="settings-header">
        <span>Datei</span>
      </div>
      <div class="dimen">
        <input id="imageInput" type="button" value="Datei auswählen" @click="loadImage" style="width: auto"/>
      </div>
      <div v-show="object.data" class="dimen" style="height: auto">
        <img id="preview" :src="object.data" width="100%" />
      </div>
    </div>
  </div>
</template>

<script>

  import BasePropertyPanel from "./BasePropertyPanel.vue"

  export default {
    extends: BasePropertyPanel,
    methods: {
      loadImage() {
        this.$store.dispatch("loadNewImage", this.id)
      }
    }
  }

</script>

<style>

</style>
