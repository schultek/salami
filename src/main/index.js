import { app, BrowserWindow } from 'electron'
import Menu from "./Menu"
import TouchBar from "./Touchbar"
import Settings from "./Settings"

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  global.__settings = require('path').join(__dirname, '/settings').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWindow () {

  mainWindow = new BrowserWindow({
    width: 1350,
    height: 850,
    fullscreen: true
  })

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => mainWindow = null)

  Menu.init(mainWindow)
  // TouchBar.init(mainWindow)

  Settings.init()

}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
app.setName("Salami");
