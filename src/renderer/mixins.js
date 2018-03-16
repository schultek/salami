
import {CPart, Form, Image, HalftoneRenderer, StippleRenderer, Text} from "@/models.js"

let icons;
function makeIcons(tools) {
  icons = {}
  for (let tool of tools) {
    if (tool.id) {
      icons[tool.id] = "fa-"+tool.icon
    } else {
      for (let t of tool.tools) {
        icons[t.id] = "fa-"+t.icon;
      }
    }
  }
}

export let Icon = {
  methods: {
    icon(payload) {
      if (!icons) makeIcons(this.$store.state.tools);
      let o = {};
      if (typeof payload === "object") o = payload;
      if (typeof payload === "string") o = this.$store.getters.getObjectById(payload);
      if (o instanceof CPart) {
        return icons.cpart;
      } else if (o instanceof Form) {
        return o.type == "rect" ? icons.rect : icons.ellipse
      } else if (o instanceof Image) {
        return icons.image
      } else if (o instanceof HalftoneRenderer) {
        return icons.halftone
      } else if (o instanceof StippleRenderer) {
        return icons.stipple
      } else if (o instanceof Text) {
        return icons.text
      } else {
        return "fa-exclamation-circle"
      }
    }
  }
}

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
