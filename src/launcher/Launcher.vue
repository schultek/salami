<template>

  <div>
    {{msg}}
    <button @click="openApp">Open App</button>
  </div>

</template>

<script>

import {ipcRenderer} from "electron"

export default {
  data: () => ({
    msg: "Hallo"
  }),
  methods: {
    openApp() {
      ipcRenderer.send("file", "open")
    }
  }
}

</script>

<style>

body {
  -webkit-app-region: drag;
  padding-top: 40px;
  margin: 0;
}

</style>
