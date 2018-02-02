<template>
  <draggable v-model="layers" :options="{class: '.layer-item'}">
    <transition-group>
      <div class="layer-item" :key="layer.id" :class="[selectedObject==layer.id?'selected':'']" v-for="(layer, index) in layers" @click="selectLayer(layer.id)">
        <i class="fa fa-fw" :class="'fa-'+icon(layer)"></i>
        {{layer.title}}
        <span>
          <i class="fa fa-trash-alt" @click.stop="removeLayer(layer.id)"></i>
          <i class="fa fa-fw fa-bars"></i>
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
          return this.reverse(this.$store.getters.getObjectsByType.layers)
        },
        set(l) {
          this.$store.commit("updateLayerOrder", this.reverse(l))
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
        return layer.is == "cpart" ? "th-large" : layer.type == "rect" ? "square" : layer.type == "ellipse" ? "circle" : ""
      },
      reverse(array) {
        return JSON.parse(JSON.stringify(array)).reverse()
      }
    }
  }

</script>
