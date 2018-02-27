<template>
  <div>
    <div class="settings-title">
      <span>Titel <input type="text" v-model.lazy="object.title" v-blur/></span>
      <i class="fa fa-trash-alt" @click="removeObject"></i>
    </div>
    <div class="size-warning" v-show="sizewarning">
      <i class="fa fa-compress" @click="compressPart"></i>
      <span>This Part is bigger then your machine. Resize!</span>
    </div>
    <div class="settings-dimensions dimen-row-2">
      <div class="dimen">
        <span>B</span><input type="number" v-model.number.lazy="object.w" v-blur/>
      </div>
      <div class="dimen">
        <span>X</span><input type="number" v-model.number.lazy="object.x" v-blur/>
      </div>
      <div class="dimen">
        <span>H</span><input type="number" v-model.number.lazy="object.h" v-blur/>
      </div>
      <div class="dimen">
        <span>Y</span><input type="number" v-model.number.lazy="object.y" v-blur/>
      </div>
    </div>
    <div class="settings-panel">
      <div class="settings-header">
        <span>Rand</span>
      </div>
      <div class="settings-dimensions dimen-row-4">
        <div class="dimen">
          <span><i class="fa fa-caret-right"></i></span><input type="number" v-model.number.lazy="object.border.left" v-blur/>
        </div>
        <div class="dimen">
          <span><i class="fa fa-caret-left"></i></span><input type="number" v-model.number.lazy="object.border.right" v-blur/>
        </div>
        <div class="dimen">
          <span><i class="fa fa-caret-down"></i></span><input type="number" v-model.number.lazy="object.border.top" v-blur/>
        </div>
        <div class="dimen">
          <span><i class="fa fa-caret-up"></i></span><input type="number" v-model.number.lazy="object.border.bottom" v-blur/>
        </div>
      </div>
    </div>
    <div class="settings-panel linked-layer-list">
      <div class="settings-header">
        <span>Rendering</span>
      </div>
        <div class="linked-layer-item render-link" @click="selectObject(object.render.curve)">
          <i class="fa fa-fw fa-leaf"></i>
          <select v-model="object.render.curve" @click.stop="">
            <option :value="curve.id" v-for="curve in curves">
              {{curve.title}}
            </option>
          </select>
          <span>
            <i v-show="object.render.curve" class="fa fa-angle-right switch_to"></i>
          </span>
        </div>
        <div class="linked-layer-item render-link" @click="selectObject(object.render.image)">
          <i class="fas fa-fw fa-image"></i>
          <select v-model="object.render.image" @click.stop="">
            <option :value="image.id" v-for="image in images">
              {{image.title}}
            </option>
          </select>
          <span>
            <i v-show="object.render.image" class="fa fa-angle-right switch_to"></i>
          </span>
        </div>
      <div class="settings-dimensions dimen-row" style="padding-left: 10px !important; padding-right: 10px !important;">
        <div class="dimen">
          <span>Linien</span>
          <span>L</span><input type="number" v-model.number.lazy="object.render.lines.l" v-blur/>
        </div>
        <div class="dimen">
          <span>R</span><input type="number" v-model.number.lazy="object.render.lines.r" v-blur/>
        </div>
        <div class="dimen">
          <input type="button" value="Füllen" @click="fillLines"/>
        </div>
        <div class="dimen">
          <span>Punkte</span><input type="checkbox" v-model="object.render.dotted" />
        </div>
        <div class="dimen">
          <span><i class="fa fa-adjust"></i></span><input type="checkbox" v-model="object.inverted"/>
        </div>
        <div class="dimen">
          <span>Kantenglättung (%)</span><input type="number" v-model.number.lazy="object.render.refinedEdges" v-blur />
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
    computed: {
      sizewarning() {
        return this.object.w > this.$store.state.machine.w || this.object.h > this.$store.state.machine.h
      }
    },
    methods: {
      fillLines() {
        this.$store.dispatch("fillLinesForLayer", this.id)
      },
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

.switch_to {
  vertical-align: middle;
}

.switch_to:hover {
  color: #008dea;
}

.size-warning {
  background: #ededed;
  font-size: 12px;
  padding: 5px 10px !important;
  border-left: 3px solid red;
  border-bottom: none !important;
}

.size-warning i {
  margin: 5px;
}

.size-warning i:hover {
  color: #008dea;
}

.render-link {
  padding-left: 20px;
}

.linked-layer-item select {
  height: 100%;
}

.linked-layer-item:hover select {
  background: #ededed;
}

.linked-layer-item:hover select:hover {
  color: #008dea;
}

</style>
