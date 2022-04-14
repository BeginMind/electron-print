/*
 * @Description:
 * @Date: 2021-09-13 14:17:28
 * @LastEditTime: 2022-04-14 15:39:43
 */
import Vue from 'vue'
import axios from 'axios'

// ..

import App from './App'
import router from './router'
import store from './store'

import './utils/install-antd'
import 'ant-design-vue/dist/antd.css'

import './assets/css/global.scss'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

// App 信息, 这里不想用进程通信了
const app = {
  rootName: '',
  isGetRootName: false
}
/**
 * 注册路由守卫, 改变 title
 */
router.beforeEach((to, from, next) => {
  const { meta } = to
  if (!app.isGetRootName) {
    app.rootName = document.title
    app.isGetRootName = true
  }
  document.title = meta && meta.name ? `${app.rootName} - ${meta.name}` : app.rootName
  next()
})

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
