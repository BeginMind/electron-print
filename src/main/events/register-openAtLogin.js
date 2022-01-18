/*
 * @Description:注册软件自启动
 * @Date: 2022-01-14 11:05:45
 * @LastEditTime: 2022-01-14 11:30:51
 */
const storage = require('electron-json-storage')

const { app, ipcMain } = require('electron')
const { isPlainObject, isEmpty } = require('lodash')

const isProd = process.env.NODE_ENV === 'production'
const key = 'configuration-openAtLogin' // storage 的 key

const options = {
  openAtLogin: true,
  path: process.execPath,
  args: []
}

/**
 * 判断是否空对象
 * @param {Object} data
 * @returns {Boolean}
 */
function isEmptyObject (data) {
  return isPlainObject(data) && isEmpty(data)
}

/**
 * 获取本地 storage 中的相关设置
 * @param {Function} callback - 获取后需要做的回调
 */
function getStorageSettings (callback) {
  storage.get(key, (err, data) => {
    if (err) throw err

    if (isEmptyObject(data)) {
      options.openAtLogin = true
    } else {
      options.openAtLogin = data.value
    }
    callback(options)
  })
}

/**
 * 注册开机启动
 */
function registerOpenAtLogin (params) {
  // 获取可执行文件位置
  app.setLoginItemSettings(params)
  console.log(params)
}

/**
 * 生产环境下才注册主进程事件
 *
 * 指引: https://www.electronjs.org/zh/docs/latest/api/app#appsetloginitemsettingssettings-macos-windows
 *
 */
if (isProd) {
  // 每次启动时注册一下
  getStorageSettings(registerOpenAtLogin)

  // 注册开机自启动相关的事件的事件监听
  ipcMain.on('register-setLoginItemSettings', (e, argv) => {
    const params = Object.assign({}, options, argv)
    registerOpenAtLogin(params)
  })
}
