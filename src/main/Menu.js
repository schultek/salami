
import {app, Menu, globalShortcut} from "electron"

import Settings from "./Settings"

export default {
  init(mainWindow) {

    let c = process.platform === 'darwin' ? 'Cmd' : 'Ctrl'

    let send = (cmd, arg) => () => mainWindow.webContents.send(cmd, arg)

    const template = [
      {
        label: 'File',
        submenu: [
          {label: 'Open', accelerator: c+"+O", click: send('file', 'load-project')},
          {label: 'Save', accelerator: c+"+S", click: send('file', 'save-project')},
          {label: 'Save As', accelerator: c+"+Shift+S", click: send('file', 'save-project-as')},
          {type: 'separator'},
          {label: 'Export', submenu: [
            {label: 'Layout', click: send('file', 'export-layout')},
            {label: 'GCode', click: send('file', 'export-gcode')},
          ]},
          {type: 'separator'},
          {label: "Settings", click: () => {
            Settings.open()
          }}
        ]
      },
      {
        label: 'Edit',
        submenu: [
          {label: 'Copy', accelerator: c+"+C", click: send('edit', 'copy')},
          {label: 'Paste', accelerator: c+"+V", click: send('edit', 'paste')},
          {label: 'Cut', accelerator: c+"+X", click: send('edit', 'cut')},
          {type: "separator"},
          {label: "Delete", accelerator: c+"+Backspace", click: send("edit", "delete")},
          {label: "Rename", accelerator: c+"+Enter", click: send("edit", "rename")}
        ]
      },
      {
        label: 'Insert',
        submenu: [
          {label: 'Artboard', accelerator: "A", click: send('insert', 'artboard')},
          {label: 'Image', accelerator: "I", click: send('insert', 'image')},
          {label: 'Form', submenu: [
            {label: 'Rectangle', accelerator: "R", click: send('insert', 'rect')},
            {label: 'Ellipse', accelerator: "E", click: send('insert', 'ellipse')},
            {label: 'Triangle', accelerator: "T", click: send('insert', 'triangle')},
            {label: 'Polygon', accelerator: "P", click: send('insert', 'polygon')}
          ]},
          {label: 'Renderer', submenu: [
            {label: 'Halftone', accelerator: "H", click: send('insert', 'halftone')},
            {label: 'Stippling', accelerator: "S", click: send('insert', 'stipple')}
          ]},
          {label: 'Text', accelerator: "X", click: send('insert', 'text')}
        ]
      },
      {
        label: 'Layout',
        submenu: [
          {label: 'Create from Project', accelerator: c+"+L", click: send('layout', 'create')}
        ]
      },
      {
        label: 'View',
        submenu: [
          {label: 'Center', accelerator: c+"+Alt+C", click: send('view', 'center')},
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
    }

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }
}
