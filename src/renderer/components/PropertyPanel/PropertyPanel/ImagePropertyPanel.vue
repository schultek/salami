<template>
  <div>
    <div class="settings-title">
      <span>Title <input type="text" v-model.lazy="object.title" v-blur/></span>
      <i class="fa fa-trash-alt" @click="removeObject"></i>
    </div>
    <div class="settings-dimensions dimen-row-3">
      <div class="dimen">
        <span>B</span><input type="number" v-model.number.lazy="object.w" v-blur/>
      </div>
      <div class="dimen">
        <span>X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
      </div>
      <div class="dimen">
        <span><i class="fa fa-repeat"></i></span><input type="number" v-model.number.lazy="object.rot" v-blur/>
      </div>
      <div class="dimen">
        <span>H</span><input type="number" v-model.number.lazy="object.h" v-blur/>
      </div>
      <div class="dimen">
        <span>Y</span><input type="number" v-model.number.lazy="object.y" v-blur/>
      </div>
    </div>
    <div class="settings-dimensions dimen-row settings-panel">
      <div class="settings-header">
        <span>Datei</span>
      </div>
      <div class="dimen">
        <input id="imageInput" type="button" value="Datei auswählen" @click="loadImage" style="width: auto"/>
      </div>
      <div v-show="object.data" class="dimen" style="height: auto">
        <img id="preview" :src="object.data" width="100%" />
      </div>
    </div>
    <div class="settings-panel linked-layer-list">
      <div class="settings-header">
        <span>Ebenen</span>
      </div>
      <div class="linked-layer-item" v-for="layer in layers" @click="selectLayer(layer.id)">
        <i class="fa fa-fw" :class="'fa-'+icon(layer)"></i>
        {{layer.title}}
        <span>
          <i class="fa fa-angle-right"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

  import BasePropertyPanel from "./BasePropertyPanel.vue"

  export default {
    extends: BasePropertyPanel,
    computed: {
      layers() {
        let l = this.$store.state.objects
          .filter(this.$store.getters.isSublayer)
          .filter(el => el.render.image == this.id)
        return l;
      }
    },
    methods: {
      loadImage() {
        this.$store.dispatch("loadNewImage", this.id)
      },
      icon(layer) {
        return layer.is == "cpart" ? "th-large" : layer.type == "rect" ? "square" : layer.type == "ellipse" ? "circle" : ""
      },
      selectLayer(id) {
        this.$store.commit("selectObject", id)
      }
    }
  }

</script>

<style>

</style>
