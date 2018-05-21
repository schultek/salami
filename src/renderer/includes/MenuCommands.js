import {ipcRenderer} from 'electron'

import Cache from "./Cache.js"
import Modal from "./Modal.js"

let keysEnabled = true;

export default {
  init(store) {

    ipcRenderer.on('file', (event, arg) => {
      switch (arg) {
        case "new": /*TODO*/ break;
        case "new-template": /*TODO*/ break;
        case "load-project": store.dispatch("loadProject"); break;
        case "save-project": store.dispatch("saveProject"); break;
        case "save-project-as": store.dispatch("saveProject", true); break;
        case "export-png": /*TODO*/ break;
        case "export-svg": /*TODO*/ break;
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
        case "rename":
          if (keysEnabled && store.state.selectedObject)
            Modal.show("name-layer", {id: store.state.selectedObject})
          break;
      }
    });

    ipcRenderer.on("insert", (event, arg) => {
      if (!keysEnabled) return;
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

    ipcRenderer.on("view", (event, arg) => {
      switch (arg) {
        case "center": store.dispatch("centerProject"); break;
      }
    })

    document.addEventListener("keyup", event => {
      if (keysEnabled && event.key == "Escape") {
        store.commit("selectTool", "select")
        store.commit("selectObject", null)
      }
    })

  },
  disableKeys() {
    keysEnabled = false;
  },
  enableKeys() {
    keysEnabled = true;
  }
}
