<template>
  <div class="settings-title">
    <span>{{caption}}</span>
    <span><input type="text" v-model.lazy="title" v-blur/></span>
    <fa-icon icon="trash-alt" @click="removeObject"></fa-icon>
  </div>
</template>

<script>

export default {
  props: {
    id: String, value: String,
    caption: {
      type: String, default: "Title"
    }
  },
  computed: {
    title: {
      get() {
        return this.value
      },
      set(t) {
        this.$emit("input", t)
      }
    }
  },
  methods: {
    removeObject() {
      this.$store.dispatch("removeObject", this.id)
    }
  }
}

</script>

<style>

.settings-title {
  display: flex;
  justify-content: space-between;
  height: 25px;
  align-items: center;
  letter-spacing: 1px;
}

.settings-title span:first-child {
  font-size: 10px;
  color: #9f9f9f;
  text-transform: uppercase;
  margin-right: 6px;
}

.settings-title span:nth-child(2) {
  flex-grow: 1;
  margin-right: 6px;
}

.settings-title span:nth-child(2) input {
  width: 100%;
}

.settings-title .svg-inline--fa {
  font-size: 12px;
  margin: 6px;
  color: #9f9f9f;
}

.settings-title .svg-inline--fa:hover {
  color: #008dea;
}

</style>
