<template>
  <div id="root-layers">
    <div class="layer-item" :class="[selectedObject=='machine'?'selected':'']" @click="openSublayers">
      <i class="fa fa-fw fa-folder"></i>
      Fräsbereich
      <span>
        <i class="fa fa-fw fa-cog" @click.stop="selectLayer('machine')"></i>
      </span>
    </div>
    <div class="layer-item" v-for="layer in layers" :class="[selectedObject==layer.id?'selected':'']" @click="selectLayer(layer.id)">
      <i class="fa fa-fw" :class="'fa-'+layer.icon"></i>
      {{layer.title}}
      <span>
        <i class="fa fa-fw fa-trash-alt" @click.stop="removeLayer(layer.id)"></i>
      </span>
    </div>
  </div>
</template>


<script>

  export default {
    computed: {
      selectedObject() {
        return this.$store.state.selectedObject
      },
      layers() {
        let layers = this.$store.getters.getObjectsByType
        return layers.curves.map(c => ({...c, icon: "leaf"}))
          .concat(layers.images.map(i => ({...i, icon: "image"})))
          .concat(layers.texts.map(t => ({...t, icon: "font"})))
      }
    },
    methods: {
      selectLayer(id) {
        this.$store.commit("selectObject", id)
      },
      openSublayers() {
        this.$store.commit("setSubLayersOpen", true);
      },
      removeLayer(id) {
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
