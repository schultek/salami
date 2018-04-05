<template>
  <div id="app" unselectable="on" onselectstart="return false;">
    <Menubar></Menubar>
    <div id="panels">
      <Toolbar v-show="!quickMode"></Toolbar>
      <NavigationPanel></NavigationPanel>
      <Workarea></Workarea>
      <PropertyPanel></PropertyPanel>
    </div>
    <notifications group="default" />
    <modal :classes="'v--modal naming-modal'" :width="'50%'" :height="55" :pivotY="0.2" name="name-layer" @before-open="setModalId" @opened="focusInput" @before-close="updateTitle" >
      <i class="fa fa-pencil-alt fa-md"></i>
      <input v-model="modalTitle" @blur="$modal.hide('name-layer')" v-blur/>
    </modal>
    <v-dialog></v-dialog>
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
    computed: mapState(["quickMode"]),
    data: () => ({
      modalId: null,
      modalTitle: null
    }),
    methods: {
      setModalId(event) {
        this.modalId = event.params.id
        this.modalTitle = (this.$store.getters.getObjectById(this.modalId) || {title: ""}).title
      },
      focusInput(event) {
        event.ref.children[1].select()
        event.ref.children[1].focus()
      },
      updateTitle(event) {
        if (this.modalTitle && this.modalId) {
          this.$store.commit("updateObject", {id: this.modalId, title: this.modalTitle})
        }
      }
    }
  }
</script>

<style>

@import "./assets/fontawesome-all.css";

html, body, #app {
  position: fixed;
  width: 100%; height: 100%;
  margin: 0; padding: 0;
  cursor: default;
  font-family: Helvetica, sans-serif;
  color: #505050;
}

#app {
  display: flex;
  flex-flow: column nowrap;
  user-select: none;
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

.notifications .error {
  background: #e54d42;
  border-left-color: #b82e24
}

.naming-modal {
  padding: 0px;
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
}

.naming-modal input {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: none;
  font-size: 18px;
  color: #505050;
  outline: none;
}

.v--modal {
  border-radius: 10px;
}

.naming-modal i {
  margin: 15px;
}

.dialog-button-error {
  background: #e54d42;
  color: white;
}
.dialog-button-error:hover {
  background: #d2453b;
}

</style>
