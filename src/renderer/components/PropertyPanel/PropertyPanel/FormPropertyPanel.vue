<template>
  <div>
    <div class="settings-title">
      <span>Titel <input type="text" v-model.lazy="object.title" v-blur/></span>
      <icon name="trash-o" @click="removeObject"></icon>
    </div>
    <div class="settings-dimensions dimen-row-3">
      <div class="dimen">
        <span>B</span><input type="number" v-model.number.lazy="object.w" v-blur/>
      </div>
      <div class="dimen">
        <span>X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
      </div>
      <div class="dimen">
        <span><icon name="repeat"></icon></span><input type="number" v-model.number.lazy="object.rot" @change="mapRotation('rot')" v-blur/>
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
        <span><icon name="adjust"></icon></span><input type="checkbox" v-model="object.mask"/>
      </div>
      <div class="dimen" v-show="object.mask">
        <span>Seperates Rendering</span><input type="checkbox" v-model="object.ownRenderer" />
      </div>
    </div>
    <div v-show="object.mask && object.ownRenderer" class="settings-panel">
      <div class="settings-header">
        <span>Rendering</span>
        <!-- <span><span>{{object.links.render!=undefined?object.links.render.title:''}}</span>
          <icon v-if="object.links.render==undefined" name="link" @click="linkingRender = true"></icon>
          <icon v-else name="trash-o" @click="selectedLayer.unlink('render')"></icon>
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
          <icon v-show="object.render.curve" style="font-size: 12px" name="sign-in" @click="selectObject(object.render.curve)"></icon>
        </div>
        <div class="dimen">
          <span>Bild</span>
          <select v-model="object.render.image">
            <option :value="image.id" v-for="image in images">
              {{image.title}}
            </option>
          </select>
          <icon v-show="object.render.image" style="font-size: 12px" name="sign-in" @click="selectObject(object.render.image)"></icon>
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
          <input type="button" value="Füllen" @click="object.fill = true"/>
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
    extends: BasePropertyPanel
  }

</script>

<style>

</style>
