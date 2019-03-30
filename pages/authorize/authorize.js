
const app = getApp()
var server = app.globalData.myUrl//这是自己的服务端接口地址设置于app.js
// var WxParse = require('../../wxParse/wxParse.js');
var tellPage = 1
var myurl = 'wss://www.nx.tt/wss'
var ws     // socket发送的消息队列
var socketMsgQueue = []
var socketOpen = true            // 判断心跳变量
var heart = ''                   // 心跳失败次数
var heartBeatFailCount = 0       // 终止心跳
var heartBeatTimeOut = null;     // 终止重新连接
var connectSocketTimeOut = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sayValue: '',
    tellData: [],//聊天消息
    idx: '',
    id: '',
    fjh: '',//房间号
    myinputing: '',
    isSend: 'ask',
  },
  /**
    * 生命周期函数--监听页面加载
    */
  onLoad: function (options) {
    this.setData({
      id: options.id,
      fjh: options.roomNum,
    })
    this.history(1)
    this.connectStart()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //监听websocket连接状态
    this.deal()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log()
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    var that = this
    //离开页面销毁websocket并恢复初始数据
    wx.closeSocket()
    // twice = 0
    socketOpen = true
    heart = ''                   // 心跳失败次数
    heartBeatFailCount = 0       // 终止心跳
    heartBeatTimeOut = null;     // 终止重新连接
    connectSocketTimeOut = null;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    console.log('点击分享')
  },
  //获取聊天室历史记录
  history: function (a) {
    var that = this
    wx.request({
      url: server + 'api/message/chatmsg',
      header: {
        "Authorization": app.globalData.token,
      },
      data: {
        page: a,
        type: '',
        resultsPerPage: 1000,
        stream: that.data.id
      },
      success: (res) => {
        var h = res.data.data.items
        if (h.length > 0) {
          var myArr = []
          var c = 0
          h.forEach(i => {
            c++
            i.id = c
            if (i.type == 'question' || i.type == 'answer') {
              i.content = JSON.parse(i.content)
            }
            myArr.push(i)
          })
          var j = h.length - 1
          var idx = h[j].id
          // console.log(h, idx)
          that.setData({
            tellData: h,
            idx: idx,
          })
        }

      }
    })
  },
  //与socket建立连接
  connectStart: function () {
    var that = this
    ws = wx.connectSocket({
      url: myurl,
      header: {
        "Authorization": app.globalData.token,
        'content-type': 'application/json'
      },
      data: JSON.stringify({
        token: app.globalData.token,
        type: 3,
        payLoad: {
          topic: that.data.fjh
        }
      }),
      success: (res) => {
        // console.log("进入聊天", res)
      },
      fail: (err) => {
        wx.showToast({
          title: '网络异常！',
        })
        console.log(err)
      },
    })

    //  连接成功
    wx.onSocketOpen((res) => {
      console.log('WebSocket 成功连接', res)
      that.resMes()
      //  开始心跳
      that.startHeartBeat()
    })
    //连接失败
    wx.onSocketError((err) => {
      console.log('websocket连接失败', err);
      // twice = 0
      that.connectStart()
    })
  },
  // 开始心跳
  startHeartBeat: function () {
    // console.log('socket开始心跳')
    var that = this;
    heart = 'heart';
    that.heartBeat();
  },
  // 心跳检测
  heartBeat: function () {
    var that = this;
    if (!heart) {
      return;
    }
    var xtData = {
      token: app.globalData.token,
      type: 1,
      payLoad: ""
    }
    // console.log(JSON.stringify({ xtData }))
    that.sendSocketMessage({
      msg: JSON.stringify(xtData),
      data: JSON.stringify(xtData),
      success: function (res) {
        // console.log('socket心跳成功',res);
        if (heart) {
          heartBeatTimeOut = setTimeout(() => {
            that.heartBeat();
          }, 5000);
        }
      },
      fail: function (res) {
        console.log('socket心跳失败');
        if (heartBeatFailCount > 2) {
          // 重连
          console.log('socket心跳失败')
          that.connectStart();
        }
        if (heart) {
          heartBeatTimeOut = setTimeout(() => {
            that.heartBeat();
          }, 5000);
        }
        heartBeatFailCount++;
      },
    });
  },
  // 进入聊天
  resMes: function () {
    var that = this
    var joinData = {
      token: app.globalData.token,
      type: 3,
      payLoad: JSON.stringify({
        topic: that.data.fjh
      }),
    }
    // console.log(joinData)
    that.sendSocketMessage({
      msg: JSON.stringify(joinData),
      data: JSON.stringify(joinData),
      success: function (res) {
        // console.log('进入房间成功', res);
        that.deal()
      },
      fail: function (err) {
        console.log('进入房间失败');
      },
    })
  },
  // 结束心跳
  stopHeartBeat: function () {
    // console.log('socket结束心跳')
    var that = this;
    heart = '';
    if (heartBeatTimeOut) {
      clearTimeout(heartBeatTimeOut);
      heartBeatTimeOut = null;
    }
    if (connectSocketTimeOut) {
      clearTimeout(connectSocketTimeOut);
      connectSocketTimeOut = null;
    }
  },
  // 消息发送
  foo: function () {
    if (this.data.inputValue) {
      //Do Something
    } else {
      //Catch Error
    }
    this.setData({
      inputValue: ''//将data的inputValue清空
    });
    return;
  },
  sayValue: function (e) {
    var that = this
    // console.log(this.data.isSend)
    if (that.data.isSend == 'ask') {
      that.setData({
        isSend: 'send'
      })
    }
    that.setData({
      sayValue: e.detail.value
    })
  },
  sendMes: function (e) {
    var that = this
    // console.log(this.data.sayValue, 111)
    var myInput = this.data.sayValue
    var token = app.globalData.token
    if (that.data.isSend == 'sureAsk') {
      wx.request({
        url: server + 'api/question/add',
        method: 'POST',
        header: {
          "Authorization": app.globalData.token,
          'content-type': 'application/json'
        },
        data: {
          content: myInput,
          streamId:2
        },
        success: (res) => {
          console.log(res, '我的提问')
        }
      })
    } else {
      // console.log(app.globalData.userInfo)
      var chatInfo = {
        user: app.globalData.userInfo.id,
        displayName: app.globalData.userInfo.displayName,
        avatarurl: app.globalData.userInfo.avatarUrl,
        stream: 2,
        content: myInput,
        type: "message",
        createdat: "2018-10-8 14:30"
      }
      var sendData = {
        token: token,
        type: 2,
        payLoad: JSON.stringify({
          topic: that.data.fjh,
          chatInfo: JSON.stringify(chatInfo)
        })
      }
      // console.log(JSON.stringify(sendData))
      that.sendSocketMessage({
        msg: JSON.stringify(sendData)
      })
    }
    that.setData({
      sayValue: '',
      isSend: 'ask'
    })



  },
  // 通过 WebSocket 连接发送数据
  sendSocketMessage: function (options) {
    var that = this
    if (socketOpen) {
      wx.sendSocketMessage({
        data: options.msg,
        success: function (res) {
          if (options) {
            options.success && options.success(res);
          }
        },
        fail: function (res) {
          if (options) {
            options.fail && options.fail(res);
          }
        }
      })
    } else {
      socketMsgQueue.push(options.msg)
    }
    // ws.closeSocket();
    // that.deal()
  },
  //  监听socket
  deal: function () {
    var that = this
    ws.onOpen(res => {
      socketOpen = true;
      console.log('监听 WebSocket 连接打开事件。', res)
    })
    ws.onClose(onClose => {
      console.log('监听 WebSocket 连接关闭事件。', onClose)
      // socketOpen = false;
      // that.connectStart()
    })
    ws.onError(onError => {
      console.log('监听 WebSocket 错误。错误信息', onError)
      socketOpen = false
    })
    ws.onMessage(onMessage => {
      var res = JSON.parse(onMessage.data)
      // console.log(res,"接收到了消息")
      if (res.code == 200) {
        // console.log('服务器返回的消息', res.data)
        var resData = JSON.parse(res.data)
        var arr = that.data.tellData
        resData.id = arr.length + 1
        if (resData.type == 'question' || resData.type == 'answer') {
          resData.content = JSON.parse(resData.content)

          console.log('这是提问', resData.type, resData.content.content)
        }
        arr.push(resData)
        console.log(resData, arr.length)
        that.setData({
          tellData: arr,
          idx: resData.id
        })
      } else {
      }
    })

  },
  time: function (a) {
    var data = new Date(a)
    var year = data.getFullYear();
    var month = data.getMonth() + 1;
    var day1 = data.getDate();
    var hh = data.getHours(); //截取小时
    var mm = data.getMinutes(); //截取分钟
    if (month < 10) {
      month = '0' + month
    }
    if (day1 < 10) {
      day1 = '0' + day1
    }
    if (hh < 10) {
      hh = '0' + hh
    }
    if (mm < 10) {
      mm = '0' + mm
    }

    var newday = month + "月" + day1 + ' ' + hh + ':' + mm
    return newday
  },
  inputing: function () {
    console.log('获取焦点')
    this.setData({
      isSend: 'send'
    })
  },
  inputed: function () {
    // console.log('失去焦点')
    this.setData({
      isSend: 'ask',

    })
  },
  ask: function () {
    // console.log('提问')
    this.setData({
      myinputing: true,
      isSend: 'sureAsk'
    })
  },

})