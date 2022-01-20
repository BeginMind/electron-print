# electron 静默打印

项目基于 [electron-vue](https://github.com/SimulatedGREG/electron-vue) 基础上开发, 使用的 electron 版本为 **11.2.1** 。
> 使用版本: node: 14.16.0 ,  npm: 6.14.11 , yarn: 1.22.10
>
> >  [electron-vue中文指引](https://simulatedgreg.gitbooks.io/electron-vue/content/cn/)



## 使用

``` bash
# 安装
yarn install 

# 运行
yarn dev

## win32 打包
yarn build:win32

## win64 打包
yarn build
```



## 解决问题
1. 前端可以直接调本地服务接口，将文件进行静默打印，不需要弹窗提示 ( 类似 window.print 的弹窗 )；
2. 打印进度提示与打印队列；



## 实现思路
1. 应用打开时默认启动  express 服务；
2. 前端调用应用启动的 express 服务接口，将文件路径作为参数传过去；
3. 应用接口收到内容后，包装一层数据，将其传进写好的打印队列调度器中进行打印任务处理；
4. 打印成功或失败会将内容从接口中返回到前端；




## 前端调用
> 详细请看 example/test-print.html
```javascript
// 应用默认启动 express 的端口为 45656

// 单个打印接口
const url = 'http://localhost:45656/print'
const fileUrl = 'http://xxxxxxxxx' // 文件地址
fetch(`${url}?fileUrl=${fileUrl}`, { method: 'POST' })

// 批量打印接口
const url = 'http://localhost:45656/multiple-print'
let fileUrls = ['http://aaaa', 'http://vvvv', 'http://dddd']
fileUrls = fileUrls.join(';') // 需要用 ';' 拼接起来
fetch(`${url}?fileUrl=${fileUrl}`, { method: 'POST' })

// 预览接口
const url = 'http://localhost:45656/preview'
const fileUrl = 'http://yyyyyyy'
fetch(`${url}?fileUrl=${fileUrl}`)
```



## 已实现功能
1. app 右下角托盘显示；
2. app 开机自启动；
3. 屏幕右下角打印进度条提示；
5. 单个打印、批量打印、打印预览；




## PDF打印过程
1. 将文件下载到本地缓存文件夹中( 使用 [download](https://github.com/kevva/download) );
2. 将下载好的本地文件打印 ( 使用 [pdf-to-printer](https://github.com/artiebits/pdf-to-printer) )；
3. 打印完成删除文件；



## 注意

1. 目前仅做了 PDF 打印支持，其他文件类型还没有做适配处理；
2. 尚未对预留的 socket 内容进行开发，目前仅支持 http 请求；



## 第三方包推荐
1. 日志调试 ( [electron-log](https://github.com/megahertz/electron-log) );
2. 自动升级 ( electron-updater );