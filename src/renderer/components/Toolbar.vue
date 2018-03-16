<template>
  <div id="toolbar" class="panel">
    <div id="tools">
      <template v-for="tool in tools" >
        <span v-if="'id' in tool" @click="selectTool(tool.id)" class="tool" :class="[tool.id == selectedTool ? 'selected':'']">
          <i class="fa fa-fw" :class="'fa-'+tool.icon"></i>
          <i class="fa fa-plus fa-xs plus-icon" v-show="tool.id!='select'"></i>
        </span>
        <span v-else @click="selectTool(tool.selected)" class="tool" :class="[tool.selected == selectedTool ? 'selected':'']">
          <i class="fa fa-fw" :class="'fa-'+getSelected(tool).icon"></i>
          <i class="fa fa-plus fa-xs plus-icon" v-show="tool.selected!='select'"></i>
          <i class="fa fa-xs fa-caret-right more-icon"></i>
          <div class="tool-sublist">
            <span v-for="t in tool.tools.filter(el => el.id != tool.selected)" @click="selectTool(t.id)" class="tool" :class="[t.id == selectedTool ? 'selected':'']">
              <i class="fa fa-fw" :class="'fa-'+t.icon"></i>
              <i class="fa fa-plus fa-xs plus-icon" v-show="t.id!='select'"></i>
            </span>
          </div>
        </span>
      </template>
    </div>
    <div id="sidepanel-icons">
      <!-- <div @click="selectNavigationPanel(0)" :class="[navigationPanel==0?'selected':'']">
        <LayersIcon class="icon"></LayersIcon>
      </div>
      <div @click="selectNavigationPanel(1)" :class="[navigationPanel==1?'selected':'']">
        <LayoutsIcon></LayoutsIcon>
      </div> -->
      <!-- <div @click="selectNavigationPanel(2)" :class="[navigationPanel==2?'selected':'']">
        <i class="fa fa-users"></i>
      </div> -->
    </div>
  </div>
</template>

<script>

  // import LayersIcon from "@/assets/layers.svg"
  // import LayoutsIcon from "@/assets/layouts.svg"

  import {mapState} from "vuex"

  export default {
    // components: {LayersIcon, LayoutsIcon},
    computed: mapState(["selectedTool", "tools", "navigationPanel"]),
    methods: {
      selectTool(t) {
        this.$store.commit("selectTool", t)
        if (t != "select") {
          this.$store.commit("selectObject", null)
          setTimeout(() => this.$store.dispatch("centerProject", {withSidebar: true}), 10)
          this.$store.commit("setSubLayersOpen", t == "cpart" || t == "rect" || t == "ellipse")
        }
      },
      selectNavigationPanel(n) {
        this.$store.commit("switchNavigationPanel", n)
      },
      getSelected(tool) {
        return tool.tools.find(el => el.id == tool.selected)
      }
    }
  }

</script>

<style>

#toolbar {
  border-right-style: solid;
  padding-top: 10px;
  position: relative;
}

#tools {
  display: flex;
  flex-flow: column nowrap;
}

.tool {
  position: relative;
  padding: 12px 14px;
}

.tool:hover {
  background: #e4e4e4
}

.tool.selected > i {
  color: #008dea;
}

.tool.selected .more-icon {
  color: inherit;
}

.tool-sublist {
  position: absolute;
  z-index: 1;
  left: 100%;
  top: 0;
  display: none;
  flex-flow: column nowrap;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  box-shadow: 0 0 5px 1px #ddd;
  background: #f7f7f7;
}

.tool:hover .tool-sublist {
  display: flex;
}

.tool .plus-icon {
  position: absolute;
  top: 4px;
  right: 8px;
  font-size: .6em;
}

.tool .more-icon {
  position: absolute;
  transform: rotate(45deg);
  font-size: .8em;
  bottom: 0;
  right: 3px;
}

#sidepanel-icons {
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  width: 100%;
  margin: 10px 0;
}

#sidepanel-icons div {
  margin: 8px;
}

#sidepanel-icons svg {
  fill: #505050;
}

#sidepanel-icons .selected svg, #sidepanel-icons .selected i {
  fill: #008dea;
  color: #008dea;
}

</style>
