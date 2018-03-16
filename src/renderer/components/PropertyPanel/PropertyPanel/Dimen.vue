<template>
  <div class="dimen">
    <span class="title">
      <template v-if="title && title.startsWith('fa-')">
        <i class="fa fa-sm" :class="title"></i>
      </template>
      <template v-else>
        {{title}}
      </template>
    </span>
    <span class="input">
      <input v-if="type=='number'" type="number" v-model.number.lazy="dimen" v-blur @focus="focus(true)" @blur="focus(false)"/>
      <input v-else-if="type=='checkbox'" type="checkbox" v-model="dimen" v-blur @focus="focus(true)" @blur="focus(false)" />
      <input v-else-if="type=='text'" type="text" v-model.lazy="dimen" v-blur @focus="focus(true)" @blur="focus(false)" />
      <select v-else-if="type=='select'" v-model="dimen">
        <option :value="option.value || option" v-for="option in options">
          {{option.title || option}}
        </option>
      </select>
      <span v-if="unit && showUnit" class="unit">{{unit}}</span>
    </span>
  </div>
</template>

<script>

export default {
  props: ["title", "unit", "type", "value", "options"],
  data: () => ({
    showUnit: true
  }),
  computed: {
    dimen: {
      get() { return this.value; },
      set(i) { this.$emit("input", i); }
    }
  },
  methods: {
    focus(f) {
      this.showUnit = !f
    }
  }
}

</script>

<style>

.dimen-row-2 .dimen { width: 50%; }
.dimen-row-2 .dimen .input { width: 50%; }

.dimen-row-3 .dimen { width: 33%; }
.dimen-row-3 .dimen .input { width: 70%; }

.dimen-row-4 .dimen { width: 25%; }
.dimen-row-4 .dimen .input { width: 80%; }

.dimen {
  height: 40px;
  padding: 10px 5px;
  box-sizing: border-box;
  display: flex;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: center;
}

.dimen .title {
  display: block;
  font-size: 11px;
  padding: 5px 5px;
  box-sizing: border-box;
}

.dimen .input input, .dimen .input select {
  width: 100%;
  box-sizing: border-box;
}

.dimen .input input {
  padding-right: 5px;
}

.dimen .input {
  width: 50%;
  position: relative;
}

.dimen .input .unit {
  position: absolute;
  font-size: 10px;
  top: 50%;
  right: 0;
  transform: translate(0,-50%);
  opacity: .6;
}

.dimen .input:hover .unit {
  display: none;
}

</style>
