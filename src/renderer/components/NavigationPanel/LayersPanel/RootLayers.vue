<template>
  <div id="root-layers">
    <div class="layer-item" :class="[selectedObject=='machine'?'selected':'']" @click="openSublayers">
      <i class="fa fa-fw fa-folder icon"></i>
      <span>Layers</span>
      <span class="stretch"></span>
      <span>
        <i class="fa fa-fw fa-cog" @click.stop="selectObject('machine')"></i>
      </span>
    </div>
    <div class="layer-item" v-for="layer in layers" :class="[selectedObject==layer.id?'selected':'']" @click="selectObject(layer.id)">
      <Icon :for="layer"></Icon>
      <span>{{layer.title}}</span>
      <span class="stretch"></span>
      <span>
        <i class="fa fa-fw fa-trash-alt" @click.stop="removeObject(layer.id)"></i>
      </span>
    </div>
  </div>
</template>


<script>

  import {HalftoneRenderer} from "@/models.js"
  import {SelectObject} from "@/mixins.js"

  import Icon from "@/components/Icon.vue"

  export default {
    mixins: [SelectObject],
    components: {Icon},
    computed: {
      selectedObject() {
        return this.$store.state.selectedObject
      },
      layers() {
        return this.$store.state.renderer
          .concat(this.$store.state.images)
          .concat(this.$store.state.texts)
      }
    },
    methods: {
      openSublayers() {
        this.$store.commit("setSubLayersOpen", true);
      },
      removeObject(id) {
        this.$store.dispatch("removeObject", id)
      }
    }
  }

</script>

<style>

</style>
