<template>
  <div class="render-list-item">
    <div class="linked-layer-item" @click="selectObject(renderer.id)">
      <Icon :for="renderer"></Icon>
      <span>{{renderer.title}}</span>
      <span class="stretch"></span>
      <span>
        <i class="fas fa-trash-alt" @click.stop="deleteParams()"></i>
        <i class="fa fa-angle-right link"></i>
      </span>
    </div>
    <div class="linked-layer-item" @click="selectObject(params.image)">
      <i class="fas fa-fw fa-image icon"></i>
      <span>
        <select v-model="params.image" @click.stop="">
          <option :value="image.id" v-for="image in images">
            {{image.title}}
          </option>
        </select>
      </span>
      <span class="stretch"></span>
      <span>
        <i v-show="params.image" class="fa fa-angle-right link"></i>
      </span>
    </div>
    <div v-if="forms && forms.length > 0" class="linked-layer-item toggle" :class="showForms ? 'toggled' : ''" @click="toggleForms()">
      <i class="fas fa-fw fa-object-ungroup icon"></i>
      <span>Forms</span>
      <span class="stretch"></span>
      <span>
        <i class="fa fa-angle-right toggle_icon link" :class="showForms ? 'toggled' : ''"></i>
      </span>
    </div>
    <div v-if="showForms" class="linked-layer-item form-list-item" v-for="form in forms" @click="selectObject(form.id)">
      <input type="checkbox" v-model="form.checked" @click.stop />
      <Icon :for="form"></Icon>
      <span>{{form.title}}</span>
      <span class="stretch"></span>
      <span>
        <i class="fa fa-angle-right link"></i>
      </span>
    </div>
    <div class="linked-layer-item toggle" :class="showSettings ? 'toggled' : ''" @click="toggleSettings()">
      <i class="fas fa-fw fa-cogs icon"></i>
      <span>Settings</span>
      <span class="stretch"></span>
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
import {SelectObject, createProxy} from "@/mixins.js"
import Icon from "@/components/Icon.vue"

export default {
  props: ["id", "pId"],
  mixins: [SelectObject],
  data: () => ({
    showForms: false,
    showSettings: true
  }),
  components: {halftone: HalftoneParams, stipple: StippleParams, Icon},
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
      let i = this.$store.state.layers.indexOf(this.$store.getters.getObjectById(this.id));
      let ignoredForms = this.params.ignoreForms;
      let id = this.id, pId = this.pId;
      return this.$store.state.layers
        .filter(l => l instanceof Form && this.$store.state.layers.indexOf(l) > i)
        .concat(this.$store.state.texts.filter(t => t.asForm))
        .map(f => new Proxy(f, {
          get(target, prop) {
            if (prop == "checked")
              return !ignoredForms.find(el => el == f.id) && true
            else
              return target[prop]
          },
          set(target, prop, v) {
            if (prop == "checked")
              this.$store.commit("setIgnoredForm", {id, pId, form: {id: f.id, ignore: !v}})
            return true;
          }
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
      this.$store.commit("removeRenderParams", {id: this.id, pId: this.params.id})
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

.params {
  margin: 5px 0;
  padding-left: 10px !important;
  padding-right: 10px !important;
}


</style>
