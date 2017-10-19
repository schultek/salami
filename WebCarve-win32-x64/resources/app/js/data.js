var data = {
  proto: {
    machine: {
      dimens: {
        w: 300,
        h: 200,
        x: 0,
        y: 0
      },
      bit: {
        width: 2.0,
        height: 3.2,
        tip: 0.1,
        inDepth: 1
      },
      speed: {
        feedrate: 200,
        feedrateDot: 400,
        seekrate: 800
      },
      outHeight: 1.5
    },
    layer: {
      title: "Layer",
      id: getId(),
      dimens: {
        w: 300,
        h: 200,
        x: 0,
        y: 0,
        rot: 0
      },
      border: {
        left: 5,
        right: 5,
        top: 5,
        bottom: 5
      },
      render: {
        curve: null,
        image: null,
        lines: {
          l: 1,
          r: 1,
          fill: false
        },
        inverted: false,
        dotted: false,
        refinedEdges: 100,
        smooth: 50
      },
      links: {}
    },
    form: {
      title: "Form",
      id: getId(),
      type: "rect",
      dimens: {
        w: 300,
        h: 200,
        x: 0,
        y: 0,
        rot: 0
      },
      mask: false,
      ownRenderer: false,
      render: {
        curve: null,
        image: null,
        lines: {
          l: 200,
          r: 300,
          fill: false
        },
        dotted: false,
        refinedEdges: 100,
        smooth: 50
      }
    },
    image: {
      title: "Bild",
      id: getId(),
      dimens: {
        w: 300,
        h: 200,
        x: 0,
        y: 0,
        rot: 0
      }
    },
    curve: {
      title: "Linie",
      id: getId(),
      type: "Bogen",
      dimens: {x: 150, y: 100},
      direction: 45,
      stretch: 20,
      gap: 5,
      steps: 10
    }
  },
  project: {
    name: "Unbenannt",
    xPos: 50,
    yPos: 50,
    zoom: 2,
    progress: [],
    autoAdjustMachine: true
  },
  machine: {},
  layers: [],
  images: [],
  pixels: [],
  gcodes: [],
  curves: [],
  texts: [/*{
    text: "Hallo",
    dimens: {
      x: 100,
      y: 100,
      w: 0,
      h: 0
    },
    size: 12,
    font: "BalooBhaijaan-Regular.ttf"
  }*/],
  fonts: [],
  tools: {
    select: {mode: "select", icon: "mouse-pointer"},
    image: {icon: "picture-o"},
    part: {icon: "th-large"},
    curve: {icon: "pencil"},
    rect: {icon: "square-o"},
    ellipse: {icon: "circle-o"},
    text: {icon: "font"},
  },
  selectedTool: null,
  selectedLayer: null,
  selectedLayout: null,
  sublayers_open: false,
  linking: {
    layer: null,
    prop: null
  },
  mouse: {
    x: 0,
    y: 0,
    mode: ""
  },
  svg: null,
  sidepanel: 0,
  layouts: [],
  fullPreview: false,
  live: {
    data: "",
    id: ""
  }
};


function getId() {
  var idform = [4, 4];
  var id = "";
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
