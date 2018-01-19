<template>
  <div id="app">
    <Menubar></Menubar>
    <div id="panels">
      <Toolbar v-show="!quickMode"></Toolbar>
      <NavigationPanel></NavigationPanel>
      <Workarea></Workarea>
      <PropertyPanel></PropertyPanel>
    </div>
  </div>
</template>

<script>

  import $ from "jquery"

  import Menubar from "./components/Menubar.vue"
  import Toolbar from "./components/Toolbar.vue"
  import NavigationPanel from "./components/NavigationPanel/main.vue"
  import Workarea from "./components/Workarea/main.vue"
  import PropertyPanel from "./components/PropertyPanel/main.vue"

  import {mapState} from "vuex"

  export default {
    components: {Menubar, Toolbar, NavigationPanel, Workarea, PropertyPanel},
    computed: mapState(["quickMode"])
  }
</script>

<style>

#app {
  display: flex;
  flex-flow: column nowrap;
}

#panels {
  flex-grow: 1;
  display: flex;
  flex-flow: row nowrap;
  align-items: stretch;
}

.panel {
  background: #f7f7f7;
  border-color: #e4e4e4;
  border-width: 2px;
  flex-grow: 0;
  flex-shrink: 0;
}

.cursor-rotate:hover {
  cursor: url("./assets/cursor-rotate.cur"), auto;
}

.move-tool:hover {
  cursor: move;
}

</style>
