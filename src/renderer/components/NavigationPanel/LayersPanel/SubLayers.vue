<template>
  <draggable v-model="layers" :options="{class: '.layer-item'}">
    <transition-group>
      <div class="layer-item" :key="layer.id" :class="[selectedObject==layer.id?'selected':'']" v-for="(layer, index) in layers" @click="selectObject(layer.id)">
        <i class="fa fa-fw" :class="icon(layer)"></i>
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
  import {CPart} from "@/models.js"
  import {SelectObject, Icon} from "@/mixins.js"

  export default {
    components: {draggable},
    mixins: [SelectObject, Icon],
    computed: {
      selectedObject() {
        return this.$store.state.selectedObject
      },
      layers: {
        get() {
          return this.reverse(this.$store.state.layers)
        },
        set(l) {
          this.$store.commit("updateLayerOrder", this.reverse(l))
        }
      }
    },
    methods: {
      removeLayer(id) {
        this.$store.dispatch("removeObject", id)
      },
      reverse(array) {
        return array.reduce((arr, o) => [o].concat(arr), [])
      }
    }
  }

</script>
