/*
 * @Description:
 * @Date: 2021-09-13 14:17:28
 * @LastEditTime: 2022-01-18 21:19:06
 */
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      meta: {},
      redirect: '/printer'
      // component: require('@/views/home').default
    },
    {
      path: '/printer', // 打印机主页
      name: 'printer',
      meta: {
        // name: '打印机主页'
      },
      component: require('@/views/printer').default
    },
    {
      path: '/configuration', // 配置页
      name: 'configuration',
      meta: {
        name: '设置'
      },
      component: require('@/views/configuration').default
    }
    // {
    //   path: '*',
    //   redirect: '/'
    // }
  ]
})
