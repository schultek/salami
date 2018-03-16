
import {TouchBar, ipcMain} from "electron"

const {TouchBarLabel, TouchBarButton, TouchBarSpacer} = TouchBar

export default {
  init(mainWindow) {

    let touchBar = new TouchBar([
      new TouchBarButton({
        icon: __static+"/icons/square.png",

        click: () => {
          mainWindow.webContents.send("touchbar", "square")
        }
      })
    ])

    mainWindow.setTouchBar(touchBar)
  }
}
