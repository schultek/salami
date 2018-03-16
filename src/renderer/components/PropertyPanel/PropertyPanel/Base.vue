<template>
</template>

<script>

  import Vue from "vue"
  import {CPart} from "@/models.js"
  import {SelectObject, Icon, createProxy} from "@/mixins.js"

  import TitleModule from "./Modules/TitleModule.vue"

  export default {
    props: ["id"],
    mixins: [SelectObject, Icon],
    components: {TitleModule},
    computed: {
      object: {
        get() {
          let o = this.$store.getters.getObjectById(this.id);
          return createProxy(o, obj => {
            console.log(obj);
            this.$store.commit("updateObject", {id: this.id, ...obj})
          })
        },
        set(o) {
          this.$store.commit("updateObject", o)
        }
      },
      renderer() { return this.$store.state.renderer },
      images()   { return this.$store.state.images   }
    },
    methods: {
      removeObject() {
        this.$store.dispatch("removeObject", this.object.id)
      }
    }
  }

</script>
