<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading" @click="toggleSublayers">
      <span>Layouts</span>
      <fa-icon :icon="subLayersOpen?'angle-down':'angle-up'"></fa-icon>
    </div>
    <fa-icon class="plus" size="xs" id="add-layout" @click="addLayout"></fa-icon>
    <div>
      <div class="layer-item" v-for="layout in layouts" @click="buildLayout(layout.id)" :class="[selectedLayout==layout.id?'selected':'']">
        <fa-icon icon="columns" class="icon"></fa-icon>
        <template v-if="edit == layout.id">
          <input id="edit-title" type="text" v-model="title" @click.stop="" @blur="closeEditLayout" v-blur/>
        </template>
        <template v-else>
          <span>{{layout.title}}</span>
        </template>
        <span class="stretch"></span>
        <span style="display: block">
          <fa-icon v-if="layout.custom" icon="pencil-alt" @click.stop="startEditLayout(layout)"></fa-icon>
          <fa-icon v-if="layout.custom" icon="trash-alt" @click.stop="removeLayout(layout.id)"></fa-icon>
        </span>
      </div>
    </div>
  </div>
</template>

<script>

  import {mapState} from "vuex"

  export default {
    data: () => ({
      edit: null,
      title: ""
    }),
    computed: {
      ...mapState(["subLayersOpen", "selectedLayout"]),
      layouts() {
        return this.$store.state.layouts
          .filter(l => !l.custom)
          .sort((a, b) => (a.order || 100) - (b.order || 100))
          .concat(this.$store.state.layouts
            .filter(l => l.custom)
            .sort((a, b) => a.title > b.title)
          )
      }
    },
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
      startEditLayout(l) {
        this.closeEditLayout()
        this.edit = l.id
        this.title = l.title
      },
      closeEditLayout() {
        let l = this.layouts.find(l => l.id == this.edit)
        this.edit = null;
        if (!l) return;
        this.$store.dispatch("setLayoutTitle", {
          id: l.id, title: this.title
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
  margin: 14px;
  color: #505050;
}

#add-layout:hover {
  color: #008dea;
}

</style>
