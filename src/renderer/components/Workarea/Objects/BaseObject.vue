<template>

</template>

<script>

export default {
  props: ["id"],
  computed: {
    object() { return this.$store.getters.getObjectById(this.id) },
    x() { return this.object.x },
    y() { return this.object.y },
    w() { return this.object.w },
    h() { return this.object.h },
    rot() { return this.object.rot }
  },
  methods: {
    selectThis() {
      this.$store.commit("selectObject", this.id)
    }
  }
}

</script>
