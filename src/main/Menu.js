
import {app, Menu} from "electron"

import Settings from "./Settings"

export default {
  init(mainWindow) {
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
          ]},
          {label: "Einstellungen", click: () => {
            Settings.open()
          }}
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
}
