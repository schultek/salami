<template>
  <div>
    <div class="templates-board">
      <div class="project-item" @click="selected = layout" v-for="layout in layouts">
        <div>
          <div class="thumbnail" :style="{backgroundImage: 'url('+layout.thumbnail+')'}" v-if="layout.thumbnail"/>
          <Icon v-else icon="desktop"></Icon>
        </div>
        <div>
          {{layout.title}}
        </div>
      </div>
    </div>
    <div class="template-sidebar">
      <span class="template-text">Create new Project from Tempalte</span>
      <span class="template-title">{{selected.title}}</span>
      <input class="template-project-title"/>
      <
    </div>
  </div>

</template>

<script>

import UserStore from "@/includes/UserStore.js"
import Icon from "@/components/Icon.vue"
import TemplateSidebar from "./TemplateSidebar.vue"

export default {
  props: ["value"],
  components: {Icon},
  data: () => ({
    selected: null,
    title: "Untitled",
    width: 0, height: 0,
    thickness: 0,
  }),
  created() {
    this.selected = this.templates[0]
  },
  computed: {
    templates() {
      return this.$store.state.layouts
    }
  },
  methods: {
    next() {
      this.$emit("input", this.selected)
    }
  }
}

</script>
