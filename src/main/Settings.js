
import {BrowserWindow, ipcMain} from "electron"

let settingsWindow;
let parentWindow;

export default {
  init(mainWindow) {
    parentWindow = mainWindow
    ipcMain.on("settings", (e, arg) => {
      if (arg == "close") {
        if (settingsWindow) {
          settingsWindow.close()
          settingsWindow = null;
        }
      }
    })

  },
  open() {
    settingsWindow = new BrowserWindow({frame: false, parent: parentWindow, modal: true})
    settingsWindow.loadURL(`file://${__settings}/settings.html`)
  }
}
