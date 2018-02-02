import path from "path"

export default {
  quickMode: false,
  fullPreview: false,
  navigationPanel: 0,
  selectedObject: null,
  selectedTool: "select",
  subLayersOpen: false,
  selectedLayout: null,
  progress: 0,
  centered: false,
  project: {
    name: "Unbenannt",
    file: null,
    x: 0, y: 0, zoom: 1
  },
  objects: [],
  layouts: [],
  fonts: [],
  tools: [
    {id: "select",  icon: "mouse-pointer"},
    {id: "image",   icon: "image"        },
    {id: "cpart",   icon: "th-large"     },
    {id: "rect",    icon: "square"       },
    {id: "ellipse", icon: "circle"       },
    {id: "curve",   icon: "leaf"         },
    {id: "text",    icon: "font"         }
  ],
  machine: { //TODO set default values in settings
    w: 300, h: 200,
    bit: {width: 2.0, height: 3.2, tip: 0.1, inDepth: 1.5},
    speed: {feedrate: 300, feedrateDot: 600, seekrate: 1000},
    outHeight: 1
  },
  imgDefault: {
    url: path.join(__static, "default.png")
  },
  paths: [],
  gcodes: []
}
