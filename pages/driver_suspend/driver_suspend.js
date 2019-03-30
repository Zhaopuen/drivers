//driver_suspend.js
const app = getApp();
const globalData = app.globalData;
Page({
  data: {
    isShow: false,
    driverNames: ''
  },
  onReady: function() {
    wx.setNavigationBarTitle({
      title: '李师傅（45）',
    })
  },
  onLoad: function () {
    var drivername = wx.getStorageSync("driverName").substring(0, 1);
    this.setData({
      navH: app.globalData.navHeight,
      driverNames: drivername
    })
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

  // 清空车辆
  clearCar: function(){
    wx.navigateTo({
      url: '../task_list/task_list',
    })
  }

})