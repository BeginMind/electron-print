/* eslint-disable no-unused-vars */
/*
 * @Description:
 * @Date: 2022-01-10 17:39:25
 * @LastEditTime: 2022-01-18 10:50:11
 */
const log = require('electron-log')
const path = require('path')
// eslint-disable-next-line camelcase
const child_process = require('child_process')
const { emitter } = require('../common/tools')
const { ipcMain } = require('electron')
const { getQueuePanelWindow, showQueuePanelWindow, hideQueuePanelWindow } = require('./queue-panel')
// eslint-disable-next-line camelcase

const HIDE_DELAY_TIME = 4500 // timer 的时间

let server = null // 子进程服务
let timer = null // 隐藏打印队列窗口的定时器

/**
 * 将子进程 express 的打印队列消息, 通过进程事件发送到 打印队列窗口的渲染进程
 * @param {Object} data
 *
 * NOTE: 子进程通过 process.send 发送消息到父进程
 */
function notifyQueuePanel (data) {
  const { printQueue } = data
  // 打印队列提示面板
  let queuePanelWin = getQueuePanelWindow()
  if (queuePanelWin) {
    showQueuePanelWindow()
    queuePanelWin.webContents.send('loading-queue-print', data)

    // 剩余队列没有时, 代表打印完成了
    if (printQueue.length === 0) {
      timer = setTimeout(() => {
        hideQueuePanelWindow()
      }, HIDE_DELAY_TIME)
    } else {
      clearTimeout(timer)
      timer = null
    }
  }
}

/**
 * @description: 创建 express 服务
 * @param {?} __static - 静态文件存储位置全局变量
 * @param {Number} httpPort - express 打印服务
 * @param {Number} socketPort - socket 打印服务
 * @param {String} cacheDir - 文件缓存文件夹路径
 * @param {String} deviceName - 打印机名字
 */
function createExpressServer (__static, httpPort, socketPort, cacheDir, deviceName) {
  log.info('开始启动 express 打印服务')
  const printerServerPath = path.join(__static, 'express-process/app.js')

  server = child_process.fork(printerServerPath, [__static, httpPort - 0, socketPort - 0, cacheDir, deviceName], { silent: true })

  // 子进程通信
  server.on('message', (data) => {
    // console.log('收到子进程消息: ', data)
    const { result, type } = data
    switch (type) {
      case 'queue-status':
        notifyQueuePanel(result)
        break
      case 'preview-file':
        emitter.emit('win-preview-file', result)
        break
      default:
        break
    }
  })

  // 监听子进程 console 信息
  server.stdout.on('data', (data) => {
    log.info('child_process: express - ', data.toString())
    // console.log('child_process: express - ', data.toString())
  })

  // 监听子进程错误
  server.on('error', (err) => {
    // 如果控制器中止，则这将在 err 为 AbortError 的情况下被调用
    log.info('child_process: express - error ', err.toString())
  })

  log.info('createExpressServer - done')
}

/**
   * 启动打印的 express 服务
   */
ipcMain.handle('launch-print-server', async (e, argv) => {
  const { httpPort, socketPort, cacheDir, deviceName } = argv
  console.log(httpPort, socketPort, cacheDir, deviceName)

  // eslint-disable-next-line no-constant-condition
  createExpressServer(__static, httpPort, socketPort, cacheDir, deviceName)

  console.log('已开启 express ')
  return { status: 1, message: '已开启' }
})

/**
   * 关闭 express 打印服务
   */
ipcMain.handle('shutDown-print-server', async (e, argv) => {
  server.kill()

  console.log('已关闭 express ')
  return { status: 1, message: '已关闭' }
})
