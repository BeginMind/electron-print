/*
 * @Description:
 * @Date: 2022-01-11 17:54:26
 * @LastEditTime: 2022-01-18 14:11:35
 */
const download = require('download')
// const path = require('path')
const fse = require('fs-extra')
const fs = require('fs')
const dayjs = require('dayjs')
const { print } = require('pdf-to-printer')

let uid = 0 // 标识 id

/**
 * 下载文件到缓存目录
 * @param {String} url - 文件 http 地址
 * @param {String} cacheDir - 缓存目录地址
 * @returns {Promise} {filename} 文件名
 */
async function downloadFile (url, cacheDir) {
  const options = { }
  await download(url, cacheDir, options)
  const { filename } = getFilename(cacheDir)
  return { filename }
}

/**
 * 删除缓存文件
 * @param {String} cacheDir - 缓存目录路径
 * @param {String} filename - 文件名 (可选)
 */
async function deleteCache (cacheDir, filename) {
  const filePath = filename ? `${cacheDir}\\${filename}` : cacheDir

  fse.remove(filePath, err => {
    if (err) return console.error(err)
    // console.log('delete success')
  })
}

/**
 * 打印 pdf 文件
 * @param {String} cacheDir - 缓存目录路径
 * @param {String} filename - 文件名
 * @param {String} deviceName - 打印机名称
 * @returns {Promise}
 */
async function printPdf (cacheDir, filename, deviceName) {
  // 打印配置项
  const options = {
    printer: deviceName,
    paperSize: 'A4',
    scale: 'fit', //  Supported names noscale, shrink and fit.
    monochrome: true, // 默认打印黑白
    silent: false // 屏蔽打印错误的信息
  }
  const pdfPath = `${cacheDir}\\${filename}`

  return print(pdfPath, options).then(() => {
    console.log('打印成功')
    return Promise.resolve(true)
  })
}

/**
 * 获取文件名
 * @param {String} cacheDir -缓存目录对应的文件夹下的对应文件夹
 * @returns {String} 文件名
 */
function getFilename (cacheDir) {
  const filenames = fs.readdirSync(cacheDir)
  if (filenames.length === 1) {
    return { filename: filenames[0] }
  } else {
    throw new Error('文件不存在或文件夹内容异常')
  }
}

/**
 * 创建随机文件夹名字 - 防止文件相同导致覆盖 - 从而导致打印文件丢失或者不准确的问题
 * @param {String} cacheDir - 缓存文件夹
 * @returns {String} 文件夹名字
 */
function wrapRandomFolder (cacheDir) {
  const foldername = `${dayjs().valueOf()}_${uid}`
  uid++

  cacheDir += '\\' + foldername

  return cacheDir
}

exports.downloadFile = downloadFile
exports.deleteCache = deleteCache
exports.printPdf = printPdf
exports.getFilename = getFilename
exports.wrapRandomFolder = wrapRandomFolder
