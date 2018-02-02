<template>
  <g :id="id" v-dragable>
    <transition-group name="fade" tag="g" v-if="paths">
      <path :d="path.path" :key="path.k" v-for="(path,i) in paths"></path>
    </transition-group>
    <g :transform="'translate('+x+' '+y+') rotate('+rot+' '+(w/2)+' '+(h/2)+')'">
      <rect v-if="object.type=='rect'" x="0" y="0" :width="w" :height="h" class="form"></rect>
      <ellipse v-if="object.type=='ellipse'" :cx="w/2" :cy="h/2" :rx="w/2" :ry="h/2" class="form"></ellipse>
      <SelectBox :id="id" can-rotate="true" can-resize="true"></SelectBox>
    </g>
  </g>
</template>

<script>

  import SelectBox from "./SelectBox.vue"
  import BaseObject from "./BaseObject.vue"

  export default {
    components: {SelectBox},
    extends: BaseObject,
    computed: {
      paths() {
        return this.$store.getters.getPathById(this.id)
      }
    }
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
