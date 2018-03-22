<template>
  <div class="settings-panel linked-layer-list">
    <div class="settings-header">
      <span>Layers</span>
    </div>
    <div class="linked-layer-item" v-for="layer in layers" @click="selectObject(layer.id)">
      <i class="fa fa-fw icon" :class="icon(layer)"></i>
      <span>{{layer.title}}</span>
      <span class="stretch"></span>
      <span>
        <i class="fa fa-angle-right link"></i>
      </span>
    </div>
  </div>
</template>

<script>

import {Icon, SelectObject} from "@/mixins.js"

export default {
  props: ["layers"],
  mixins: [Icon, SelectObject]
}

</script>
