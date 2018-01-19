<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading" @click="toggleSublayers">
      <span>Layouts</span>
      <icon :name="subLayersOpen?'angle-down':'angle-up'"></icon>
    </div>
    <icon name="plus" scale="0.9" id="add-layout" @click="addLayout"></icon>
    <div>
      <div class="layer-item" v-for="layout in layouts" @click="buildLayout(layout.id)" :class="[selectedLayout==layout.id?'selected':'']">
        <icon name="columns"></icon>
        <template v-if="layout.edit">
          <input type="text" v-model="layout.title" @click.stop="" @blur="closeEditLayout(layout.id)" v-blur />
        </template>
        <template v-else>
          {{layout.title}}
        </template>
        <span style="display: block">
          <icon v-if="layout.deleteable" name="pencil" @click.stop="startEditLayout(layout.id)"></icon>
          <icon v-if="layout.deleteable" name="trash-o" @click.stop="removeLayout(layout.id)"></icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapState} from "vuex"

  export default {
    computed: mapState(["subLayersOpen", "selectedLayout", "layouts"]),
    methods: {
      toggleSublayers() {
        this.$store.commit("setSubLayersOpen", !this.subLayersOpen)
      },
      addLayout() {
        this.$store.dispatch("createNewLayout")
      },
      buildLayout(l) {
        this.$store.dispatch("buildLayout", l)
      },
      removeLayout(l) {
        this.$store.dispatch("removeLayout", l)
      },
      startEditLayout(id) {
        this.layouts.forEach(l => { if (l.edit) this.closeEditLayout(l.id) });
        this.layouts.find(l => l.id == id).edit = true;
      },
      closeEditLayout(id) {
        let l = this.layouts.find(l => l.id == id)
        l.edit = false;
        this.$store.dispatch("setLayoutTitle", {
          id,
          title: l.title
        });
      }
    }
  }

</script>

<style>

#add-layout {
  position: absolute;
  right: 0;
  top: 0;
  margin: 10px;
  color: #959595;
}

#add-layout:hover {
  color: #008dea;
}

</style>
