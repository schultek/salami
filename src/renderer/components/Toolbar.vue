<template>
  <div id="toolbar" class="panel">
    <div id="tools">
      <template v-for="tool in tools" >
        <span v-if="'id' in tool" @click="selectTool(tool.id)" class="tool" :class="[tool.id == selectedTool ? 'selected':'']">
          <Icon :icon="tool.icon"></Icon>
          <i class="fa fa-plus fa-xs plus-icon" v-show="tool.id!='select'"></i>
        </span>
        <span v-else @click="selectTool(tool.selected)" class="tool" :class="[tool.selected == selectedTool ? 'selected':'']">
          <Icon :icon="getSelected(tool).icon"></Icon>
          <i class="fa fa-plus fa-xs plus-icon" v-show="tool.selected!='select'"></i>
          <i class="fa fa-xs fa-caret-right more-icon"></i>
          <div class="tool-sublist">
            <span v-for="t in tool.tools.filter(el => el.id != tool.selected)" @click="selectTool(t.id)" class="tool" :class="[t.id == selectedTool ? 'selected':'']">
              <Icon :icon="t.icon"></Icon>
              <i class="fa fa-plus fa-xs plus-icon" v-show="t.id!='select'"></i>
            </span>
          </div>
        </span>
      </template>
    </div>
    <div id="sidepanel-icons">
      <div @click="selectNavigationPanel(0)" :class="[navigationPanel==0?'selected':'']">
        <LayersIcon></LayersIcon>
      </div>
      <div @click="selectNavigationPanel(1)" :class="[navigationPanel==1?'selected':'']">
        <LayoutsIcon></LayoutsIcon>
      </div>
      <!-- <div @click="selectNavigationPanel(2)" :class="[navigationPanel==2?'selected':'']">
        <i class="fa fa-users"></i>
      </div> -->
    </div>
  </div>
</template>

<script>

  import LayersIcon from "@/assets/layers.svg"
  import LayoutsIcon from "@/assets/layouts.svg"

  import Icon from "./Icon.vue"

  import {mapState} from "vuex"

  export default {
    components: {LayersIcon, LayoutsIcon, Icon},
    computed: mapState(["selectedTool", "tools", "navigationPanel"]),
    methods: {
      selectTool(t) {
        this.$store.commit("selectTool", t)
        if (t != "select") {
          this.$store.commit("selectObject", null)
          this.$store.dispatch("centerProject", {withSidebar: true})
          this.$store.commit("setSubLayersOpen", !(t == "image" || t == "halftone" || t == "stipple"))
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

.tool .icon {
  color: #505050;
}

.tool:hover {
  background: #e4e4e4
}

.tool.selected > .icon {
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
  justify-content: flex-end;
  width: 100%;
  margin: 10px 0;
}

#sidepanel-icons div {
  padding: 8px 12px;
  width: 100%;
  box-sizing: border-box;
}

#sidepanel-icons svg * {
  fill: #505050;
}

#sidepanel-icons .selected svg * {
  fill: #008dea;
  color: #008dea;
}

</style>
