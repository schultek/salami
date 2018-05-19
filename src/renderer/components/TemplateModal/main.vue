<template>
  <modal :classes="'v--modal new-project'" name="open-project">
    <div class="template-step">
      <template v-for="(step, i) in template.steps" :style="{opacity: i >= currentStep ? 1 : .5}">
        <Icon v-if="i != 0" :icon="angle-right"></Icon>
        <span>{{step}}</span>
      </template>
    </div>
    <div class="template-wrapper">
      <TemplatesBoard v-if="currentStep == 0" v-model="template"></TemplatesBoard>
      <TemplateBuilder v-else v-model="template"></TemplateBuilder>
    </div>
  </modal>
</template>

<script>

import Icon from "@/components/Icon.vue"

export default {
  components: {Icon},
  data: () => ({
    template: {}
  })
}

</script>

<style>

.open-project {
  display: flex;
  flex-flow: column nowrap;
  align-items: stretch;
}

.template-step {
  height: 40px;
  display: flex;
  flex-flow: row nowrap;
  color: white;
  font-size: 12px;
}

</style>
