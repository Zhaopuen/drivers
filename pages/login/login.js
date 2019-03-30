// pages/login/login.js
var app = getApp();
const globalData = app.globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
  getPhoneNumber(e) {
    console.log(e);


    var skey = (wx.getStorageSync("session_key"));
    var mpid = globalData.mpid;
    wx.request({
      url: globalData.host + '/wechat/api/phone/mpid/' + mpid,
      data: {
        session: skey,
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded' // 默认值
      },
      success(res) {
        wx.setStorageSync("phone", res.data.phoneNumber)
        wx.request({
          url: globalData.serverurl + '/driver',
          data: {
            phone: res.data.phoneNumber,
            uaid: wx.getExtConfigSync().uaid,
            openid: (wx.getStorageSync('openid')),
            mpid: wx.getExtConfigSync().mpid,
            client_id: wx.getStorageSync("clientIds"),
            udid: 0
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded' // 默认值
          },
          success(datass) {
            if (datass.data.code == 1) {
              wx.reLaunch({
                url: '../scan/scan',
              })
            } else {
              wx.navigateTo({
                url: '../loginfail/loginfail',
              })
            }
          }
        })
      }
    })
  }
})