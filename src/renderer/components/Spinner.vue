<template>
  <div class="spinner" v-show="loading">
    <i class="fa fa-spinner fa-spin"></i>
  </div>
</template>

<script>

let loading = []

import Vue from "vue"

let bus = new Vue();

export let Spinner = {
  start(id) {
    loading.push(id)
    bus.$emit("update")
  },
  stop(id) {
    if (loading.indexOf(id) >= 0)
      loading.splice(loading.indexOf(id), 1)
    bus.$emit("update")
  }
}

export default {
  data: () => ({
    loading: false
  }),
  created() {
    bus.$on("update", () => {
      this.loading = loading.length > 0
    })
  }
}

</script>

<style>

.spinner {
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #008dea;
}

</style>
