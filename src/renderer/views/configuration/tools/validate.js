/*
 * @Description:
 * @Date: 2022-01-11 10:06:01
 * @LastEditTime: 2022-01-11 10:27:15
 */

/**
 * 校验端口的合法性
 * @param {*} rule
 * @param {*} value
 * @param {*} callback
 */
function checkPort (rule, value, callback) {
  if (value === '') {
    return callback(new Error('请填写http端口'))
  } else if (value > 65536 || value < 3000) {
    return callback(new Error('端口范围: 3000 - 65536'))
  } else {
    callback()
  }
}

// function checkCacheCatalog (rule, value, callback) {

// }

export {checkPort}
