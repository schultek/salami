<template>
  <div>
    <TitleModule :id="id" v-model="object.title"></TitleModule>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Form</span>
      </div>
      <div class="settings-dimensions dimen-row-2 fw">
        <Dimen type="select" title="Form" :options="dimens[0]" v-model="object.curve"></Dimen>
      </div>
      <DimensModule :id="id" :row="2" :dimens="dimens[1]" fw></DimensModule>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Anordnung</span>
      </div>
      <DimensModule :id="id" :row="2" :dimens="dimens[2]" fw></DimensModule>
      <DimensModule :id="id" :row="2" :dimens="dimens[3]" fw></DimensModule>
    </div>
    <LayerModule :layers="layers"></LayerModule>
  </div>
</template>

<script>

  import Dimen from "../Dimen.vue"
  import BaseRenderer from "./BaseRenderer.vue"

  export default {
    extends: BaseRenderer,
    components: {Dimen},
    data: () => ({
      dimens: [
        ["Linie", "Bogen", "Kreis", "Welle"],
        [
          {title: 'Biegung', prop: 'stretch', type:'number', unit:'mm'},
          {title: 'Richtung', prop: 'direction', type:'number', unit:'deg'}
        ],
        [
          {title: 'X', prop: "x", type:"number", unit:"mm"},
          {title: "Y", prop: "y", type:"number", unit:"mm"}
        ],
        [
          {title: "Schritte", prop: "steps", type: "number"},
          {title: "Abstand", prop: "gap", type: "number", unit: "mm"},
          {title: "Kanten", prop:"refinedEdges", type:"number", unit:"%"},
          {title: "Qualität", prop:"smooth", type:"number", unit:"%"}
        ]
      ]
    })
  }

</script>

<style>

</style>
