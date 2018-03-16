<template>

  <div>
    {{msg}}
    <button @click="closeWindow">Close</button>
  </div>

</template>

<script>

import {ipcRenderer} from "electron"

export default {
  data: () => ({
    msg: "Hallo"
  }),
  methods: {
    closeWindow() {
      ipcRenderer.send("settings", "close")
    }
  }
}

</script>
