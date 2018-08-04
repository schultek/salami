<template>
  <div class="sidepanel panel">
    <div id="layer-heading">
      <span>Workarea</span>
    </div>
    <div class="layer-item" @click="toggleLayers">
      <i class="fa fa-fw icon" :class="openLayers?'fa-folder-open' : 'fa-folder'"></i>
      <span>Layers</span>
      <span></span>
    </div>
    <div class="layer-folder" v-show="openLayers">
      <draggable v-model="layers" :options="{class: '.layer-item'}" class="layer-list">
        <transition-group>
          <div class="layer-item" :key="layer.id" :class="[selectedObject==layer.id?'selected':'']" v-for="(layer, index) in layers" @click="selectObject(layer.id)">
            <Icon :for="layer"></Icon>
            <span>{{layer.title}}</span>
            <span class="stretch"></span>
            <span>
              <i class="fa fa-fw fa-bars"></i>
              <i class="fa fa-fw fa-trash-alt" @click.stop="removeObject(layer.id)"></i>
            </span>
          </div>
        </transition-group>
      </draggable>
    </div>
    <div id="root-layers" class="layer-list">
      <div class="layer-item" v-for="layer in rootlayers" :class="[selectedObject==layer.id?'selected':'']" @click="selectObject(layer.id)">
        <Icon :for="layer"></Icon>
        <span>{{layer.title}}</span>
        <span class="stretch"></span>
        <span>
          <i class="fa fa-fw" :class="layer.visible?'fa-eye':'fa-eye-slash'" @click.stop="toggleVisible(layer)"></i>
          <i class="fa fa-fw fa-trash-alt" @click.stop="removeObject(layer.id)"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

  import draggable from "vuedraggable"
  import Icon from "@/components/Icon.vue"
  import {SelectObject} from "@/mixins.js"

  export default {
    components: {draggable, Icon},
    mixins: [SelectObject],
    data: () => ({
      openLayers: false
    }),
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
      },
      rootlayers() {
        return this.$store.state.renderer
          .concat(this.$store.state.images)
      }
    },
    watch: {
      selectedObject(id) {
        if (id && this.$store.getters.isLayerById(id))
          this.openLayers = true;
      }
    },
    methods: {
      removeObject(id) {
        this.$store.dispatch("removeObject", id)
      },
      reverse(array) {
        return array.reduce((arr, o) => [o].concat(arr), [])
      },
      toggleLayers() {
        this.openLayers = !this.openLayers;
      },
      toggleVisible(layer) {
        this.$store.commit("updateObject", {id: layer.id, visible: !layer.visible})
      }
    }
  }

</script>

<style>

.sidepanel {
  width: 200px;
  border-right-style: solid;
  position: relative;
  display: flex;
  flex-flow: column nowrap;
}

#layer-heading {
  height: 40px;
  width: 100%;
  margin-left: 15px;
  color: #959595;
  display: flex;
  align-items: center;
}

#layer-heading i {
  margin-right: 5px;
}

#layer-heading span {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
}

#layer-heading:hover i {
  color: #008dea;
}

.layer-list {
  overflow: scroll;
  padding-bottom: 20px;
}

.layer-folder .layer-list {
  padding-bottom: 0;
}

.layer-item {
  padding-left: 15px;
  font-size: 12px;
  height: 25px;
  display: flex;
  align-items: center;
  position: relative;
}

.layer-folder .layer-item {
  padding-left: 25px;
}

.layer-item.selected {
  background-color: #ededed;
}

.layer-item .icon {
  margin-right: 5px;
  flex-shrink: 0;
}


.layer-item span:first-of-type {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-item .stretch {
  flex-grow: 1;
}

.layer-item span:last-of-type {
  color: #aaa;
  margin-right: 5px;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.layer-item span:last-of-type i {
  margin: 0 2px;
}

.layer-item span i:hover {
  color: #555;
}

</style>
