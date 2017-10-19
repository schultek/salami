const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu;

const path = require('path')
const url = require('url')

let mainWindow

function createWindow () {

  mainWindow = new BrowserWindow({title: "WebCarve", width: 1350, height: 850, webPreferences: {nodeIntegrationInWorker: true}});

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))


  //mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  });

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
    template[3].submenu = [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  if (process.env.NODE_ENV !== 'production') {
    require('vue-devtools').install()
  }
}


app.setName("WebCarve");
//app.dock.setIcon("img/curve1.png");

app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});
