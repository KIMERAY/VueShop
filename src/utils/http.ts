// 添加拦截器：
// 拦截 request 请求
// 拦截 uploadFile 文件上传
// TODO:
// 1．非 http 开头需拼接地址
// 2．请求超时
// 3．添加小程序端请求头标识
// 4．添加 token 请求头标识
import { useMemberStore } from '@/stores'
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 1．非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2．请求超时
    options.timeout = 10000
    // 3．添加小程序端请求头标识
    options.header = {
      ...options.header,
      'source-client': 'miniapp',
    }
    // 4．添加 token 请求头标识
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
    console.log(options)
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('uploadFile', httpInterceptor)

/**
请求函数
* @param UniApp.RequestOptions
@returns Promise
* 1． 返回 Promise 对象
* 2．请求成功
*   2.1 提取核心数据 res.data
*   2.2添加类型，支持泛型
* 3．请求失败
*   3.1 网络错误 -> 提示用户换网络
*   3.2 401错误 -> 清理用户信息，跳转到登录页
*   3.3 其他错误 -> 根据后端错误信息轻提示
*/
interface Data<T> {
  code: string
  msg: string
  result: T
}
//  2.2添加类型，支持泛型
export const http = <T>(options: UniApp.RequestOptions) => {
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 2.请求成功
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          // 401错误 -> 清理用户信息，跳转到登录页
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误信息轻提示
          uni.showToast({
            title: (res.data as Data<T>).msg || '数据获取失败',
            icon: 'none',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          title: '网络错误，换个网络试试',
          icon: 'none',
        })
        reject(err)
      },
    })
  })
}
