<template>
  <div>
    <TitleModule :id="id" v-model="object.title"></TitleModule>
    <DimensModule :id="id" :row="3" dimens="rotation"></DimensModule>
    <div class="settings-dimensions dimen-row-2">
      <Dimen type="checkbox" v-model="object.ownRenderer" title="Rendering"></Dimen>
    </div>
    <RenderModule v-if="object.ownRenderer" :id="id"></RenderModule>
    <TimeModule :id="id" ></TimeModule>
  </div>
</template>

<script>

  import Base from "./Base.vue"
  import RenderModule from "./Modules/RenderModule.vue"
  import TimeModule from "./Modules/TimeModule.vue"
  import DimensModule from "./Modules/DimensModule.vue"
  import Dimen from "./Dimen.vue"

  export default {
    extends: Base,
    components: {RenderModule, TimeModule, DimensModule, Dimen}
  }

</script>

<style>

</style>
