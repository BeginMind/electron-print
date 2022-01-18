/*
 * @Description: 创建打印窗口
 * @Date: 2022-01-06 11:57:49
 * @LastEditTime: 2022-01-07 15:41:19
 */
import { ipcMain } from 'electron'
import { getMainWindow } from '../index'

/**
 * webContent 打印
 * @param {Object} arg
 */
function handlePrint (arg) {
  // const { deviceName } = arg

  const mainWin = getMainWindow()
  const contents = mainWin.webContents

  contents.print(arg, (success, errorType) => {
    if (!success) console.log(errorType)
  })
}

ipcMain.on('print-pdf', (e, arg) => {
  handlePrint(arg)
})
