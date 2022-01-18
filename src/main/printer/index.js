/*
 * @Description:
 * @Date: 2022-01-05 17:44:11
 * @LastEditTime: 2022-01-13 16:06:59
 */

// import { getMainWindow } from '../index'
// import { ipcMain } from 'electron'

// import './create-print-win'

const { getMainWindow } = require('../index')
const { ipcMain } = require('electron')
require('./create-print-win')

/**
 * 获取打印机列表
 */
ipcMain.handle('get-printer-list', async () => {
  const mainWindow = getMainWindow()
  const contents = mainWindow.webContents
  const printers = contents.getPrinters()

  return printers
})
