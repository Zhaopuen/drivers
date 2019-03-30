// pages/binding/binding.js
const app = getApp();
const globalData = app.globalData;
var CusBase64 = require('../../utils/basemins.min.js').Base64;
var Base64 = require('../../utils/base.js').Base64;

Page({
  data: {
    plate:'loading',
    driver_name:'loading',
    car_id:0,
    isShow: false,
    path: "",
    diverNames: '',
    license: '',
    driverOpenid: '',
    driverOrders: ''
  },

  avatarClick: function () {
    this.setData({
      isShow: true
    })
  },
  outbtn: function(){
    this.setData({
      isShow: false
    })
  },

  onLoad: function (options) {
    var drivername = (wx.getStorageSync('userinfo').name).substring(0, 1);
    var driverOrder = wx.getStorageSync('userinfo').day_order
    var that = this;
    const scene = decodeURIComponent(options.scene);
    var openid = (wx.getStorageSync('openid'));
    that.setData({
      navH: app.globalData.navHeight,
      diverNames: drivername,
      license: CusBase64.decode(scene),
      driverOrders: driverOrder
    })
    wx.setStorageSync("license", that.data.license)
  
    wx.request({
      url: "https://www.nx.tt/addon/collection/api/driver", 
      data: {
        openid: openid,
        mpid: wx.getExtConfigSync().mpid,
        phone: wx.getStorageSync("phone"),
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        if (res.data.code == 1) {
          that.setData({
            driverName: res.data.data.name,
            driverOrder: res.data.data.day_order,
            driverOpenid: res.data.data.openid
          })
        } 
        else if (res.data.code == 0) {
          wx.navigateTo({
            url: '../index/index',
          })
        }
      }
    })
  },
 
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 司机绑定车辆
  bind_car: function () {
    var that = this;
    var openid = wx.getStorageSync("openid")
    var clientIds = wx.getStorageSync("client_id")
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        wx.setStorageSync("driverlat", res.latitude)
        wx.setStorageSync("driverlng", res.longitude)
        wx.request({
          url: 'https://www.nx.tt/addon/collection/api/car?act=' + 'bind',
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: {
            openid: that.data.driverOpenid,
            license: that.data.license,
            uaid: wx.getExtConfigSync().uaid,
            udid: wx.getExtConfigSync().udid,
            lat: latitude,
            lng: longitude,
            mpid: wx.getExtConfigSync().mpid,
            client_id: clientIds
          },
          success: function (res) {
            console.log(res, '绑定司机的res22222')
            if (res.data.code == 1) {
              wx.navigateTo({
                url: '../task_list/task_list',
              })
            } else {
              wx.showToast({
                title: "绑定失败",
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  close_bind: function () {
    app.userinfo()
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

  },

  
})