<template>
  <div class="settings-panel">
    <div class="settings-header">
      <span>Project - QuickSettings</span>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span>W</span><input type="number" v-model.number.lazy="project.w" v-blur/>
      </div>
      <div class="dimen">
        <span>H</span><input type="number" v-model.number.lazy="project.h" v-blur/>
      </div>
      <div class="dimen">
        <span>Detail</span><input type="number" v-model.number.lazy="project.detail" v-blur/>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  computed: {
    project: {
      get() {
        return this.$store.getters.getQuickProject
      },
      set(p) {
        this.$store.dispatch("updateQuickProject", p);
      }
    }
  }
}

</script>

<style>

</style>
