
export default {
  quickMode: false,
  fullPreview: false,
  navigationPanel: 0,
  selectedObject: null,
  selectedTool: "select",
  subLayersOpen: false,
  selectedLayout: null,
  project: {
    name: "Unbenannt",
    file: null,
    x: 0, y: 0, zoom: 1,
    autoAdjustMachine: true
  },
  objects: [],
  layouts: [],
  fonts: [],
  tools: [
    {id: "select",  icon: "mouse-pointer"},
    {id: "image",   icon: "picture-o"    },
    {id: "cpart",   icon: "th-large"     },
    {id: "rect",    icon: "square-o"     },
    {id: "ellipse", icon: "circle-o"     },
    {id: "curve",   icon: "leaf"         },
    {id: "text",    icon: "font"         }
  ],
  machine: { //TODO set default values in settings
    x: 0, y: 0, w: 300, h: 200,
    bit: {width: 2.0, height: 3.2, tip: 0.1, inDepth: 1.5},
    speed: {feedrate: 300, feedrateDot: 600, seekrate: 1000},
    outHeight: 1
  },
  imgDefault: {
    url: "./src/renderer/assets/default.png"
  },
  pixels: {},
  paths: {
    cpart: [],
    text: [],
    curve: []
  },
  gcodes: {
    text: [],
    cpart: []
  },
  workers: []
}
