<template>
  <g :id="id" v-dragable>
    <path :d="path" v-for="path in object.paths"></path>
    <g :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'">
      <rect v-if="object.type=='rect'" x="0" y="0" :width="w" :height="h" class="form"></rect>
      <ellipse v-if="object.type=='ellipse'" :cx="w/2" :cy="h/2" :rx="w/2" :ry="h/2" class="form"></ellipse>
      <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>
    </g>
  </g>
</template>

<script>

  import SelectBox from "./Parts/SelectBox.vue"
  import BaseObject from "./Parts/BaseObject.vue"

  export default {
    components: {SelectBox},
    extends: BaseObject,
  }


</script>

<style>

  .form {
    stroke: #bbb;
    stroke-dasharray: 5px 10px;
    strokeWidth: 1;
    fill: transparent;
  }

</style>
