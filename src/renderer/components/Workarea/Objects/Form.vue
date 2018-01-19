<template>
  <g :id="id" :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'" v-dragable>
    <rect v-if="object.type=='rect'":x="x" :y="y" :width="w" :height="h"></rect>
    <ellipse v-if="object.type=='ellipse'":cx="x+w/2" :cy="y+h/2" :rx="w/2" :ry="h/2"></ellipse>
    <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>
  </g>
</template>

<script>

  import SelectBox from "./SelectBox.vue"
  import BaseObject from "./BaseObject.vue"

  export default {
    components: {SelectBox},
    extends: BaseObject
  }


</script>

<style>

</style>
