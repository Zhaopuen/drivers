// pages/complete_order/complete_order.js
const app = getApp().globalData;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_data:[],
    isShow: false,
    driverNames:'',
    carnumber: '',
    historyOrder: [],
    driverOrders: ''
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
  // 今日休息
  todayTest: function () {
    wx.redirectTo({
      url: '../scan/scan',
    })
  },
  todayOrder: function () {
    wx.redirectTo({
      url: '../complete_order/complete_order',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var drivername = (wx.getStorageSync('userinfo').name).substring(0, 1);
    var driverOrder = wx.getStorageSync('userinfo').month_order
    this.setData({
      navH: app.navHeight,
      driverNames: drivername,
      carnumber: wx.getStorageSync("license"),
      driverOrders: driverOrder
    })
    var that =this;
    console.log(options);
    var openid = (wx.getStorageSync('openid'))
    wx.request({
      url: "https://www.nx.tt/addon/collection/api/driver?act=" + 'history_order', // 仅为示例，并非真实的接口地址
      data: {
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        mpid: wx.getExtConfigSync().mpid,
        openid: openid
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        console.log(res,'今日记录的res')
        if(res.data.code == 1){
          that.setData({
            historyOrder: res.data.data.data
          })
        }
      }
    })
  },
  // 点击头像出现信息
  avatarClick: function () {
    this.setData({
      isShow: true
    })
  },
  // 今日休息
  todayTest: function () {
    wx.redirectTo({
      url: '../scan/scan',
    })
  },
  todayOrder: function () {
    wx.redirectTo({
      url: '../complete_order/complete_order',
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    wx.setNavigationBarTitle({
      title: '订单列表',
    })
  },

  // 返回接单
  returnOrder: function(){
    wx.redirectTo({
      url: '../task_list/task_list',
    })
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

  }
})