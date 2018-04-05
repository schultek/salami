<template>
  <g :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'" @dblclick="loadImage" v-dragable>
    <image :id="id" x="0" y="0" :width="w" :height="h" :class="selected ? 'selected' : opac ? 'opac' : ''":xlink:href="object.data" preserveAspectRatio="none"></image>
    <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>
  </g>
</template>

<script>

  import SelectBox from './Parts/SelectBox.vue'
  import BaseObject from './Parts/BaseObject.vue'

  export default {
    components: {SelectBox},
    extends: BaseObject,
    computed: {
      selected() {
        return this.$store.state.selectedObject == this.id;
      },
      opac() {
        return  !this.$store.state.selectedObject && this.$store.state.selectedTool == "select"
      }
    },
    methods: {
      loadImage() {
        this.$store.commit("selectObject", null)
        this.$store.dispatch("loadNewImage", this.id)
      }
    }
  }


</script>

<style>

image {
  transition: opacity .5s;
  opacity: 0.3
}

image.opac:hover, image.selected {
  opacity: 0.8
}

</style>
