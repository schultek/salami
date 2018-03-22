<template>
  <div>
    <TitleModule :id="id" v-model="object.title"></TitleModule>
    <DimensModule :id="id" :row="2" :dimens="dimens[0]"></DimensModule>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Form</span>
      </div>
      <div class="settings-dimensions dimen-row-2 fw">
        <Dimen type="select" title="Form" :options="dimens[1]" v-model="object.curve"></Dimen>
      </div>
      <DimensModule :id="id" :row="2" :dimens="dimens[2]" fw></DimensModule>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Options</span>
      </div>
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
        [
          {title: 'X', prop: "x", type:"number", unit:"mm"},
          {title: "Y", prop: "y", type:"number", unit:"mm"}
        ],
        [{value: "line", title: "Line"}, {value: "arc", title: "Arc"}, {value: "circle", title: "Circle"}, {value: "wave", title: "Wave"}],
        [
          {title: 'Bend', prop: 'stretch', type:'number', unit:'mm'},
          {title: 'Direction', prop: 'direction', type:'number', unit:'deg'}
        ],
        [
          {title: "Steps", prop: "steps", type: "number"},
          {title: "Gap", prop: "gap", type: "number", unit: "mm", step: 0.5},
          {title: "Edges", prop:"refinedEdges", type:"number", unit:"%"},
          {title: "Quality", prop:"smooth", type:"number", unit:"%"}
        ]
      ]
    })
  }

</script>

<style>

</style>
