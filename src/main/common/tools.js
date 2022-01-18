/*
 * @Description: 工具方法
 * @Date: 2022-01-17 15:15:09
 * @LastEditTime: 2022-01-18 10:45:28
 */
const { isEmpty, isPlainObject } = require('lodash')
const { EventEmitter } = require('events')

/**
 * 判断是否空对象
 * @param {Any} data
 * @returns {Boolean}
 */
function isEmptyObject (data) {
  return isEmpty(data) && isPlainObject(data)
}

exports.isEmptyObject = isEmptyObject
exports.emitter = new EventEmitter()
