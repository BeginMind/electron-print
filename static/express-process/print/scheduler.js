/*
 * @Description: 打印任务调度器
 * @Date: 2022-01-12 15:54:30
 * @LastEditTime: 2022-01-18 10:47:39
 */
const { cloneDeep } = require('lodash')
const wrapPrintQueue = [] // 包装前的打印队列
let currentPrint = null // 当前正在打印的
let printQueue = [] // 包装后的打印队列

let uid = 1024 // 打印队列的 uid (会加工在 printInfo 中)
let totalNum = 0 // 实时队列中打印总数 - printQueue 为空时会置为 0

const statusQueue = [] // 登记打印状态 (成功与失败) - 用于返回状态给打印进度条 window
const successCbs = {} // 回调事件等 - 单个打印队列的
const multipleStatusQueue = [] // 用于返回多个打印时的队列状态

/**
 * 登记打印状态 - 成功或者失败
 * @param {Object} current - 当前打印的对象
 * @param {Object} options
 */
function registerStatus (current, options) {
  const v = cloneDeep(current)
  v.status = options.status
  options.error && (v.error = options.error)

  statusQueue.push(v)
}

/**
 * 发送消息到父进程, 最终目的用于通知 打印队列 loading 面板
 * @param {Boolean} isLast - 是否最后的消息 (即: 打印队列完成时的标识)
 *
 * WARM: 打印完成时, 返回打印结果(成功与失败的)
 */
function sendQueueStatus (isLast = false) {
  const result = { printQueue, currentPrint, totalNum }
  if (isLast) {
    const success = []
    const fail = []
    statusQueue.forEach((item) => {
      item.status === 0 ? fail.push(item) : success.push(item)
    })
    result.result = { success, fail }
  }
  process.send({ result, type: 'queue-status' })

  // 清空结果队列, 等待下一次新增
  isLast && statusQueue.splice(0)
}

/**
 * 打印队列调度器
 */
class PrintScheduler {
  // static printQueue = []
  // static currentPrint = null
  static printerFn = null

  constructor (printerFn) {
    if (!printerFn) throw new Error('printerFn必须传, 且必须为 Promise ')
    console.warn('printerFn必须为 Promise')

    PrintScheduler.printerFn = printerFn // 打印方法

    function getter (obj, prop) {
      // console.log('prop: ', prop)
      if (prop === 'push' && obj.length === 0) {
        // 新增第一份的时候, 其他的都不响应
        // shift 的时候在 print 中调用 flush callback

        // process.nextTick(PrintScheduler.printNext)
        // queueMicrotask(PrintScheduler.printNext)

        // 默认延迟 300 毫秒, 防止同时调用而显示上出现差别
        setTimeout(PrintScheduler.printNext, 300)
      }

      return prop in obj ? obj[prop] : '没有'
    }

    function setter (obj, prop, value) {
      // 设置新值
      obj[prop] = value

      return true
    }

    const handler = { get: getter, set: setter }
    printQueue = new Proxy(wrapPrintQueue, handler) // Array

    // PrintScheduler.printQueue = printQueue
    // PrintScheduler.currentPrint = currentPrint
  }
  /**
   * 获取打印队列实例
   * @returns {Array}
   */
  getPrintQueue () {
    return { printQueue: printQueue, currentPrint }
  }

  /**
   * 新增打印任务
   * @param {*} printInfo
   */
  insert (printInfo, successCb) {
    console.log('调用insert')
    if (Object.prototype.toString.call(printInfo) === '[object Object]') {
      printInfo.__uid__ = uid
    }

    // NOTE: 单个打印需要注册回调来代理 express 中的 respond (handlePrintSuccess中用到)
    // NOTE: 批量打印中的回调不是在这挂载处理 (在 handleMultiplePrint 中处理)
    if (printInfo.isSingle) {
      successCbs[`_cb_${uid}`] = {
        __uid__: uid,
        __fileUid__: printInfo.__fileUid__,
        successCb
      }
    }

    uid++
    totalNum++
    printQueue.push(printInfo)
    // console.log(successCbs)
  }

  /**
   * 打印完当前的这份后, 刷新队列
   */
  static flushPrintQueue () {
    printQueue.shift()
    currentPrint = null
    if (printQueue.length > 0) {
      PrintScheduler.printNext()
    } else {
      // currentPrint = null
      totalNum = 0
      console.log('========打印完成了========')
      sendQueueStatus(true)
    }
  }

  /**
   * 打印下一份内容
   */
  static async printNext () {
    if (printQueue.length > 0) {
      let options = {}

      try {
        currentPrint = printQueue[0]
        sendQueueStatus()

        const res = await (PrintScheduler.printerFn && PrintScheduler.printerFn(currentPrint))

        const { status, error } = res

        // 下载并打印成功
        if (status === true) {
          options = { status: 1 }
        } else {
          // 下载失败或这有其他错误
          options = { status: 0, error }
        }
      } catch (e) {
        options = { status: 0, error: e }
      } finally {
        // 注册状态, 用于返回状态给打印进度条面板
        registerStatus(currentPrint, options)

        // 当前打印的属于单个打印
        if (currentPrint.isSingle) {
          PrintScheduler.handlePrintSuccess(currentPrint, options)
        } else {
          // 当前打印的属于批量打印队列
          PrintScheduler.handleMultiplePrint(currentPrint, options)
        }
      }

      // 刷新队列
      PrintScheduler.flushPrintQueue()
    }
  }

  /**
   * 处理 express 的响应回调
   * @param {Object} currentPrint - 当前打印的内容
   * @param {Object} options - 回调选项内容
   */
  static handlePrintSuccess (currentPrint, options) {
    // NOTE: 不管成功还是失败都要返回结果, 并将其从队列中移除
    if (!options) throw new Error('options不能为空')

    const { __uid__ } = currentPrint
    const { successCb } = successCbs[`_cb_${__uid__}`]
    const { status, error } = options

    if (status === 0) {
      successCb(0, error || '执行打印过程异常')
    } else successCb()

    delete successCbs[`_cb_${__uid__}`]
  }

  /**
   * 处理 express 的响应回调
   * @param {Object} currentPrint - 当前打印的内容
   * @param {Object} options - 回调选项内容
   */
  static handleMultiplePrint (currentPrint, options) {
    // NOTE: 不管成功还是失败都要返回结果, 并将其从队列中移除
    if (!options) throw new Error('options不能为空')

    console.log(currentPrint, options)

    const { start, end, __multipleId__, __fileUid__, successCallback } = currentPrint

    // 包装一下数据, 将当前属于一个批量打印队列的信息放到同一个数组中
    multipleStatusQueue.push(statusQueue[statusQueue.length - 1])

    /**
     * NOTE: 何时使用回调来响应 http 请求
     * 步骤:
     * 1. 在 app.js 中 调用 insert 之前, 将打印信息包装了一层, 批量打印时会将 增加 start, end字段来标识该 打印队列 的起始 fileUid 和结束的 fileUid 。
     * 2. 当前 end === __fileUid__ 时表示当前打印的是当前 批量打印队列的最后一个了
     * 3. 队里中最后一个会挂载了 successCallback 的字段, 里面放的是 http respond 的方法
     */
    if (end === __fileUid__) {
      const data = multipleStatusQueue.map((wrapPrintInfo) => {
        console.log(wrapPrintInfo)
        const { status, error, fileUrl } = wrapPrintInfo
        const item = {
          status: status === 1 ? '打印成功' : '打印失败',
          fileUrl
        }
        error && (item.error = error)
        return item
      })

      // 响应请求
      successCallback(1, data)

      // 当前批量打印队列已经完成
      // 清空当前批量打印队列, 等待下一个批量打印队列进入任务
      multipleStatusQueue.splice(0)
    }
  }
}

module.exports = PrintScheduler
