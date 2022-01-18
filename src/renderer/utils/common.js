/*
 * @Date: 2021-08-16 10:35:32
 * @LastEditTime: 2022-01-17 16:26:15
 * @Description: file content
 */
import storage from 'electron-json-storage'
import { ipcRenderer } from 'electron'
import { httpPort, socketPort, cacheDirName } from '@/settings'
import { isEmpty, isPlainObject } from 'lodash'

/**
 * 获取本地打印机列表
 * @returns {Array}
 */
export async function getPrinterList () {
  const res = await ipcRenderer.invoke('get-printer-list')
  console.table(res)
  return res || []
}

/**
 * 获取本地缓存设置的默认打印机
 * @returns {Object}
 */
export async function getDefaultPrinter () {
  const printers = await getPrinterList()
  const data = storage.getSync('configuration-defaultPrinter')
  let printer = ''
  if (isEmptyObject(data)) {
    let listDefault = printers.find(({ isDefault }) => isDefault)
    listDefault = listDefault ? listDefault.name : ''
    printer = listDefault
  } else {
    // 设置本地缓存中设置的
    printer = data.value
  }
  return { printer, printers }
}

/**
 * 获取软件安装目录
 * @returns {Promise}
 */
export async function getExeInstallPath () {
  const res = await ipcRenderer.invoke('get-exeInstall-path')
  return Promise.resolve(res)
}

/**
 * 读取用户本地端口配置
 * @returns {Object}
 */
export function getLocalSettingsPort () {
  const localHttpPort = storage.getSync('configuration-port-http')
  const localSocketPort = storage.getSync('configuration-port-socket')
  const res = {
    httpPort: isEmptyObject(localHttpPort) ? httpPort : localHttpPort.value,
    socketPort: isEmptyObject(localSocketPort) ? socketPort : localSocketPort.value
  }
  return res
}

/**
 * 获取本地缓存路径设置
 * @returns {Promise}
 */
export async function getLocalSettingsCache () {
  const cacheDir = storage.getSync('configuration-cacheDir')
  let value = ''
  let defaultPath = ''
  let localInstallPath = ''
  value = isEmptyObject(cacheDir) ? false : cacheDir.value
  if (value) {
    localInstallPath = value
    defaultPath = await getExeInstallPath() + '\\' + cacheDirName
  } else {
    localInstallPath = defaultPath = await getExeInstallPath() + '\\' + cacheDirName
  }
  return { default: defaultPath, local: localInstallPath }
}

export function copyText (text) {
  const createInput = document.createElement('input')
  createInput.value = text
  document.body.appendChild(createInput)
  createInput.select() // 选择对象
  document.execCommand('Copy') // 执行浏览器复制命令
  createInput.style.display = 'none'
}

/**
 * 判断是否空对象
 * @param {Any} param
 * @returns {Boolean}
 */
export function isEmptyObject (param) {
  return isPlainObject(param) && isEmpty(param)
}

export default {}
