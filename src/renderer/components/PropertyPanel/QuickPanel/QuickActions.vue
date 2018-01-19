<template>
  <div class="settings-panel">
    <div class="settings-header">
      <span>Aktionen</span>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <input type="button" value="Projekt speichern" @click="saveProject" style="width: auto" />
      </div>
      <div class="dimen">
        <input type="button" value="GCode speichern" @click="saveGCode" style="width: auto" />
      </div>
    </div>
  </div>
</template>

<script>

export default {
  methods: {
    saveProject() {
      this.$store.dispatch("saveProject")
    },
    saveGCode() {
      this.$store.dispatch("saveGCode")
    }
  }
}


</script>
