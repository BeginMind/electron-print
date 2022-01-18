<!--
 * @Description: 
 * @Date: 2022-01-10 15:51:01
 * @LastEditTime: 2022-01-18 21:14:20
-->
<template>
  <div id="printer-main">
    <div class="menu-item"
         @click="launchPrintServer">
      <img class="menu-icon"
           :src="serverIcon"
           alt="">
      <em class="menu-name">
        {{ !isOpenServer ? '开启' : '关闭' }}打印服务
      </em>
    </div>
    <div class="menu-item"
         @click="loadSettings">
      <img class="menu-icon"
           :src="settingsIcon"
           alt="">
      <em class="menu-name">
        设置
      </em>
    </div>
  </div>
</template>
<script>
/**
 * NOTE: pdf-to-printer
 * 参考:  https://github.com/artiebits/pdf-to-printer
 */

// const path = require('path')
// const download = require('download')

// const { print } = require('pdf-to-printer')
const { ipcRenderer } = require('electron')
const { getLocalSettingsPort, getLocalSettingsCache, getDefaultPrinter } = require('@/utils/common')

export default {
  name: 'printer',

  data () {
    return {
      size: 'small',
      printers: [], // 打印机列表
      // currentPrinterName: '', // 当前打印机名字
      isOpenServer: false,
      settingsIcon: 'static/img/settings.png',
      serverIcon: 'static/img/printer.png'
      // downloading: false // 是否下载中
    }
  },

  beforeMount () {
    this.launchPrintServer()
  },

  mounted () {
    // this.getPrinterList()

    // this.getGlobalServerParam()

  },

  methods: {
    loadSettings () {
      this.$router.push('/configuration')
    },

    /**
     * 运行打印服务
     */
    async launchPrintServer () {
      let res
      const argv = await this.getGlobalServerParam()
      if (!this.isOpenServer) {
        res = await ipcRenderer.invoke('launch-print-server', argv)
      } else {
        res = await ipcRenderer.invoke('shutDown-print-server')
      }
      if (res.status === 1) this.isOpenServer = !this.isOpenServer
      console.log(res)
    },

    /**
     * 获取服务设置参数
     * @returns {Object}
     */
    async getGlobalServerParam () {
      const { httpPort, socketPort } = getLocalSettingsPort()
      // { default: defaultPath, local }
      const { local } = await getLocalSettingsCache()
      const { printer } = await getDefaultPrinter()
      // debugger
      const options = {
        httpPort,
        socketPort,
        cacheDir: local,
        deviceName: printer
      }
      // console.log(options)
      return options
    }
  }
}
</script>
<style lang="scss" scoped>
#printer-main {
  width: 100%;
  height: 100%;
  text-align: center;

  display: flex;
  justify-content: center;
  align-items: center;

  > div {
    width: 130px;
    height: 130px;
    // background-color: skyblue;
    border: 1px solid rgb(245, 245, 245);
    border-radius: 10px;
    // margin-right: 30px;
    margin: 0 20px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:hover {
      background-color: rgb(241, 241, 241);
      cursor: pointer;
    }

    .menu-icon {
      height: 60%;
    }
  }
}

em {
  font-style: normal;
}
</style>