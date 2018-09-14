<template>
  <div id="root-layers" class="layer-list">
    <div class="layer-item" :class="[selectedObject=='machine'?'selected':'']" @click="openSublayers">
      <fa-icon icon="folder" class="icon" fixed-width></fa-icon>
      <span>Layers</span>
      <span class="stretch"></span>
      <span @click.stop="selectObject('machine')">
        <fa-icon icon="cog" fixed-width></fa-icon>
      </span>
    </div>
    <div class="layer-item" v-for="layer in layers" :class="[selectedObject==layer.id?'selected':'']" @click="selectObject(layer.id)">
      <Icon :for="layer"></Icon>
      <span>{{layer.title}}</span>
      <span class="stretch"></span>
      <span>
        <fa-icon icon="trash-alt" fixed-width @click.stop="removeObject(layer.id)"></fa-icon>
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
