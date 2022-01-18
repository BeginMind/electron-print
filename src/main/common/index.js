/*
 * @Description: 通用事件
 * @Date: 2022-01-11 11:00:51
 * @LastEditTime: 2022-01-11 16:15:44
 */
const path = require('path')

const { ipcMain } = require('electron')
const { app, dialog } = require('electron')

const choiceFilePathKey = 'choice-file-path' // 选择文件夹
const getExeInstallPathKey = 'get-exeInstall-path' // 获取软件安装路径
/**
 * 选择文件夹路径事件入口
 */
async function getFilePath () {
  let result
  try {
    result = await new Promise((resolve) => {
      dialog.showOpenDialog(null, {
        properties: ['openFile', 'openDirectory']
      }).then((result) => {
        resolve(result)
      }).catch((err) => {
        console.log(err)
      })
    })
  } catch (e) {
    console.log(e)
    result = false
  }
  // console.log('是否取消选择:', result.canceled)
  // console.log('文件路径:', result.filePaths)
  return result
}

/**
 * 获取程序安装目录
 * @returns {String}
 */
function getExeInstallPath () {
  return path.dirname(app.getPath('exe'))
}

/**
 * 加载事件
 */
function installCommonEvents () {
  ipcMain.handle(choiceFilePathKey, getFilePath)
  ipcMain.handle(getExeInstallPathKey, getExeInstallPath)
}

installCommonEvents()

exports.getExeInstallPath = getExeInstallPath
