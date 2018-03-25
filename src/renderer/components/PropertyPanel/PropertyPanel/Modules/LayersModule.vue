<template>
  <div class="settings-panel linked-layer-list">
    <div class="settings-header">
      <span>Layers</span>
    </div>
    <div class="linked-layer-item" v-for="layer in layers" @click="selectObject(layer.id)">
      <Icon :for="layer"></Icon>
      <span>{{layer.title}}</span>
      <span class="stretch"></span>
      <span>
        <i class="fa fa-angle-right link"></i>
      </span>
    </div>
  </div>
</template>

<script>

import {SelectObject} from "@/mixins.js"
import Icon from "@/components/Icon.vue"

export default {
  props: ["layers"],
  components: {Icon},
  mixins: [SelectObject]
}

</script>
