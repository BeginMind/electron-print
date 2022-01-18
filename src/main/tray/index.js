/*
 * @Date: 2021-08-17 10:12:30
 * @LastEditTime: 2022-01-14 13:58:54
 * @Description: 托盘
 */
const { Tray, app, Menu } = require('electron')
const { showMainWin } = require('../index')
// const { createAboutWindow } = require('./about')
const path = require('path')

let tray
let menu

app.whenReady().then(() => {
  const iconPath = path.join(__static, 'logo/icon.ico')
  tray = new Tray(iconPath)

  //   菜单
  const contextMenu = Menu.buildFromTemplate([
    { label: `打开${app.name}`, click: showMainWin },
    // { label: `关于${app.name}`, click: createAboutWindow },
    { label: '退出', click: () => { app.exit() } }
  ])

  tray.on('double-click', showMainWin)
  tray.setToolTip(app.name)
  tray.setContextMenu(contextMenu)
  menu = Menu.buildFromTemplate([])
  app.applicationMenu = menu
})
