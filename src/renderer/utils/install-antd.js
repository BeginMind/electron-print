/*
 * @Description: 安装 antd 组件
 * @Date: 2022-01-06 10:58:36
 * @LastEditTime: 2022-01-14 10:36:00
 */
import Vue from 'vue'
import { Button, Select, FormModel, Input, Message, Divider, Checkbox, InputNumber } from 'ant-design-vue'

Vue.prototype.$message = Message

Vue
  .use(Button)
  .use(Select)
  .use(FormModel)
  .use(Input)
  .use(Divider)
  .use(Checkbox)
  .use(InputNumber)
