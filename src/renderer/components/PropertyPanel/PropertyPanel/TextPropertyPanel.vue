<template>
  <div>
    <div class="settings-title">
      <span>Text <input type="text" v-model.lazy="object.title" v-blur/></span>
      <icon name="trash-o" @click="removeObject"></icon>
    </div>
    <div class="settings-dimensions dimen-row-3">
      <div class="dimen">
        <span>X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
      </div>
      <div class="dimen">
        <span>Y</span><input type="number" v-model.number.lazy="object.y" v-blur/>
      </div>
      <div class="dimen">
        <span><icon name="repeat"></icon></span><input type="number" v-model.number.lazy="object.rot" @change="mapRotation('rot')"  v-blur/>
      </div>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>Size</span><input type="number" v-model.number.lazy="object.size" v-blur/>
      </div>
      <div class="dimen">
        <span>Stroke</span><input type="number" v-model.number.lazy="object.stroke" step=".1" v-blur/>
      </div>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>Font</span>
        <select v-model="object.font">
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

  import BasePropertyPanel from "./BasePropertyPanel.vue"

  export default {
    extends: BasePropertyPanel,
    computed: {
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
