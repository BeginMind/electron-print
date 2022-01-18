<!--
 * @Description: 配置页
 * @Date: 2022-01-11 09:54:35
 * @LastEditTime: 2022-01-17 16:55:12
-->
<template>
  <div id="configuration">
    <a-form-model ref="ruleForm"
                  :model="ruleForm"
                  :rules="rules"
                  v-bind="layout"
                  style=" padding-bottom:20px">
      <!-- 打印机设置 start -->
      <a-form-model-item label="默认打印机 : "
                         prop="defaultPrinter">
        <!-- <a-checkbox v-model="ruleForm.defaultPrinter.value"
                    :size="widgetSize">
          开机自启
        </a-checkbox> -->

        <a-select style="width: 240px"
                  :size="widgetSize"
                  v-model="ruleForm.defaultPrinter.value">
          <a-select-option :value="printer.name"
                           v-for="(printer, index) in printers"
                           :key="index">
            {{ printer.isDefault ? `${printer.displayName} (默认)` : printer.displayName }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <!-- 打印机设置  end -->

      <!-- express 打印服务端口 start -->
      <a-form-model-item has-feedback
                         label="http端口 :"
                         prop="printerExpressPort.value">
        <a-input-number v-model="ruleForm.printerExpressPort.value"
                        type="number"
                        autocomplete="off"
                        :min="3000"
                        :max="65536"
                        :size="widgetSize"
                        :placeholder="'默认: ' + ruleForm.printerExpressPort.default"
                        :style="{ ...style.portInput }">
        </a-input-number>
      </a-form-model-item>
      <!-- express 打印服务端口  end -->

      <!-- socket 打印服务端口 start -->
      <a-form-model-item has-feedback
                         label="socket端口 :"
                         prop="printerSocketPort.value">
        <a-input-number v-model="ruleForm.printerSocketPort.value"
                        type="number"
                        :size="widgetSize"
                        autocomplete="off"
                        :min="3000"
                        :max="65536"
                        :placeholder="'默认: ' + ruleForm.printerSocketPort.default"
                        :style="{ ...style.portInput }">
        </a-input-number>
      </a-form-model-item>
      <!-- socket 打印服务端口  end -->

      <!-- 开机自启 start -->
      <a-form-model-item label="启动 : "
                         prop="openAtLogin">
        <a-checkbox v-model="ruleForm.openAtLogin.value"
                    :size="widgetSize">
          开机自启
        </a-checkbox>
      </a-form-model-item>
      <!-- 开机自启  end -->

      <!-- 打印队列动画 start -->
      <a-form-model-item label="提示 : "
                         prop="displayQueuePanel">
        <a-checkbox v-model="ruleForm.displayQueuePanel.value"
                    :size="widgetSize">
          打印进度提示 <em>(打印时, 屏幕右下角显示打印队列进度条)</em>
        </a-checkbox>
      </a-form-model-item>
      <!-- 打印队列动画  end -->

      <!-- 缓存目录 start -->
      <a-form-model-item label="缓存目录 : "
                         prop="cacheCatalog"
                         :help="cacheTips">
        <a-button type="primary"
                  :size="widgetSize"
                  @click="changeCacheDir"
                  style="margin-bottom: 5px">更改目录</a-button>
        <p class="cache-catalog">{{ ruleForm.cacheCatalog.value }}</p>
      </a-form-model-item>
      <!-- 缓存目录  end -->

      <!-- <a-divider type="
                  vertical" /> -->
      <a-form-model-item style="text-align: center;">
        <a-button type="primary"
                  @click="saveConfig">
          保存
        </a-button>
        <a-button @click="resetConfig"
                  style="margin-left: 10px">
          恢复默认
        </a-button>
      </a-form-model-item>
    </a-form-model>
  </div>
</template>
<script>
import storage from 'electron-json-storage'

import { ipcRenderer } from 'electron'
import { checkPort } from './tools/validate'
import { isEmptyObject, getDefaultPrinter } from '@/utils/common'
import { isEmpty, isPlainObject } from 'lodash'
import { socketPort, httpPort, openAtLogin, displayQueuePanel } from '@/settings'

const configuration = {
  defaultPrinter: 'configuration-defaultPrinter', // 默认打印机 key
  cacheDir: 'configuration-cacheDir', // 缓存文件夹设置路径 key
  httpPort: 'configuration-port-http', // http 端口 key
  socketPort: 'configuration-port-socket', // socket 端口 key
  openAtLogin: 'configuration-openAtLogin', // 开机自启 key
  displayQueuePanel: 'configuration-displayQueuePanel' // 显示打印进度条 key
}
const cacheDirName = 'download-cache' // NOTE: 缓存文件夹名字
const [choiceFilePath, getExeInstallPath] = ['choice-file-path', 'get-exeInstall-path']

export default {
  name: 'configuration',

  data () {
    return {
      widgetSize: 'small', // 控件大小
      printers: [], // 打印机列表
      ruleForm: {
        defaultPrinter: { // 默认打印机
          default: '',
          value: '',
          key: configuration.defaultPrinter
        },
        printerExpressPort: { // express 打印服务的端口
          default: httpPort, // 默认配置
          value: httpPort, // 当前值
          key: configuration.httpPort // 本地缓存的 key
        },
        printerSocketPort: { // socket 打印服务的端口
          default: socketPort,
          value: socketPort,
          key: configuration.socketPort
        },
        cacheCatalog: { // 缓存目录
          default: '',
          value: '',
          key: configuration.cacheDir
        },
        openAtLogin: { // 开机自启动设置
          default: openAtLogin,
          value: openAtLogin,
          key: configuration.openAtLogin
        },
        displayQueuePanel: { // 显示打印进度条
          default: displayQueuePanel,
          value: displayQueuePanel,
          key: configuration.displayQueuePanel
        }
      },
      rules: {
        'printerExpressPort.value': [{ validator: checkPort, trigger: 'change' }],
        'printerSocketPort.value': [{ validator: checkPort, trigger: 'change' }]
      },
      layout: {
        layout: 'vertical'
      },
      style: {
        portInput: { width: '130px' }
      },
      cacheTips: '默认将打印文件下载到该文件夹中'
    }
  },

  computed: {

  },

  watch: {
    ruleForm: {
      deep: true,
      handler (val) {
        const { printerExpressPort: http, printerSocketPort: socket } = val
        if (http.value === socket.value) {
          this.$message.warning('http端口不能与socket端口相同')
        }
      }
    }
  },

  created () {
    this.getPrinterConfigs() // 获取默认打印机

    this.getCacheDir()
    this.getLocalSettingsPort()
    this.getCommonConfig()
  },

  methods: {
    /**
     * 获取本地缓存设置默认打印机 和打印机列表
     */
    async getPrinterConfigs () {
      const { printer, printers } = await getDefaultPrinter()
      this.printers = printers
      this.ruleForm.defaultPrinter.value = printer
      this.ruleForm.defaultPrinter.default = printers.find(({ isDefault }) => isDefault).name
    },
    /**
     * 设置打印进度条提示
     */
    setDisplayQueuePanel () {
      // 通知主进程 创建/关闭 打印进度条面板
      ipcRenderer.send('user-create-queue-panel', this.ruleForm.displayQueuePanel.value)
    },
    /**
     * 设置开机自启动
     */
    setOpenAtLogin () {
      const data = { openAtLogin: this.ruleForm.openAtLogin.value }
      ipcRenderer.send('register-setLoginItemSettings', data)
    },
    /**
     * URGENT: 调试用例 - 生产环境不要调用
     * 读取本地配置
     */
    readConfig () {
      Object.values(this.ruleForm).forEach((item) => {
        storage.get(item.key, (err, data) => {
          if (err) throw err
          console.log('========↓=======')
          console.log(item.key)
          console.log(data)
          console.log('========↑=======')
        })
      })
    },
    /**
     * 重置配置
     */
    resetConfig () {
      const entries = Object.entries(this.ruleForm)
      entries.forEach(([key, value]) => {
        this.ruleForm[key].value = value.default
        storage.remove(value.key, (err) => {
          if (err) throw err
        })
      })
      this.$message.info('已恢复默认配置')
      this.readConfig()
    },
    /**
     * 保存配置
     */
    saveConfig () {
      const values = Object.values(this.ruleForm)
      values.forEach((item) => {
        storage.set(item.key, item, (err) => {
          if (err) throw err
        })
      })
      this.setOpenAtLogin()
      this.setDisplayQueuePanel()

      this.$message.success('已保存配置')
      this.readConfig()
    },
    /**
     * 获取本地缓存中的其他普通设置 (除端口与缓存文件夹以外的配置)
     */
    getCommonConfig () {
      const excludeKeys = ['printerExpressPort', 'printerSocketPort', 'cacheCatalog', 'defaultPrinter']
      const entries = Object.entries(this.ruleForm)
      const commonConfigs = entries.filter(([key]) => !excludeKeys.includes(key))

      commonConfigs.forEach(([formKey, formValue]) => {
        const { default: defaultValue, key } = formValue
        storage.get(key, (err, data) => {
          if (err) throw err
          if (isEmptyObject(data)) {
            this.ruleForm[formKey]['value'] = defaultValue
          }
          this.ruleForm[formKey]['value'] = isEmptyObject(data) ? defaultValue : data.value
          // console.log('本地storage: ', 'key: ', key, data)
        })
      })
      console.log(commonConfigs)
    },
    /**
     * 读取用户端口配置
     */
    getLocalSettingsPort () {
      storage.get(configuration.httpPort, (err, data) => {
        if (err) throw err
        this.ruleForm.printerExpressPort.value = isEmptyObject(data) ? httpPort : data.value
      })

      storage.get(configuration.socketPort, (err, data) => {
        if (err) throw err
        this.ruleForm.printerSocketPort.value = isEmptyObject(data) ? socketPort : data.value
      })
    },
    /**
     * 获取缓存目录
     */
    async getCacheDir () {
      const cacheDir = this.getCacheDirFromStorage()
      // 有配置
      if (cacheDir) {
        this.ruleForm.cacheCatalog.value = cacheDir
        this.ruleForm.cacheCatalog.default = await this.getInstallPath() + `\\` + cacheDirName
      } else {
        // 默认配置
        this.ruleForm.cacheCatalog.value = this.ruleForm.cacheCatalog.default = await this.getInstallPath() + `\\` + cacheDirName
      }
    },
    /**
     * 获取软件安装路径
     * @returns {String}
     */
    async getInstallPath () {
      const res = await ipcRenderer.invoke(getExeInstallPath)
      return Promise.resolve(res)
    },
    /**
     * 从本地读取缓存路径
     * @returns {Boolean|String} false为本地缓存不存在该路径 String为缓存路径
     */
    getCacheDirFromStorage () {
      const cacheDir = storage.getSync(configuration.cacheDir)
      if (isPlainObject(cacheDir) && isEmpty(cacheDir)) {
        return false
      } else {
        return cacheDir.value
      }
    },
    /**
     * 更换缓存安装目录
     */
    async changeCacheDir () {
      const { canceled, filePaths } = await ipcRenderer.invoke(choiceFilePath)
      if (!canceled) {
        this.ruleForm.cacheCatalog.value = filePaths[0] + `\\` + cacheDirName
      }
    }

  }

}
</script>
<style lang="scss" scoped>
em {
  font-style: normal;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
#configuration {
  width: 100%;
  height: 100%;
}
::v-deep .ant-form-item {
  margin-bottom: 10px;
}

::v-deep .ant-form-item-label > label {
  font-weight: 600;
}

.cache-catalog {
  margin: 0;
  padding: 0;
  margin-bottom: 5px;
  word-wrap: break-word;
  line-height: normal;
}
</style>