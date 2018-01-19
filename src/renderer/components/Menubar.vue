<template>
  <div id="menubar" class="panel">
    <div id="title">
      {{projectName}}
    </div>
    <div id="menu">
      <span @click="loadProject">Öffnen</span>
      <span @click="saveProject">Speichern</span>
    </div>
    <div class="menu-right">
      <span class="loader" :style="{opacity: progress<100?1:0}"><span></span><span :style="{width: progress+'px'}"></span></span>
      <span id="quickModeSwitch" class="switch" @click="toggleQuickMode" :class="[quickMode?'active':'']">
        <div><div></div></div>
      </span>
      <span id="fullPreview" @click="togglePreview"><icon name="magic" scale="0.8" :style="{color: fullPreview?'#008dea':'inherit'}"></icon></span>
      <span id="showSettings" v-show="!quickMode && objectSelected" @click="unselectObject"><icon name="wrench" scale="0.8" ></icon><icon name="angle-right" scale="1.2"></icon></span>
    </div>
  </div>
</template>

<script>

  export default {
    computed: {
      projectName() {
        return this.$store.state.project.name
      },
      progress() {
        return this.$store.getters.getProgress
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

#title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 400;
}

#menu {
  height: 100%;
  padding-left: 10px;
  display: flex;
}

#menu span {
  display: block;
  padding: 0 10px;
  height: 100%;
  line-height: 40px;
  font-size: 13px;
}

#menu span:hover {
  background-color: #e4e4e4;
}

#menu span .fa-icon {
  margin-right: 5px;
}

#menu input {
  display: none;
}

.menu-right {
  right: 0;
  height: 100%;
  display: flex;
}

.loader {
  display: flex;
  align-items: center;
  width: 100px;
  height: 100%;
  transition: opacity 0.8s;
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

#showSettings .fa-icon, #fullPreview .fa-icon {
  vertical-align: middle;
}

#showSettings .fa-icon:first-child {
  margin-right: 3px;
}

#showSettings:hover {
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
