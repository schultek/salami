<template>
  <g :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'" v-dragable>
    <image :id="id" x="0" y="0" :width="w" :height="h" :xlink:href="object.data" preserveAspectRatio="none"></image>
    <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>
  </g>
</template>

<script>

  import SelectBox from './SelectBox.vue'
  import BaseObject from './BaseObject.vue'

  export default {
    components: {SelectBox},
    extends: BaseObject
  }


</script>

<style>

image {
  opacity: 0.4
}

</style>
