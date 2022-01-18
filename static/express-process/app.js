/*
 * @Description: express 单个打印服务
 * @Date: 2022-01-10 17:29:37
 * @LastEditTime: 2022-01-18 14:09:51
 */
const express = require('express')
const PrintScheduler = require('./print/scheduler.js')

const app = express()

const { downloadFile, printPdf, deleteCache, wrapRandomFolder } = require('./print/index.js')

const [,, __static, httpPort = 45656, socketPort, cacheDir, deviceName] = process.argv
console.log(__static, httpPort, socketPort, cacheDir, deviceName)

// NOTE: 打印队列实例
const printScheduler = new PrintScheduler(handlePrint)

// eslint-disable-next-line no-constant-condition
if (10 > 11) {
  console.log(socketPort, deviceName)
  console.log(printPdf)
}

let fileUid = 0 // 每个文件打印的 id 标识 (唯一, 会递增)
let multipleQueueIndex = 0 // 同一个打印队列的 id 标识 (唯一, 会递增)

// 允许跨域
app.all('*', (req, res, next) => {
  // console.log(req.headers.origin)
  // console.log(req.environ)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  // res.header("Access-Control-Allow-Origin", '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Content-Length, Authorization, Accept,X-Requested-With')
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header('X-Powered-By', ' 3.2.1')
  if (req.method === 'OPTIONS') res.send(200)/* 让options请求快速返回 */
  else next()
})

app.get('/', (req, res) => {
  res.send({
    code: '200',
    message: 'express-print'
  })
})

/**
 * 预览文件 (只能单个预览)
 */
app.get('/preview', (req, res) => {
  const { fileUrl } = req.query
  console.log('preview - ', fileUrl)

  if (!fileUrl) res.send({ code: '400', message: 'fileUrl不能为空' })
  else {
    // 通知父进程, 然后通过  EventEmitter 来触发 file-preview.js 中的创建窗口预览
    process.send({ type: 'preview-file', result: fileUrl })
    res.send(204)
  }
})

/**
 * 多个打印
 * NOTE: 用 ; 隔开
 * 事例: localhost:45656/print?fileUrl=http://xxxx;http://zzzzzz;http://yyyyy
 */
app.post('/multiple-print', (req, res) => {
  try {
    const { fileUrl } = req.query
    const urls = fileUrl.split(';')
    const wrapUrls = urls.map(url => {
      const printInfo = createPrintInfo(url, false)
      return printInfo
    })

    const startUid = wrapUrls[0].__fileUid__ // 该段队列的起始点 fileUid
    const endUid = wrapUrls[wrapUrls.length - 1].__fileUid__ // 该段队列的结束点 fileUid

    const printCallback = (status, data) => {
      let respondData = {}
      if (status === 1) {
        respondData = {
          code: '200',
          data,
          message: `打印完成`
        }
      }
      res.send(respondData)
    }

    wrapUrls.forEach((element, index) => {
      // ==========
      element.start = startUid
      element.end = endUid
      element.__multipleId__ = multipleQueueIndex // 每个批量的队列都有自己的 id 标识
      // ==========

      printScheduler.insert(element, printCallback)

      // 该条多个打印队列中添加回调
      if (wrapUrls.length - 1 === index) {
        element.successCallback = printCallback // 将队列最后一个成员添加 callback
      }
    })

    multipleQueueIndex++
  } catch (e) {
    res.send({
      code: '400',
      message: e + ''
    })
  }
})

/**
 * 单个打印服务
 * NOTE: 需要创建打印队列, 因为打印机只能一份一份打印
 *
 * 事例: localhost:45656/print?fileUrl=http://xxxx
 */
app.post('/print', (req, res, next) => {
  console.log('-------------------------------------------')
  /**
   * NOTE:
   * 实现步骤:
   * 1. 在目标缓存目录下继续创建随机文件夹(目的防止文件重名覆盖或重命名)
   * 2. 通过步骤 1 在目标文件夹下下载文件
   * 3. 下载完成后打印对应的 pdf 文件
   * 4. 打印完删除对应的随机文件夹 (不是删除文件)
   */
  const { fileUrl } = req.query

  console.log('文件地址: ', fileUrl)

  let respondData = {}
  if (fileUrl) {
    const printInfo = createPrintInfo(fileUrl)

    const printCallback = (status = 1, e) => {
      // 成功
      if (status === 1) {
        respondData = {
          code: '200',
          message: `打印完成`
        }
      } else {
        respondData = {
          code: '500',
          message: `执行下载打印过程失败: ` + e
        }
      }

      res.send(respondData)
    }

    printScheduler.insert(printInfo, printCallback)
  } else {
    respondData = {
      code: '400',
      message: 'fileUrl不能为空'
    }
    res.send(respondData)
  }

  // next()
})

/**
 * 创建打印任务信息
 * @param {String} fileUrl - 文件地址
 * @param {Boolean} isSingle - 是否单个打印
 * @returns {Object}
 */
function createPrintInfo (fileUrl, isSingle = true) {
  if (!fileUrl) throw new Error('fileUrl不能为空')
  const printInfo = {
    cacheDir,
    fileUrl,
    __fileUid__: fileUid,
    isSingle
  }
  fileUid++

  return printInfo
}

/**
 * 处理打印任务
 * @returns {Promise} { status:Boolean, ?error:String }
 */
async function handlePrint ({ fileUrl }) {
  try {
    // 包装一下文件夹 - 让它变成随机的
    const randomCacheDir = wrapRandomFolder(cacheDir)
    // // 下载文件
    const { filename } = await downloadFile(fileUrl, randomCacheDir)

    // NOTE: 正式打印 ========== ↓
    await printPdf(randomCacheDir, filename, deviceName)
    deleteCache(randomCacheDir) // 这一步直接删除文件夹
    // NOTE: 正式打印 ========== ↑

    // // NOTE: 测试用例 ========== ↓
    // await new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve()
    //   }, 1000)
    // })
    // deleteCache(randomCacheDir)
    // // NOTE: 测试用例 ========== ↑

    console.log('已完成的文件', filename)

    return { status: true }
  } catch (e) {
    return { status: false, error: e + '' }
  }
}

// 启动服务
app.listen(Number(httpPort), () => void console.log(`server open on ${Number(httpPort)}!`))
