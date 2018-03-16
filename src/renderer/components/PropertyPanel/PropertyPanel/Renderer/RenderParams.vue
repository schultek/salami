<template>
  <div class="render-list-item">
    <div class="linked-layer-item" @click="selectObject(renderer.id)">
      <i class="fa fa-fw icon" :class="icon(renderer)"></i>
      {{renderer.title}}
      <span>
        <i class="fas fa-trash-alt" @click.stop="deleteParams()"></i>
        <i class="fa fa-angle-right link"></i>
      </span>
    </div>
    <div class="linked-layer-item" @click="selectObject(params.image)">
      <i class="fas fa-fw fa-image icon"></i>
      <select v-model="params.image" @click.stop="">
        <option :value="image.id" v-for="image in images">
          {{image.title}}
        </option>
      </select>
      <span>
        <i v-show="params.image" class="fa fa-angle-right link"></i>
      </span>
    </div>
    <div v-if="forms && forms.length > 0" class="linked-layer-item toggle" @click="toggleForms()">
      <i class="fas fa-fw fa-object-ungroup icon"></i>
      Forms
      <span>
        <i class="fa fa-angle-right toggle_icon link" :class="showForms ? 'toggled' : ''"></i>
      </span>
    </div>
    <div v-if="showForms" class="linked-layer-item form-list-item" v-for="form in forms" @click="selectObject(form.id)">
      <input type="checkbox" v-model="form.checked" @click.stop />
      <i class="fas fa-fw icon" :class="form.icon"></i>
      {{form.title}}
      <span>
        <i class="fa fa-angle-right link"></i>
      </span>
    </div>
    <div class="linked-layer-item toggle" :class="showSettings ? 'toggled' : ''" @click="toggleSettings()">
      <i class="fas fa-fw fa-cogs icon"></i>
      Settings
      <span>
        <i class="fa fa-angle-right toggle_icon link"></i>
      </span>
    </div>
    <component v-show="showSettings" :is="params.type" :params="params.params" class="params" @cmd="sendCommand"></component>
  </div>
</template>

<script>

import HalftoneParams from "./HalftoneParams.vue"
import StippleParams from "./StippleParams.vue"

import {Form} from "@/models.js"
import {Icon, SelectObject, createProxy} from "@/mixins.js"

export default {
  props: ["id", "pId"],
  mixins: [Icon, SelectObject],
  data: () => ({
    showForms: false,
    showSettings: false
  }),
  components: {halftone: HalftoneParams, stipple: StippleParams},
  computed: {
    params() {
      let o = this.$store.getters.getObjectById(this.id);
      let params = o.renderParams.find(p => p.id == this.pId)
      return createProxy(params, p => {
        this.$store.commit("updateRenderParams", {id: this.id, params: {id: this.pId, ...p}})
      })
    },
    images()   { return this.$store.state.images;   },
    renderer() { return this.$store.getters.getObjectById(this.params.renderer); },
    forms() {
      return this.$store.state.layers.filter(l => l instanceof Form).map(f => createProxy({
        id: f.id,
        checked: !this.params.ignoreForms.find(el => el == f.id) && true,
        title: f.title,
        icon: this.icon(f)
      }, form => {
        let forms;
        if (this.params.ignoreForms.find(el => el.id == f.id)) {
          if (form.checked)
            forms = this.params.ignoreForms.slice(params.ignoreForms.indexOf(f.id), 1)
        } else if (!form.checked) {
          forms = this.params.ignoreForms.concat([f.id])
        }
        console.log(forms)
        if (forms)
          this.$store.commit("setIgnoredForms", {id: this.id, pId: this.pId, forms})
      }))
    }
  },
  methods: {
    toggleForms() {
      this.showForms = this.forms.length > 0 && !this.showForms
    },
    toggleSettings() {
      this.showSettings = !this.showSettings
    },
    deleteParams() {
      this.$store.dispatch("removeRenderParams", {id: this.id, pId: this.params.id})
    },
    sendCommand(event) {
      this.$store.dispatch("executeRenderCommand", {pId: this.pId, cmd: event.cmd, payload: event.payload})
    }
  }
}

</script>

<style>

.render-list-item::after {
  content:"";
  display: block;
  height: 2px;
  margin: 5px 0 5px 10px;
  background: #e4e4e4;
}

.linked-layer-item.toggled {
  background: #ededed;
}

.toggle .toggle_icon {
  transition: transform .5s;
}

.toggle:hover .toggle_icon, .toggle.toggled .toggle_icon {
  transform: rotate(90deg)
}

.params {
  margin: 5px 0;
  padding-left: 10px !important;
  padding-right: 10px !important;
}


</style>
