
import {app, Menu, globalShortcut} from "electron"

export default {
  init(launcherWindow) {

    let c = process.platform === 'darwin' ? 'Cmd' : 'Ctrl'

    let send = (cmd, arg) => () => launcherWindow.webContents.send(cmd, arg)

    const template = [
      {
        label: 'File',
        submenu: [
          {label: 'Open', accelerator: c+"+O", click: send('file', 'load-project')},
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
