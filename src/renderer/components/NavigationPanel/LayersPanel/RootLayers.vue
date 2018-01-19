<template>
  <div id="root-layers">
    <div class="layer-item" :class="[selectedObject=='machine'?'selected':'']" @click="selectLayer('machine')" @dblclick="openSublayers">
      <icon name="folder"></icon>
      Fräsbereich
      <span class="sublayer_link"><icon name="angle-right" @click.stop="openSublayers"></icon></span>
    </div>
    <div class="layer-item" v-for="layer in layers" :class="[selectedObject==layer.id?'selected':'']" @click="selectLayer(layer.id)">
      <icon :name="layer.icon"></icon>
      {{layer.title}}
      <span>
        <icon name="trash-o" @click.stop="removeLayer(layer.id)" scale="0.9"></icon>
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
          .concat(layers.images.map(i => ({...i, icon: "picture-o"})))
          .concat(layers.texts.map(t => ({...t, icon: "font"})))
      }
    },
    methods: {
      selectLayer(id) {
        this.$store.commit("selectObject", id)
      },
      openSublayers() {
        this.selectLayer(null) //TODO fix doubleclick
        this.$store.commit("setSubLayersOpen", true);
      },
      removeLayer(id) {
        this.$store.dispatch("removeObject", id)
      }
    }
  }

</script>
