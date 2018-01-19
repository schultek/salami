<template>
  <div id="navigation" class="sidepanel panel">
    <div id="layer-heading">
      <span>Live-Project</span>
    </div>
    <div class="dimen">
      <span>Name</span><input v-model="live.id" type="text" @keyup.enter="joinProject"/>
    </div>
    <div class="dimen">
      <input type="button" value="Join" @click="joinProject"/>
    </div>
  </div>
</template>

<script>

export default {
  data: () => ({
    live: {
      id: ""
    }
  }),
  methods: {
    joinProject() {

    }
  }
}
</script>

<style>

</style>
