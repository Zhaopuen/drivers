// pages/driver_page/driver_page.js
const app = getApp().globalData;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    day_order:'0',
    month_order:'0',
    plate:'loading',
    driver_name:'loading',
    driver_phone:'loading',
    avatarUrl:''
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    var that = this;
    var openid = (wx.getStorageSync('openid'));
    if(openid)
    {
      get_data(openid)
    }else{
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      wx.navigateTo({
        url: '',
      })
      setTimeout(function () {
        wx.hideLoading();
        openid = (wx.getStorageSync('openid'));
        get_data(openid)
      }, 1000)
    }
    
    
     function get_data(openid)
     {
       wx.request({
         url: app.serverurl + "/driver_page.html", // 仅为示例，并非真实的接口地址
         data: {
           openid: openid,
           mpid: app.mpid,
           uaid: app.uaid,
           ucid:app.ucid
         },
         method: 'POST',
         header: {
           'content-type': 'application/x-www-form-urlencoded'
         },
         success(res) {
           if (res.data.code == '200') {
             that.setData({
               day_order: res.data.data.day_order,
               month_order: res.data.data.month_order,
               plate: res.data.data.plate,
               driver_name: res.data.data.driver_name,
               driver_phone: res.data.data.driver_phone
             })
           } else {
             wx.showModal({
               title: '提示',
               content: res.data.msg,
               showCancel: false
             })
           }
         }
       })
     } 
      
    
    
  },

  scan:function(e){
    wx.scanCode({
      success(res) {
        console.log(res)
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
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

  }
})