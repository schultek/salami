<template>
  <div>
    <div class="settings-title">
      <span>Titel <input type="text" v-model.lazy="object.title" v-blur/></span>
      <i class="fa fa-trash-alt" @click="removeObject"></i>
    </div>
    <div class="settings-dimensions dimen-row-3">
      <div class="dimen">
        <span>B</span><input type="number" v-model.number.lazy="object.w" v-blur/>
      </div>
      <div class="dimen">
        <span>X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
      </div>
      <div class="dimen">
        <span><i class="fa fa-repeat"></i></span><input type="number" v-model.number.lazy="object.rot" @change="mapRotation('rot')" v-blur/>
      </div>
      <div class="dimen">
        <span>H</span><input type="number" v-model.number.lazy="object.h" v-blur/>
      </div>
      <div class="dimen">
        <span>Y</span><input type="number" v-model.number.lazy="object.y" v-blur/>
      </div>
    </div>
    <div class="settings-dimensions dimen-row">
      <div class="dimen">
        <span><i class="fa fa-adjust"></i></span><input type="checkbox" v-model="object.mask"/>
      </div>
      <div class="dimen" v-show="object.mask">
        <span>Seperates Rendering</span><input type="checkbox" v-model="object.ownRenderer" />
      </div>
    </div>
    <div v-show="object.mask && object.ownRenderer" class="settings-panel">
      <div class="settings-header">
        <span>Rendering</span>
        <!-- <span><span>{{object.links.render!=undefined?object.links.render.title:''}}</span>
          <i v-if="object.links.render==undefined" class="fa fa-link" @click="linkingRender = true"></i>
          <i v-else class="fa fa-trash-alt" @click="selectedLayer.unlink('render')"></i>
        </span>
        <ul v-show="linkingRender">
          <li v-for="layer in layers.filter(el=>is(el, CPart) & el!=selectedLayer)" @click="selectedLayer.linkTo(layer); linkingRender = false">
            {{layer.$.title}}
          </li>
        </ul> -->
      </div>
      <div class="settings.dimenstions dimen-row">
        <div class="dimen">
          <span>Kurve</span>
          <select v-model="object.render.curve">
            <option :value="curve.id" v-for="curve in curves">
              {{curve.title}}
            </option>
          </select>
          <i v-show="object.render.curve" style="font-size: 12px" class="fa fa-sign-in" @click="selectObject(object.render.curve)"></i>
        </div>
        <div class="dimen">
          <span>Bild</span>
          <select v-model="object.render.image">
            <option :value="image.id" v-for="image in images">
              {{image.title}}
            </option>
          </select>
          <i v-show="object.render.image" style="font-size: 12px" class="fa fa-sign-in" @click="selectObject(object.render.image)"></i>
        </div>
      </div>
      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <span>Linien</span><span>L</span><input type="number" v-model.number.lazy="object.render.lines.l" v-blur/>
        </div>
        <div class="dimen">
          <span>R</span><input type="number" v-model.number.lazy="object.render.lines.r" v-blur/>
        </div>
        <div class="dimen">
          <input type="button" value="Füllen" @click="fillLines"/>
        </div>
        <div class="dimen">
          <span>Kantenglättung</span><input type="number" v-model.number.lazy="object.render.refinedEdges" v-blur />
        </div>
        <div class="dimen">
          <span>Pixelglättung (%)</span><input type="number" v-model.number.lazy="object.render.smooth" v-blur />
        </div>
      </div>
    </div>
    <div v-if="object.gcode" class="settings-panel">
      <div class="settings-header">
        <span>Zeit</span>
      </div>
      <div class="settings-dimensions dimen-row">
        <div class="dimen">
          <span>Benötigte Zeit</span><span>{{asTimeString(object.gcode.time)}}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  import BasePropertyPanel from "./BasePropertyPanel.vue"

  export default {
    extends: BasePropertyPanel,
    methods: {
      fillLines() {
        this.$store.dispatch("fillLinesForLayer", this.id)
      }
    }
  }

</script>

<style>

</style>
