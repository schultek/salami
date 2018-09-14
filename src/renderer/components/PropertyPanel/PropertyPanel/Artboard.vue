<template>
  <div>
    <TitleModule :id="id" v-model="object.title"></TitleModule>
    <div class="size-warning" v-show="sizewarning">
      <fa-icon icon="compress" @click="compressPart"></fa-icon>
      <span>This Part is bigger then your machine. Resize!</span>
    </div>
    <DimensModule :id="id" :row="2" dimens="default" :add="{title: 'fa-adjust', prop: 'inverted', type:'checkbox'}"></DimensModule>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Border</span>
      </div>
      <div class="settings-dimensions dimen-row-4">
        <Dimen v-model="object.border.left" type="number" title="fa-caret-right" unit="mm"></Dimen>
        <Dimen v-model="object.border.right" type="number" title="fa-caret-left" unit="mm"></Dimen>
        <Dimen v-model="object.border.top" type="number" title="fa-caret-down" unit="mm"></Dimen>
        <Dimen v-model="object.border.bottom" type="number" title="fa-caret-up" unit="mm"></Dimen>
      </div>
    </div>
    <RenderModule :id="id"></RenderModule>
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
    components: {RenderModule, TimeModule, DimensModule, Dimen},
    computed: {
      sizewarning() {
        return this.object.w > this.$store.state.machine.w || this.object.h > this.$store.state.machine.h
      }
    },
    methods: {
      compressPart() {
        if (this.object.w > this.$store.state.machine.w) {
          this.object.x = this.object.x + this.object.w/2 - this.$store.state.machine.w/2
          this.object.w = this.$store.state.machine.w;
        }
        if (this.object.h > this.$store.state.machine.h) {
          this.object.y = this.object.y + this.object.h/2 - this.$store.state.machine.h/2
          this.object.h = this.$store.state.machine.h;
        }
      }
    }
  }

</script>

<style>

.size-warning {
  background: #ededed;
  font-size: 12px;
  padding: 5px 10px !important;
  border-left: 3px solid red;
  border-bottom: none !important;
}

.size-warning .svg-inline--fa {
  margin: 5px;
}

.size-warning .svg-inline--fa:hover {
  color: #008dea;
}

.form-list-item {
  padding-left: 20px
}

.form-list-item input {
  margin-right: 7px;
}

</style>
