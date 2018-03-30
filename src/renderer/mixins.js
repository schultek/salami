
import {Artboard, Form, Image, HalftoneRenderer, StippleRenderer, Text} from "@/models.js"

export let SelectObject = {
  methods: {
    selectObject(id) {
      this.$store.commit("selectObject", id)
    }
  }
}

export let ToTimeString = {
  methods: {
    toTimeString(time) {
      var h = Math.floor(time/60);
      var m = Math.round(time - h*60);
      return (h>0?h+"h ":"")+m+"m";
    }
  }
}

export function createProxy(o, update) {
  return new Proxy(o, handler(update, o))
}

function handler(update, orig) {
  return {
    get(target, prop) {
      if (target[prop] !== null && typeof target[prop] === "object" && prop != "__ob__") {
        return new Proxy(target[prop], handler(child => update({[prop]: child}, orig)))
      } else {
        return target[prop]
      }
    },
    set(target, prop, v) {
      if (prop != "__ob__")
        update({[prop]: v}, orig)
      else
        target[prop] = v
      return true;
    }
  }
}
