import { app, BrowserWindow, ipcMain } from 'electron'
import Menu from "./Menu"
import LauncherMenu from "./LauncherMenu"
import TouchBar from "./Touchbar"
import Settings from "./Settings"

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  global.__settings = require('path').join(__dirname, '/settings').replace(/\\/g, '\\\\')
  global.__launcher = require('path').join(__dirname, '/launcher').replace(/\\/g, '\\\\')
}

let mainWindow, launcherWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`
const launcherURL = `file://${__launcher}/launcher.html`

function createLauncherWindow() {

  launcherWindow = new BrowserWindow({
    width: 800, height: 600, fullscreen: false, minimizable: false, maximizable: false, resizable: false,
    titleBarStyle: "hiddenInset", frame: false
  })

  launcherWindow.loadURL(launcherURL);
  launcherWindow.on('closed', () => {
    launcherWindow = null;
  });

  LauncherMenu.init(launcherWindow);

  ipcMain.on("file", (e, arg) => {
    if (arg == "open") {
      createMainWindow();
    }
  })

}

function createMainWindow () {

  if (launcherWindow) {
    launcherWindow.close()
    launcherWindow = null;
  }

  mainWindow = new BrowserWindow({
    width: 1350,
    height: 850,
    fullscreen: true
  })

  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => {
    mainWindow = null
    createLauncherWindow();
  })

  Menu.init(mainWindow)
  // TouchBar.init(mainWindow)

  Settings.init()

}

app.on('ready', createLauncherWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (launcherWindow === null && mainWindow === null) {
    createLauncherWindow()
  }
})

app.setName("Salami");
