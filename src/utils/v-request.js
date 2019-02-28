/**
 * v-request::client code
 * 无限制的小程序HTTP请求云函数
 * 你可以使用此功能，在小程序上请求访问如下类型的HTTP数据：
 * 1. 未进行备案的
 * 2. 未上HTTPS证书的
 * 3. 没绑定域名，直接IP地址访问的
 * 注： 不可访问内网IP或腾讯云服务器无法连接的地址
 * ==========================
 * 注意：请勿使用此功能于非法用途！！仅供开发者学习使用！！
 * 开源地址和文档：https://github.com/guren-cloud/v-request
 * 古人云小程序（小程序推送等黑科技研究）：https://mssnn.cn
 * 更新时间：2018/12/29
 */

/**
 * 使用方法
 * =======
 * 与官方的wx.request大致相同
 * 目前测试正常的get、post请求都OK，当然还可能会有其他小细节问题，不能应对全部的情况
 * 所以如果你在测试中无法得到自己想要的结果，可以参与这个项目一起反馈优化！
 * 项目地址：https://github.com/guren-cloud/v-request
 * 作者微信：hack_fish
 * -------
// EXAMPLE
// GET
wx.vrequest({
  url: 'https://mssnn.cn',
  success: res => {
    console.log('data=', res.data);
  }
})
// POST
wx.vrequest({
  url: 'https://wx5bbe79dd056cb238.mssnn.cn/v1/control/auth.php',
  method: 'POST',
  data: 'secret='+'a'.repeat(32),
  dataType: 'json',
  header: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  success: res => {
    console.log('data=', res.data);
  }
})
 */

function serializeParams (params) {
    if (!params) {
      return ''
    }
    return Object.keys(params)
      .map(key => (`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)).join('&')
  }

function generateRequestUrlWithParams (url, params) {
    params = typeof params === 'string' ? params : serializeParams(params)
    url += (~url.indexOf('?') ? '&' : '?') + params
    url = url.replace('?&', '?')
    return url
  }

wx.vrequest = function (options) {

    options = options || {}
    if (typeof options === 'string') {
        options = {
        url: options
        }
    }

    let url = options.url
    let data = options.data || {}
    const params = {}
    const res = {}

    let method = options.method || 'GET'
    method = method.toUpperCase()

    if (method === 'GET') {
        url = generateRequestUrlWithParams(url, data)
      } else {
        if (typeof data === 'object') {
          const contentType = options.header && (options.header['content-type'] || options.header['Content-Type'])
          if (contentType === 'application/json') {
            data = JSON.stringify(data)
          } else if (contentType === 'application/x-www-form-urlencoded') {
            data = serializeParams(data)
          }
        }
      }
    
    if (method !== 'GET' && method !== 'HEAD') {
        params.body = data
    }

    // 转发options。 options 属性仍可读取，被使用
    params.headers = options.header
    params.mode = options.mode
    params.credentials = options.credentials
    params.cache = options.cache
    params.method = method
    params.url = url

    // 开始请求
    return new Promise((RES, REJ) => {
      wx.cloud.callFunction({
        name: 'v-request',
        data: {
          options: params
        },
        success: res => {
            
            const { result }  = res;
            console.log((result))
            // 如果datatype='json'，则解析后
        
    
            options.success && options.success(result);
            RES(result); 
        },
        fail: err => {
          // 错误回调
          options.fail && options.fail({
            errMsg: 'request:fail',
            err
          });
          REJ(err);
        },
        complete: options.complete
      })
    })
  }
