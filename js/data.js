var data = {
  project: {
    name: "Unbenannt",
    xPos: 50,
    yPos: 50,
    zoom: 2,
    progress: [],
    autoAdjustMachine: false
  },
  machine: {},
  layers: [],
  images: [],
  gcodes: [],
  curves: [],
  texts: [],
  fonts: [],
  pixels: {},
  tools: {},
  selectedTool: null,
  selectedLayer: null,
  selectedLayout: null,
  sublayers_open: false,
  svg: null,
  sidepanel: 0,
  layouts: [],
  fullPreview: false,
  live: {
    data: "",
    id: ""
  },
  linkingBorder: false,
  linkingRender: false
};


function getId() {
  var idform = [4, 4];
  var id = String.fromCharCode(65+Math.round(Math.random()*26));
  for (let i=0; i<idform[0]; i++) {
    if (i>0) id += "-";
    for (let j=0; j<idform[1]; j++) {
      var r = Math.round(Math.random()*62);
      if (r < 26) {
        id += String.fromCharCode(65+r);
      } else if (r < 52) {
        id += String.fromCharCode(71+r);
      } else {
        id += (r-52);
      }
    }
  }
  return id;
}
