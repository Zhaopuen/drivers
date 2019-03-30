// map_nav.js
var app = getApp();
var coors;
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
var driverlat = wx.getStorageSync("driverlat")
var driverlng = wx.getStorageSync("driverlng")
var shoplat = wx.getStorageSync("driverlat")
var shoplng = wx.getStorageSync("driverlng")
Page({
  data: {
    latitude: '',
    longitude: '',
    address:'',
    enableZoom:'true',
    enableScroll: 'true',
    approve_on_off: false,//新订单显示
    isShow: false,
    driverNames: '',
    tasklistdata: [],
    hosueNumber: '',
    address: '',
    shopNames: '',
    polyline: [],
    markers: [{
      latitude: driverlat,
      longitude: driverlng,
      iconPath: '../../images/add-s.png'
    }, {
        latitude: shoplat,
        longitude: shoplng,
      iconPath: '../../images/add-s.png'
    }],
    carnumber: '',
    ordertime: '',
    driverOrders:''
  },
  
  // 点击头像出现信息
  avatarClick: function(){
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
  todayTest: function(){
    wx.redirectTo({
      url: '../scan/scan',
    })
  },
  todayOrder: function(){
    wx.redirectTo({
      url: '../complete_order/complete_order',
    })
  },
  // 返回到列表页
  backList: function(){
    wx.navigateTo({
      url: '../task_list/task_list',
    })
  },
 
  //新订单显示
  approveClick: function () {
    var approve_on_off = this.data.approve_on_off;
    if (approve_on_off == true) {
      this.setData({
        approve_on_off: false
      })
    } else {
      this.setData({
        approve_on_off: true
      })
    }
  },
  // 调用腾讯导航
  launchAppError: function() {
    var data = this.data;
    var latitude = this.data.latitude;
    var longitude = this.data.longitude;
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
    })
  },
  listOrder: function () {
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
                address: item.address
              })
            }
          })
        }
        console.log(arr, 'arrs')
        that.setData({
          tasklistdata: arr[0]
        })
        console.log(that.data.tasklistdata, '下单列表')
      }
    })
  },

  // 完成订单
  finishOrder: function () {
    var that = this;
    console.log(that.data.tasklistdata,'orderIdS')
    wx.request({
      url: 'https://www.nx.tt/addon/collection/api/driver?act=' + 'finish_order',
      data: {
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        mpid: wx.getExtConfigSync().mpid,
        openid: wx.getStorageSync("openid"),
        shop_openid: wx.getStorageSync("shopOpenid"),
        order_id: wx.getStorageSync("orderIds"),
        client_id: wx.getStorageSync("clientIds")
      },
      method: 'POST',
      success: function (res) {
        console.log(res, '完成订单的res')
        if(res.data.code == 1){
          wx.showToast({
            title: '订单已完成',
            icon: 'none'
          })
          wx.navigateTo({
            url: '../task_list/task_list',
          })
        } else if(res.data.code == 0){
          wx.showToast({
            title: '未完成订单',
            icon: 'none'
          })
        }
      }
    })
  },

  // 接单
  order: function (event) {
    var that = this;
    var openid = (wx.getStorageSync('openid'));
    wx.request({
      url: 'https://www.nx.tt/addon/collection/api/driver?act=' + 'receive_order',
      data: {
        uaid: wx.getExtConfigSync().uaid,
        udid: wx.getExtConfigSync().udid,
        mpid: wx.getExtConfigSync().mpid,
        lat: that.data.tasklistdata.lat,
        lng: that.data.tasklistdata.lng,
        shop_openid: that.data.tasklistdata.shopopenid,
        shop_id: that.data.tasklistdata.shopId,
        order_id: (that.data.tasklistdata.id).toString(),
        openid: wx.getStorageSync("openid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.code == 1) {
          that.setData({
            approve_on_off: false
          })
          wx.showToast({
            title: '订单已被接单',
            icon: 'none'
          })
        } else if (res.data.code == 0) {
          wx.showToast({
            title: '接单失败，请重新接单',
            icon: 'none'
          })
        }
        console.log(res, '接单1111')
      }
    })

  },
  onLoad: function() {

    let that2 = this;
    wx.request({
      url: 'https://apis.map.qq.com/ws/direction/v1/driving/?from=' + driverlat + ',' + driverlng + '&to=' + shoplat + ',' + shoplng + '&output=json&callback=cb&key=' + app.globalData.tencent_map_key,
      success: function (res) {
        coors = res.data.result.routes[0].polyline
        for (var i = 2; i < coors.length; i++) {
          coors[i] = coors[i - 2] + coors[i] / 1000000
        }
        //划线
        var b = [];
        for (var i = 0; i < coors.length; i = i + 2) {
          b[i / 2] = {
            latitude: coors[i], longitude: coors[i + 1]
          };
        }
        that2.setData({
          polyline: [{
            points: b,
            color: "#00BA1F",
            width: 10,
            dottedLine: false
          }],
        })
      }
    })
    var drivername = (wx.getStorageSync('userinfo').name).substring(0, 1);
    var driverOrder = wx.getStorageSync('userinfo').month_order
    this.setData({
      navH: app.globalData.navHeight,
      driverNames: drivername,
      shopNames: wx.getStorageSync("shopname"),
      address: wx.getStorageSync("address"),
      hosueNumber:wx.getStorageSync("house_number"),
      carnumber: wx.getStorageSync("license"),
      ordertime: wx.getStorageSync("orderTime"),
      driverOrders: driverOrder
    })
    var openid = (wx.getStorageSync('openid'));
    let that = this;

    var socketOpen = false
    //建立连接
    var data = {
    }
    var socketMsgQueue = JSON.stringify(data)
    wx.connectSocket({
      url: "wss://www.nx.tt/wss",
    })
    wx.onSocketOpen(function (res) {
      console.log('WebSocket连接已打开！')
      socketOpen = true
      // console.log('数据发送中' + socketMsgQueue)
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
      console.log(resJson, 'resJsonbbbb')
      if (resJson.type == "new_order") {
        that.listOrder()
        that.setData({
          approve_on_off: true
        })
      }
      if (resJson.type == "cancel_order"){
        that.setData({
          approve_on_off: false
        })
      }
      console.log('收到服务器内容1111：' + JSON.stringify(res))
      // that.listOrder()
    })
    // that.listOrder()
   
    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: 'C5RBZ-L3XHJ-RNXFA-FKTXT-ZPW3E-MCFTJ' // 必填
    });
    var latitude = this.data.latitude;
    var longitude = this.data.longitude;
    //1、获取当前位置坐标
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        console.log(res.latitude + "," + res.longitude);
        //2、根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
        var locationString = res.latitude + "," + res.longitude;
        wx.request({
          url: 'https://apis.map.qq.com/ws/geocoder/v1/',
          data: {
            "key": "C5RBZ-L3XHJ-RNXFA-FKTXT-ZPW3E-MCFTJ",
            "location": locationString
          },
          method: 'GET',
          success: function (r) {
            that.setData({
              latitude: res.latitude,
              longitude: res.longitude,
              address: r.data.result.address
            })
          }
        });
      }
    })
  },

  onReady: function() {
    wx.setNavigationBarTitle({
      title: '地图导航',
    })
  }
})