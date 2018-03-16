<template>
  <div id="root-layers">
    <div class="layer-item" :class="[selectedObject=='machine'?'selected':'']" @click="openSublayers">
      <i class="fa fa-fw fa-folder"></i>
      Fräsbereich
      <span>
        <i class="fa fa-fw fa-cog" @click.stop="selectObject('machine')"></i>
      </span>
    </div>
    <div class="layer-item" v-for="layer in layers" :class="[selectedObject==layer.id?'selected':'']" @click="selectObject(layer.id)">
      <i class="fa fa-fw" :class="layer.icon"></i>
      {{layer.title}}
      <span>
        <i class="fa fa-fw fa-trash-alt" @click.stop="removeObject(layer.id)"></i>
      </span>
    </div>
  </div>
</template>


<script>

  import {HalftoneRenderer} from "@/models.js"
  import {SelectObject, Icon} from "@/mixins.js"

  export default {
    mixins: [SelectObject, Icon],
    computed: {
      selectedObject() {
        return this.$store.state.selectedObject
      },
      layers() {
        return this.$store.state.renderer.map(c => ({...c, icon: this.icon(c)}))
          .concat(this.$store.state.images.map(i => ({...i, icon: this.icon(i)})))
          .concat(this.$store.state.texts.map(t => ({...t, icon: this.icon(t)})))
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

.fa-cog {
  transition: transform 4s;
}

.fa-cog:hover {
  transform: rotate(180deg)
}

</style>
