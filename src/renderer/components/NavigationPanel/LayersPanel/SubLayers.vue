<template>
  <draggable v-model="layers" :options="{class: '.layer-item'}">
    <transition-group>
      <div class="layer-item" :key="layer.id" :class="[selectedObject==layer.id?'selected':'']" v-for="(layer, index) in layers" @click="selectObject(layer.id)">
        <Icon :for="layer"></Icon>
        <span>{{layer.title}}</span>
        <span class="stretch"></span>
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
  import {Artboard} from "@/models.js"
  import {SelectObject} from "@/mixins.js"
  import Icon from "@/components/Icon.vue"

  export default {
    components: {draggable, Icon},
    mixins: [SelectObject],
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
