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
    name: "",
    file: null,
    x: 0, y: 0, zoom: 1
  },
  layers: [],
  images: [],
  renderer: [],
  layouts: [],
  fonts: [],
  tools: [
    {id: "select",   icon: "mouse-pointer"},
    {id: "artboard", icon: "pen-square"   },
    {id: "image",    icon: "image"        },
    {selected: "rect",     tools: [
      {id: "rect",     icon: "square"     },
      {id: "ellipse",  icon: "circle"     },
      {id: "triangle", icon: "/triangle"  },
      {id: "polygon", icon: "/poly"       }
    ]},
    {selected: "halftone", tools: [
      {id: "halftone", icon: "/halftone"  },
      {id: "stipple",  icon: "/stipple"   }
    ]},
    {id: "text",    icon: "font"          }
  ],
  machine: new Machine(),
  default: {
    url: __static+"/default.png",
  }
}
