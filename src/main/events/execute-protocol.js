/*
 * @Description: 设置唤醒 app 的自定义协议
 * @Date: 2022-04-14 16:18:38
 * @LastEditTime: 2022-04-15 14:59:01
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
const log = require('electron-log')

const { app } = require('electron')
const { showMainWin, hideMainWin } = require('../index')

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
  // 例如: BFSilentPrint://hide=1&age=24 ....
  console.log('---', argv)
  // window 处理
  if (process.platform === 'win32') {
    const query = handleArguments(argv)
    log.info('handleArguments: ', query)
    const hide = query.hide
    if (hide && Number(hide) === 1) {
      // 隐藏主界面
      hideMainWin()
    } else {
      // 直接显示主界面
      showMainWin()
    }

    event.preventDefault()
  }
})

/**
 * 处理 protocol 协议参数
 * @param {any[]} argv
 * @returns {object}
 */
function handleArguments (argv) {
  const offset = app.isPackaged ? 1 : 2

  const prefix = `${PROTOCOL_IDENTIFY.toLowerCase()}://`
  let protocolInfo = argv.find((arg, i) => i >= offset && arg.startsWith(prefix))

  protocolInfo = protocolInfo.replace(`${prefix}`, '')
  if (protocolInfo.endsWith('/'))protocolInfo = protocolInfo.slice(0, -1)
  log.info('protocolInfo: ', protocolInfo)

  let argList = protocolInfo.split('&')
  const query = {}
  argList.forEach(arg => {
    try {
      const [key, value] = arg.split('=')
      query[key] = value
    } catch (e) {
      console.log(e)
    }
  })
  return query
}

exports.protocolIdentify = PROTOCOL_IDENTIFY
