// pages/task_list/task_list.js
const app = getApp();
const globalData = app.globalData;
var openid = (wx.getStorageSync('openid'));

Page({
  data: {
    tasklistdata: [],
    sum_bucket:'',
    reconnectFlag: false,
    timer: {},
    limit:0,
    driver_name: '',
    driverNames: '',
    shopId: '',
    lat:'',
    lng:'',
    shopopenid: '',
    shoporderId:'',
    shopnumber: '',
    carnumber: '',
    shopname: '',
    shopaddress: '',
    driverOrders: '',
    shopListon: []
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

  // 今日记录
  todayOrder: function () {
    wx.redirectTo({
      url: '../complete_order/complete_order',
    })
  },

  // 订单列表
  listOrder: function(){
    var that = this;
    wx.request({
      url: 'https://www.nx.tt/addon/collection/api/driver?act=' + 'find_order',
      data: {
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        mpid: wx.getExtConfigSync().mpid,
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            tasklistdata: res.data.data.data,
          })
          var arr = [];
          that.data.tasklistdata.forEach((item, index) => {
            var lat1 = wx.getStorageSync("driverlat");
            var lng1 = wx.getStorageSync("driverlng");
            var lat2 = item.lat;
            var lng2 = item.lng;
            var La1 = lat1 * Math.PI / 180.0;
            var La2 = lat2 * Math.PI / 180.0;
            var La3 = La1 - La2;
            var Lb3 = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
            s = s * 6378.137;//地球半径;
            s = Math.round(s * 10000) / 10000;
            var arrobj = [];
            if(lat1 == lat2 && lng1 == lng2){
              arrobj.push({
                tasflag: false,
                id: item.id,
                house_number: item.house_number,
                lat: item.lat,
                lng: item.lng,
                number: item.number,
                openid: item.openid,
                shop_id: item.shop_id,
                shop_name: item.shop_name,
                address: item.address,
                distance: s
              })
              that.setData({
                shopListon: arrobj[0]
              })
            }
            console.log(s, '利用经纬度来计算两个地方的距离')
            if (item) {
              arr.push({
                tasflag: false,
                id: item.id,
                house_number: item.house_number,
                lat: item.lat,
                lng: item.lng,
                number: item.number,
                openid: item.openid,
                shop_id: item.shop_id,
                shop_name: item.shop_name,
                address: item.address,
                distance: s
              })
            }
          })
        }
        that.setData({
          tasklistdata: arr
        })
        console.log(that.data.tasklistdata, '下单列表')
        
        // 列表的排序
        var sortBy = function (filed, rev, primer) {
          rev = (rev) ? -1 : 1;
          return function (a, b) {
            a = a[filed];
            b = b[filed];
            if (typeof (primer) != 'undefined') {
              a = primer(a);
              b = primer(b);
            }
            if (a < b) { return rev * -1; }
            if (a > b) { return rev * 1; }
            return 1;
          }
        };
        that.setData({
          tasklistdata: that.data.tasklistdata.sort(sortBy('distance', true, parseInt))
        })
      }
    })
  },

  // 跳到列表详情
  tasklistClick: function (event) {
    wx.navigateTo({
      url: '../map_nav/map_nav',
    })
    var that = this;
    var openid = (wx.getStorageSync('openid'));
    var tasklistdata = that.data.tasklistdata;
    for (var i = 0; i < tasklistdata.length; i++) {
      if (event.currentTarget.id == i) {
        wx.setStorageSync("shopname", tasklistdata[i].shop_name)
        wx.setStorageSync("address", tasklistdata[i].address)
        wx.setStorageSync("house_number", tasklistdata[i].house_number)
        wx.setStorageSync("lat", tasklistdata[i].lat)
        wx.setStorageSync("lng", tasklistdata[i].lng)
        wx.setStorageSync("orderIds", tasklistdata[i].id)
        wx.setStorageSync("shopOpenid", tasklistdata[i].openid)
      } 
    }
  },

  onLoad: function(options) {
    var that = this;
    var openid = (wx.getStorageSync('openid'));
    var drivername = (wx.getStorageSync('userinfo').name).substring(0, 1);
    var driverOrder = wx.getStorageSync('userinfo').month_order
    this.setData({
      navH: app.globalData.navHeight,
      driverNames: drivername,
      carnumber: wx.getStorageSync("license"),
      driverOrders: driverOrder
    })

    // 连接websocket
    var socketOpen = false
    // var data = {
    // }
    // var socketMsgQueue = JSON.stringify(data)
    // wx.connectSocket({
    //   url: "wss://www.nx.tt/wss",
    // })
    // wx.onSocketOpen(function (res) {
    //   console.log('WebSocket连接已打开！')
    //   socketOpen = true
    //   // console.log('数据发送中' + socketMsgQueue)
    //   sendSocketMessage(socketMsgQueue)
    // })
    // function sendSocketMessage(msg) {
    //   if (socketOpen) {
    //     wx.sendSocketMessage({
    //       data: msg
    //     })
    //   } else {
    //     socketMsgQueue.push(msg)
    //   }
    // }
    // wx.onSocketError(function (res) {
    //   console.log('WebSocket连接打开失败，请检查！')
    // })
    wx.onSocketMessage(function (res) {
      var resJson = JSON.parse(res.data);
      console.log(resJson,'resJsonbbbb')
      if (resJson.type == "new_order") {
        that.listOrder()
      }
      if (resJson.type == "cancel_order"){
        that.listOrder()
      }
      console.log('收到服务器内容1111：' + JSON.stringify(res))
      // that.listOrder()
    })
    that.listOrder()

    
  },

  navperson: function(){
    wx.navigateTo({
      url: '../driver_page/driver_page',
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    })
  },

  orderMap: function(){
    wx.navigateTo({
      url: '../map_nav/map_nav',
    })
  },

  // 接单
  suspend: function (event){
    var that = this;
    var date = new Date();
    var hour = date.getHours();
    var minute = date.getMinutes();
    console.log(  hour +':' + minute,'当前年月日时分秒')
    if (minute.length == 1){
      var datetimes = hour + ':' + '0' + minute;
    }
    var datetimes = hour + ':' + minute;
    wx.setStorageSync("orderTime", datetimes)
    var openid = (wx.getStorageSync('openid'));
    var tasklistdata = that.data.tasklistdata;
    for (var i = 0; i < tasklistdata.length; i++) {
      if (event.currentTarget.id == i) {
        console.log(tasklistdata[i],'dhiahd')
        tasklistdata[i].tasflag = true;
        that.setData({
          shopId: tasklistdata[i].shop_id,
          lat: tasklistdata[i].lat,
          lng: tasklistdata[i].lng,
          shopopenid: tasklistdata[i].openid,
          shoporderId: tasklistdata[i].id,
          shopnumber: tasklistdata[i].number,
          shopname: tasklistdata[i].shop_name,
          shopaddress: tasklistdata[i].address,
        })
        console.log(that.data.shopname, that.data.house_number,'house_number')
      } else {
        // tasklistdata[i].tasflag = false
      }
    }
    this.setData({
      tasklistdata: tasklistdata
    })
    wx.request({
      url: 'https://www.nx.tt/addon/collection/api/driver?act=' + 'receive_order',
      data: {
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        mpid: wx.getExtConfigSync().mpid,
        lat:that.data.lat,
        lng: that.data.lng,
        shop_openid: that.data.shopopenid,
        shop_id: that.data.shopId,
        order_id: (that.data.shoporderId).toString(),
        openid: wx.getStorageSync("openid")
      },
      method: 'POST',
      success: function (res) {
        console.log(typeof (that.data.shoporderId).toString(),'数字类型')
        if (res.data.code == 1) {
          wx.showToast({
            title: '订单已被接单',
            icon:'none'
          })
        } else if(res.data.code == 0){
          wx.showToast({
            title: '接单失败，请重新接单',
            icon: 'none'
          })
        }
        console.log(res, '接单1111')
      }
    })
  },

  // 完成订单
  finishOrder: function () {
    var that = this;
    wx.request({
      url: 'https://www.nx.tt/addon/collection/api/driver?act=' + 'finish_order',
      data: {
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        mpid: wx.getExtConfigSync().mpid,
        openid: wx.getStorageSync("openid"),
        shop_openid: that.data.shopopenid,
        order_id: that.data.shoporderId,
        client_id: wx.getStorageSync("client_id")
      },
      method: 'POST',
      success: function (res) {
        console.log(res, '完成订单的res')
        if (res.data.code == 1) {
          wx.showToast({
            title: '订单已完成',
            icon: 'none'
          })
          that.listOrder()
        } else if (res.data.code == 0) {
          wx.showToast({
            title: '未完成订单',
            icon: 'none'
          })
        }
      }
    })
  },

  // 打电话
  phoneClick: function () {
    wx.makePhoneCall({
      phoneNumber: '12356' // 仅为示例，并非真实的电话号码
    })
  },
})