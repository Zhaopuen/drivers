App({
  globalData: {
    uaid: 2,
    udid: 0,
    mpid: 1,
    host: 'https://www.nx.tt',
    api_url: 'https://www.nx.tt/addon/collection/api',
    socket_url: 'wss://www.nx.tt/wss',
    phone: wx.getStorageSync('phone'),
    openid: wx.getStorageSync('openid'),
    userinfo: wx.getStorageSync('userinfo'),
    tencent_map_key: "YB2BZ-3EQWI-DEVGA-5IUQN-KOATS-XRBNX",
    navHeight: 0
  },
  config() {
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    if (extConfig.uaid) {
      this.globalData.uaid = extConfig.uaid
      this.globalData.udid = extConfig.udid
      this.globalData.mpid = extConfig.mpid
      this.globalData.serverurl = extConfig.api_url
      this.globalData.socket_url = extConfig.socket_url
    }
    return this.globalData
  },
  onLaunch(options) {
    let cfg = this.config()
    let socketOpen = false
    //注册信息
    let data = {
    }
    let socketMsgQueue = JSON.stringify(data)
    //建立连接
    wx.connectSocket({
      url: cfg.socket_url,
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
      socketOpen = true
      console.log('数据发送中' + socketMsgQueue)
      sendSocketMessage(socketMsgQueue)
    })
    function sendSocketMessage(msg) {
      if (socketOpen) {
        wx.sendSocketMessage({
          data: msg
        })
      } else {
        socketMsgQueue.push(msg)
      }
    }
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败，请检查！')
    })
    wx.onSocketMessage(function (res) {
      var resJson = JSON.parse(res.data);
      if (resJson.type == "init") {
        wx.setStorageSync("client_id", resJson.client_id)
      }
      console.log('收到服务器内容：' + JSON.stringify(res))
    })

    wx.getSystemInfo({
      success: res => {
        //导航高度
        cfg.navHeight = res.statusBarHeight + 46;
      }, fail(err) {
        console.log(err);
      }
    })
    
    //没有用户信息时获取
    if (!cfg.userinfo) this.userinfo(cfg.openid, cfg.phone)
    
    //没有openid时登录
    if (!cfg.openid) {
      wx.login({
        success(res) {
          if (res.code) {
            let url = cfg.host + "/wechat/api/session";
            wx.request({
              url: url,
              data: {
                mpid: cfg.mpid,
                code: res.code,
                uaid: cfg.uaid
              },
              method: 'POST',
              header: {
                'content-type': 'application/x-www-form-urlencoded' // 默认值
              },
              success(res) {
                if (res.data.code == 1) {
                  console.log(res.data.data)
                  wx.setStorageSync('openid', res.data.data.openid)
                  cfg.openid = res.data.data.openid
                  wx.setStorageSync('session_key', res.data.data.session_key)
                } else {
                  console.log(res.data.errmsg)
                }
              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    }    
  },
  userinfo(openid, phone, callback) {
    if (!openid || !phone) return;
    let cfg = this.config()
    wx.request({
      url: cfg.api_url + '/driver',
      data: {
        uaid: cfg.uaid,
        udid: cfg.udid,
        mpid: cfg.mpid,
        phone: cfg.phone,
        openid: cfg.openid,
        client_id: wx.getStorageSync("client_id")
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if (res.data.code==1) {
          wx.setStorageSync('userinfo', res.data.data)
          cfg.userinfo = res.data.data
          callback(res.data.data)
        }
        if (res.data.code==0) {
          wx.navigateTo({
            url: '/pages/loginfail/loginfail',
          })
        }
      }
    })
  },
})