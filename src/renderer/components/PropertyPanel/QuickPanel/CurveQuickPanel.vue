<template>
  <div class="settings-panel">
    <div class="settings-header">
      <span>{{curve.title}}</span>
    </div>
    <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <select v-model="curve.type">
            <option>Linie</option>
            <option>Bogen</option>
            <option>Kreis</option>
            <option>Welle</option>
          </select>
        </div>
        <div class="dimen">
          <span>Biegung</span><input type="number" v-model.number.lazy="curve.stretch" v-blur/>
        </div>
        <div class="dimen">
          <span>Richtung</span><input type="number" v-model.number.lazy="curve.direction" v-blur/>
        </div>
      </div>
    </div>
</template>

<script>

export default {
  props: ["id"],
  computed: {
    curve: {
      get() {
        return this.$store.getters.getObjectById(this.id)
      },
      set(l) {
        this.$store.commit("updateObject", l);
      }
    }
  }
}

</script>

<style>

</style>
