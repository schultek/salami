<template>
</template>

<script>

  import Vue from "vue"

  function defineReactive(o, react, k, update) {
    if (typeof o[k] === 'object') {
      react[k] = {}
      Object.keys(o[k]).forEach(k2 => defineReactive(o[k], react[k], k2, update))
    } else {
      Object.defineProperty(react, k, {
        get() {
          return o[k]
        },
        set(v) {
          //console.log("Set Property "+k+" to "+v)
          o[k] = v;
          update()
        }
      })
    }
  }

  export default {
    props: ["id"],
    computed: {
      object: {
        get() {
          let o = JSON.parse(JSON.stringify(this.$store.getters.getObjectById(this.id)))
          let reactive = {}
          Object.keys(o).forEach(k => {
            defineReactive(o, reactive, k, () => {
              this.$store.commit("updateObject", o)
            })
          })
          return reactive
        },
        set(o) {
          this.$store.commit("updateObject", o)
        }
      },
      objects() {
        return this.$store.getters.getObjectsByType
      },
      curves() {
        return this.objects.curves
      },
      images() {
        return this.objects.images
      }
    },
    methods: {
      selectObject(id) {
        this.$store.commit("selectObject", id)
      },
      removeObject() {
        this.$store.dispatch("removeObject", this.object.id)
      },
      asTimeString(time) {
        return this.$store.getters.getTimeString(time)
      }
    }
  }

</script>
