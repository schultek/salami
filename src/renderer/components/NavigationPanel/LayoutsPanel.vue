<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading" @click="toggleSublayers">
      <span>Layouts</span>
      <i class="fa" :class="subLayersOpen?'angle-down':'angle-up'"></i>
    </div>
    <i class="fa fa-plus fa-xs" id="add-layout" @click="addLayout"></i>
    <div>
      <div class="layer-item" v-for="layout in layouts" @click="buildLayout(layout.id)" :class="[selectedLayout==layout.id?'selected':'']">
        <i class="fa fa-columns icon"></i>
        <template v-if="edit == layout.id">
          <input id="edit-title" type="text" v-model="title" @click.stop="" @blur="closeEditLayout" v-blur/>
        </template>
        <template v-else>
          <span>{{layout.title}}</span>
        </template>
        <span class="stretch"></span>
        <span style="display: block">
          <i v-if="layout.custom" class="fas fa-pencil-alt" @click.stop="startEditLayout(layout)"></i>
          <i v-if="layout.custom" class="fa fa-trash-alt" @click.stop="removeLayout(layout.id)"></i>
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
