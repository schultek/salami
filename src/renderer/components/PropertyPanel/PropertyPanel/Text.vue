<template>
  <div>
    <TitleModule :id="id" v-model="object.title" caption="Text"></TitleModule>
    <DimensModule :id="id" row="3" :dimens="dimens[0]"></DimensModule>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Font</span>
      </div>
      <DimensModule :id="id" row="2" :dimens="dimens[1]"></DimensModule>
      <div class="settings-dimensions dimen-row-2">
        <Dimen title="Font" v-model="object.font" type="select" :options="fonts"></Dimen>
        <div class="dimen">
          <input type="button" @click="loadFont" value="Load Font"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import Base from "./Base.vue"
  import DimensModule from "./Modules/DimensModule.vue"
  import Dimen from "./Dimen.vue"

  export default {
    extends: Base,
    components: {DimensModule, Dimen},
    data: () => ({
      dimens: [
        [
          {title: 'X', prop: 'x', type:"number", unit:"mm"},
          {title: 'Y', prop: 'y', type:"number", unit:"mm"},
          {title: 'fa-redo', prop: 'rot', type:"number", unit:"deg"}
        ],[
          {title: "Size", prop:"size", type:"number", unit:"px"},
          {title: "Stroke", prop:"stroke", type:"number", unit:"px"}
        ]
      ]
    }),
    computed: {
      fonts() {
        return this.$store.state.fonts.map(f => ({title: f.title, value: f.id}))
      }
    },
    methods: {
      loadFont() {
        this.$store.dispatch("loadNewFont")
      }
    }
  }

</script>

<style>

</style>
