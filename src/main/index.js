import { app, BrowserWindow, Menu } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    width: 1350,
    height: 850,
    webPreferences: {nodeIntegrationInWorker: true},
    useContentSize: true,
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const template = [
    {
      label: 'Datei',
      submenu: [
        {label: 'Öffnen', click: () => mainWindow.webContents.send('file', 'load-project')},
        {label: 'Speichern', click: () => mainWindow.webContents.send('file', 'save-project')},
        {label: 'Speichern Als', submenu: [
          {label: 'Projekt', click: () => mainWindow.webContents.send('file', 'save-project')},
          {label: 'Layout', click: () => mainWindow.webContents.send('file', 'save-layout')},
          {label: 'GCode', click: () => mainWindow.webContents.send('file', 'save-gcode')},
        ]}
      ]
    },
    {
      label: 'Erweitert',
      submenu: [
        {label: 'Tour ansehen', click: () => mainWindow.webContents.send('file', 'tour')},
        {label: 'Pre-Gcode', click: () => mainWindow.webContents.send('file', 'pregcode')},
        {label: 'Post-Gcode', click: () => mainWindow.webContents.send('file', 'postgcode')},
        {label: 'Auto-Leveling', click: () => mainWindow.webContents.send('file', 'autoleveling')}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      role: 'window',
      submenu: [
        {role: 'minimize'},
        {role: 'close'}
      ]
    }
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'}
      ]
    })

    // Window menu
    template[4].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
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

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
