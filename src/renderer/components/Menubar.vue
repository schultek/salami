<template>
  <div id="menubar" class="panel">
    <div class="middle title">
      {{projectName}}
    </div>
    <div class="menu">
      <span @click="loadProject">Open</span>
      <span @click="saveProject">Save</span>
    </div>
    <div class="right" :class="quickMode || !objectSelected ? 'hide-settings' : ''">
      <Spinner></Spinner>
      <!-- <div id="quickModeSwitch" class="switch" @click="toggleQuickMode" :class="[quickMode?'active':'']">
        <div><div></div></div>
      </div> -->
      <div id="fullPreview" @click="togglePreview">
        <i class="fa fa-magic fa-sm" :style="{color: fullPreview?'#008dea':'inherit'}"></i>
      </div>
      <div id="showSettings"  @click="unselectObject">
        <i class="fa fa-wrench fa-sm" ></i>
        <i class="fa fa-angle-right"></i>
      </div>
    </div>
  </div>
</template>

<script>

  import $ from "jquery"

  import Spinner from "./Spinner.vue"

  export default {
    components: {Spinner},
    computed: {
      projectName() {
        return this.$store.state.project.name
      },
      progress() {
        return this.$store.state.progress
      },
      quickMode() {
        return this.$store.state.quickMode
      },
      fullPreview() {
        return this.$store.state.fullPreview
      },
      objectSelected() {
        return this.$store.state.selectedObject != null
      }
    },
    watch: {
      progress(n, o) {
          if (!n || n == 100) {
            $(".loader").fadeOut();
          } else if (n && n < 100) {
            $(".loader").fadeIn();
          }
      }
    },
    methods: {
      loadProject() {
        this.$store.dispatch("loadProject")
      },
      saveProject() {
        this.$store.dispatch("saveProject")
      },
      toggleQuickMode() {
        this.$store.dispatch("toggleQuickMode")
      },
      togglePreview() {
        this.$store.dispatch("setFullPreview", !this.fullPreview)
      },
      unselectObject() {
        this.$store.commit("selectObject", null)
      }
    }
  }

</script>

<style>

#menubar {
  width: 100%;
  height: 40px;
  border-bottom-style: solid;
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
}

.middle {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.right {
  position: absolute;
  right: 0;
  height: 100%;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-end;
  transition: transform 1s;
}

.right.hide-settings {
  transform: translateX(40px);
}

.title {
  font-size: 13px;
  font-weight: 400;
}

.menu {
  height: 100%;
  padding-left: 10px;
  display: flex;
}

.menu span {
  display: block;
  padding: 0 10px;
  height: 100%;
  line-height: 40px;
  font-size: 13px;
}

.menu span:hover {
  background-color: #e4e4e4;
}

.loader {
  display: flex;
  align-items: center;
  width: 100px;
  height: 100%;
  margin-right: 10px;
}

.loader span {
  display: block;
  position: absolute;
  background: #505050;
  height: 2px;
  transition: width 0.08s;
}

.loader span:first-child {
  width: 100px;
  background: #ccc;
}

#fullPreview, #showSettings {
  display: block;
  box-sizing: border-box;
  padding: 10px 10px 10px 5px;
  height: 100%;
  vertical-align: middle;
}

#showSettings i, #fullPreview i {
  vertical-align: middle;
}

#showSettings i:first-child {
  margin-right: -3px;
}

#showSettings:hover, #fullPreview:hover {
  color: #008eda;
}

.switch {
    padding: 13px 10px;
}

.switch > div {
    height: 14px;
    width: 28px;
    border-radius: 7px;
    box-shadow: inset 0 0 20px #b9b9b9;
    background: #ccc;
    position: relative;
}

.switch > div > div {
  position: absolute;
  left: 0;
  top: 0;
  height: 14px;
  width: 14px;
  background: #505050;
  border-radius: 10px;
  transition: all 0.5s;
}

.switch.active > div > div {
  left: 50%;
  background: #008dea;
}


</style>
