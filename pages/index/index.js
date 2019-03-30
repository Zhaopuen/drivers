// pages/index.js
let app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone: app.config().phone,
    userinfo: app.config().userinfo,
    nav_height: app.config().navHeight
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (this.data.phone && !this.data.userinfo) {
      wx.navigateTo({
        url: '/pages/loginfail/loginfail',
      })
    }
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
    let _this = this
    if (e.detail.encryptedData) {
      wx.request({
        url: app.config().host + '/wechat/api/phone/mpid/' + app.config().mpid,
        data: {
          session: wx.getStorageSync("session_key"),
          iv: e.detail.iv,
          encryptedData: e.detail.encryptedData
        },
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        success(res) {
          if (res.data.phoneNumber) {
            wx.setStorageSync("phone", res.data.phoneNumber)
            _this.data.phone = res.data.phoneNumber
            app.userinfo(res.data.phoneNumber, app.config().openid, function (rs) {
              _this.data.userinfo = rs;
              _this.setData({ userinfo: rs })
              console.log(1, rs)
              console.log(2, _this.data.userinfo)
            })
          }
        }
      })
    }
  },

  // 扫码
  scan: function (e) {
    wx.scanCode({
      success(res) {
        console.log(res, 'successres')
        wx.navigateTo({
          url: '../../' + res.path
        })
      },
      fail(res) {
        wx.showToast({
          title: '扫码失败，请重新扫码',
          icon: 'none'
        })
      }
    })
  },

})