<template>
  <draggable v-model="layers" :options="{handle: '.layer-move-bars', class: '.layer-item'}">
    <transition-group>
      <div class="layer-item" :key="layer.id" :class="[selectedObject==layer.id?'selected':'']" v-for="(layer, index) in layers" @click="selectLayer(layer.id)">
        <icon :name="icon(layer)"></icon>
        {{layer.title}}
        <span>
          <icon name="trash-o" @click.stop="removeLayer(layer.id)"></icon>
          <icon name="bars" class="layer-move-bars"></icon>
        </span>
      </div>
    </transition-group>
  </draggable>
</template>

<script>

  import draggable from "vuedraggable"

  export default {
    components: {draggable},
    computed: {
      selectedObject() {
        return this.$store.state.selectedObject
      },
      layers: {
        get() {
          return this.$store.getters.getObjectsByType.layers
        },
        set(l) {
          this.$store.commit("updateLayerOrder", l)
        }
      }
    },
    methods: {
      selectLayer(id) {
        this.$store.commit("selectObject", id)
      },
      removeLayer(id) {
        this.$store.dispatch("removeObject", id)
      },
      icon(layer) {
        return layer.is == "cpart" ? "th-large" : layer.type == "rect" ? "square-o" : layer.type == "ellipse" ? "circle-o" : ""
      }
    }
  }

</script>
