
import {app, Menu} from "electron"

import Settings from "./Settings"

export default {
  init(mainWindow) {

    let c = process.platform === 'darwin' ? 'Cmd' : 'Ctrl'

    const template = [
      {
        label: 'File',
        submenu: [
          {label: 'Open', accelerator: c+"+O", click: () => mainWindow.webContents.send('file', 'load-project')},
          {label: 'Save', accelerator: c+"+S", click: () => mainWindow.webContents.send('file', 'save-project')},
          {label: 'Save As', accelerator: c+"+Shift+S", click: () => mainWindow.webContents.send('file', 'save-project-as')},
          {type: 'separator'},
          {label: 'Export', submenu: [
            {label: 'Layout', click: () => mainWindow.webContents.send('file', 'export-layout')},
            {label: 'GCode', click: () => mainWindow.webContents.send('file', 'export-gcode')},
          ]},
          {type: 'separator'},
          {label: "Settings", click: () => {
            Settings.open()
          }}
        ]
      },
      {
        label: 'Insert',
        submenu: [
          {label: 'Artboard', accelerator: "A", click: () => mainWindow.webContents.send('insert', 'artboard')},
          {label: 'Image', accelerator: "I", click: () => mainWindow.webContents.send('insert', 'image')},
          {label: 'Form', submenu: [
            {label: 'Rectangle', accelerator: "R", click: () => mainWindow.webContents.send('insert', 'rect')},
            {label: 'Ellipse', accelerator: "E", click: () => mainWindow.webContents.send('insert', 'ellipse')},
            {label: 'Triangle', accelerator: "T", click: () => mainWindow.webContents.send('insert', 'triangle')},
            {label: 'Polygon', accelerator: "P", click: () => mainWindow.webContents.send('insert', 'polygon')}
          ]},
          {label: 'Renderer', submenu: [
            {label: 'Halftone', accelerator: "H", click: () => mainWindow.webContents.send('insert', 'halftone')},
            {label: 'Stippling', accelerator: "S", click: () => mainWindow.webContents.send('insert', 'stipple')}
          ]},
          {label: 'Text', accelerator: "X", click: () => mainWindow.webContents.send('insert', 'text')}
        ]
      },
      {
        label: 'Layout',
        submenu: [
          {label: 'Create from Project', accelerator: c+"+L", click: () => mainWindow.webContents.send('layout', 'create')}
        ]
      },
      {
        label: 'View',
        submenu: [
          {role: 'reload'},
          {label: 'Center', click: () => mainWindow.webContents.send('view', 'center')},
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
      template[5].submenu = [
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
