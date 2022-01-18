/*
 * @Description: 显示打印面板
 * @Date: 2022-01-14 14:07:18
 * @LastEditTime: 2022-01-17 16:48:29
 */
const path = require('path')
const storage = require('electron-json-storage')

const { isEmptyObject } = require('../common/tools')
const { BrowserWindow, ipcMain, screen } = require('electron')

const html = path.join(__static, 'queue-panel/index.html')

let win = null
// let isClosed = false

// 打印队列进度条窗口大小
const windowSize = {
  width: 270,
  height: 15
}

shouldBeCreate()

/**
 * 创建打印加载队列的动画提示面板
 */
function createQueuePanelWin () {
  const { x, y } = getShowPosition()

  win = new BrowserWindow({
    width: windowSize.width,
    height: windowSize.height,
    x,
    y,
    alwaysOnTop: true,
    frame: false, // 取消window自带的关闭最小化等
    resizable: false, // 禁止改变主窗口尺寸
    transparent: true, // 透明窗口
    backgroundColor: '#00000000',
    webPreferences: { // 修复 index.html require失败  的问题的配置
      nodeIntegration: true, // 开启node环境
      // 官网似乎说是默认false，但是这里必须设置  contextIsolation
      contextIsolation: false
    }
  })
  win.loadFile(html)
  // isClosed = false

  win.hide() // 默认隐藏
}

/**
 * 是否需要创建打印进度条窗口
 *
 * 步骤:
 * 1. 查询 storage 中有无存着配置相关
 * 2. 有则读取配置决定是否创建窗口, 无则默认创建窗口
 *
 * NOTE: 打印进度条窗口创建默认是隐藏而不显示
 */
function shouldBeCreate () {
  // NOTE: 默认创建窗口但是不显示
  const key = 'configuration-displayQueuePanel'
  storage.get(key, (err, data) => {
    if (err) throw err
    if (isEmptyObject(data)) {
      // 默认创建打印队列窗口
      createQueuePanelWin()
    } else {
      // 为 false 则不创建
      const { value } = data
      if (value) createQueuePanelWin()
    }
  })
}

// 是否创建打印进度条窗口
ipcMain.on('user-create-queue-panel', (e, needCreate = true) => {
  if (needCreate) {
    !win && createQueuePanelWin()
  } else {
    win && closeQueuePanelWindow()
  }
})

// 打印进度条显示与隐藏
ipcMain.on('display-queue-panel', (e, needDisplay = false) => {
  if (needDisplay) {
    !win && createQueuePanelWin()
    win && showQueuePanelWindow()
  } else {
    // closeQueuePanelWindow()
    win && win.hide()
  }
})

/**
 * @description: 获取显示位置(一般在右下角)
 * @return {*}
 */
function getShowPosition () {
  const currentScreen = screen.getPrimaryDisplay()
  const { width, height } = currentScreen.workArea
  // console.log(currentScreen)
  // 设窗口大小为 270 * 120
  //   const [x, y] = [width - windowSize.width, height - windowSize.height];

  // console.log(width)
  // 出现在左下角
  const [x, y] = [width - windowSize.width, height - windowSize.height]

  return { x, y }
}

/**
 * 显示打印面板
 */
function showQueuePanelWindow () {
  if (win.isMinimized()) win.restore()
  win.show()
}

/**
 * 关闭队列面板动画显示
 */
function closeQueuePanelWindow () {
  win && win.close()
  win = null
}

/**
 * 隐藏窗口
 */
function hideQueuePanelWindow () {
  console.log('隐藏')
  win && win.hide()
}

exports.showQueuePanelWindow = showQueuePanelWindow
exports.hideQueuePanelWindow = hideQueuePanelWindow
exports.closeQueuePanelWindow = closeQueuePanelWindow
exports.getQueuePanelWindow = () => win
