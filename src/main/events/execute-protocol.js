/*
 * @Description: 设置唤醒 app 的自定义协议
 * @Date: 2022-04-14 16:18:38
 * @LastEditTime: 2022-04-14 16:39:09
 */

/**
 * WARM: 在引入该操作后, 可能会引起以下问题：
 * 1. 在安装应用的时候,安装过程中会被杀毒软件提示说 "xxx 修改协议关联" , 点击允许就行;
 *
 *
 *
 * NOTE: 怎么通过注册表查看自定义协议
 *
 * 1. win + r 打开运行台;
 * 2. 输入 "regedit",  打开注册表
 * 3. 点击 tab栏 的"编辑" - "查找", 勾选"全字匹配",在输入框中输入下面标识符
 */
const path = require('path')

const { app } = require('electron')
const { showMainWin } = require('../index')

const PROTOCOL_IDENTIFY = 'BFSilentPrint' // 唤醒标识, 在这里设置大小写只是为了更好标识, 但是通过注册表查看发现, 其实在注册表中的唤醒词都是小写的

// 获取单实例锁 - 防止重复通过协议打开应用
const isLock = app.requestSingleInstanceLock()
if (!isLock) {
  // 如果获取失败，说明已经有实例在运行了，直接退出
  app.quit()
}

//  参数列表
const args = []
if (!app.isPackaged) {
  args.push(path.resolve(process.argv[1]))
}
args.push('--')

// 设置唤醒
app.setAsDefaultProtocolClient(PROTOCOL_IDENTIFY, process.execPath, args)

// 通过事件监听, 如果 app 已经打开, 则触发下面方法
app.on('second-instance', (event, argv) => {
  // 可以在链接后面带参数, 灵活开发。
  // 例如: BFSilentPrint://name=bigFish&age=24 ....
  console.log('---', argv)
  // window 处理
  if (process.platform === 'win32') {
    // 直接显示主界面
    showMainWin()
    event.preventDefault()
  }
})

module.exports = { protocolIdentify: PROTOCOL_IDENTIFY }
