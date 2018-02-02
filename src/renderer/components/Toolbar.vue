<template>
  <div id="toolbar" class="panel">
    <div id="tools">
      <span v-for="tool in tools" @click="selectTool(tool.id)" :class="[tool.id==selectedTool?'selected':'']">
          <i class="fa fa-fw" :class="'fa-'+tool.icon"></i>
          <i class="fa fa-plus fa-xs corner-icon" v-show="tool.id!='select'"></i>
      </span>
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

  // import LayersIcon from "../assets/layers.svg"
  // import LayoutsIcon from "../assets/layouts.svg"

  import {mapState} from "vuex"

  export default {
    //components: {LayersIcon, LayoutsIcon},
    computed: mapState(["selectedTool", "tools", "navigationPanel"]),
    methods: {
      selectTool(t) {
        this.$store.commit("selectTool", t)
        if (t != "select") { //TODO constant
          this.$store.commit("selectObject", null)
        }
      },
      selectNavigationPanel(n) {
        this.$store.commit("switchNavigationPanel", n)
      }
    }
  }

</script>

<style>

#toolbar {
  width: 50px;
  border-right-style: solid;
  padding-top: 10px;
  position: relative;
}

#tools {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
}

#tools span {
  position: relative;
  margin: 10px;
}

#tools span.selected {
  color: #008dea;
}

#tools .corner-icon {
  position: absolute;
  top: -10px;
  left: 16px;
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
