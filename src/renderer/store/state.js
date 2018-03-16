import {Machine} from "@/models.js"

export default {
  quickMode: false,
  fullPreview: false,
  navigationPanel: 0,
  selectedObject: null,
  selectedTool: "select",
  subLayersOpen: false,
  selectedLayout: null,
  progress: null,
  centered: false,
  project: {
    name: "Unbenannt",
    file: null,
    x: 0, y: 0, zoom: 1
  },
  layers: [],
  images: [],
  texts: [],
  renderer: [],
  layouts: [],
  fonts: [],
  tools: [
    {id: "select",   icon: "mouse-pointer"},
    {id: "cpart",    icon: "th-large"     },
    {id: "image",    icon: "image"        },
    {selected: "rect",     tools: [
      {id: "rect",     icon: "square" },
      {id: "ellipse",  icon: "circle" }
    ]},
    {selected: "halftone", tools: [
      {id: "halftone", icon: "leaf"   },
      {id: "stipple",  icon: "eye"    }
    ]},
    {id: "text",    icon: "font"         }
  ],
  machine: new Machine(),
  imgDefault: {
    url: __static+"/default.png"
  }
}
