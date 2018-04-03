import {ipcRenderer} from 'electron'

import Cache from "./Cache.js"

export default {
  init(store) {


    ipcRenderer.on('file', (event, arg) => {
      switch (arg) {
        case "load-project": store.dispatch("loadProject"); break;
        case "save-project": store.dispatch("saveProject"); break;
        case "save-project-as": store.dispatch("saveProject", true); break;
        case "export-layout": /*TODO*/ break;
        case "export-gcode": /*TODO*/ break;
        case "settings": /*TODO*/ break;
      }
    });

    ipcRenderer.on("edit", (event, arg) => {
      console.log(arg);
      switch (arg) {
        case "copy": Cache.copy(); break;
        case "paste": Cache.paste(); break;
        case "cut": Cache.cut(); break;
        case "delete": Cache.delete(); break;
      }
    });

    ipcRenderer.on("insert", (event, arg) => {
      switch (arg) {
        case "artboard": store.commit("selectTool", "artboard"); break;
        case "image": store.commit("selectTool", "image"); break;
        case "rect": store.commit("selectTool", "rect"); break;
        case "ellipse": store.commit("selectTool", "ellipse"); break;
        case "triangle": store.commit("selectTool", "triangle"); break;
        case "polygon": store.commit("selectTool", "polygon"); break;
        case "halftone": store.commit("selectTool", "halftone"); break;
        case "stipple": store.commit("selectTool", "stipple"); break;
        case "text": store.commit("selectTool", "text"); break;
      }
    })

    ipcRenderer.on("layout", (event, arg) => {
      switch (arg) {
        case "create": store.dispatch("createNewLayout"); break;
      }
    })

    ipcRenderer.on("view", (event, arg) => {
      switch (arg) {
        case "center": store.dispatch("centerProject"); break;
      }
    })

  }
}
