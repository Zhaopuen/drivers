// pages/task_list/task_list.js
const app = getApp();
const globalData = app.globalData;
var openid = (wx.getStorageSync('openid'));
var area_id = (wx.getStorageSync('area_id'));

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShow: false,
    driverName: '',
    driverOrder: ""
  },
  // 点击头像出现信息
  avatarClick: function () {
    this.setData({
      isShow: true
    })
  },
  outbtn: function () {
    this.setData({
      isShow: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options, query) {
    var openid = (wx.getStorageSync('openid'));
    this.setData({
      navH: app.globalData.navHeight
    })
    var clientIds = wx.getStorageSync("clientIds")
    //建立连接
    var that = this;
    wx.request({
      url: "https://www.nx.tt/addon/collection/api/driver", // 仅为示例，并非真实的接口地址
      data: {
        openid: openid,
        mpid: wx.getExtConfigSync().mpid,
        phone: wx.getStorageSync("phone"),
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        // client_id: clientIds,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if(res.data.code == 1){
          that.setData({
            driverName: (res.data.data.name).substring(0,1),
            driverOrder: res.data.data.day_order
          })
          wx.setStorageSync("driverName", res.data.data.name)
        } else if(res.data.code == 0){
          wx.navigateTo({
            url: '../login/login',
          })
        }
      }
    })
  },

  // 扫码
  scan: function (e) {
    wx.scanCode({
      success(res) {
        console.log(res,'successres')
        wx.navigateTo({
          url: '../../' + res.path
        })
      },
      fail(res){
        wx.showToast({
          title: '扫码失败，请重新扫码',
          icon: 'none'
        })
      }
    })
  },
})