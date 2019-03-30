function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function get_address()
{
   wx.getSetting({
      success(res)
      {
        if (res.authSetting['scope.userLocation']) {
          var that = this;
          var globalData = getApp().globalData;
          var QQMapWX = require('./qqmap-wx-jssdk.min.js');
          var qqmapsdk = new QQMapWX({
            key: globalData.tencent_map_key // 必填
          });
          qqmapsdk.reverseGeocoder({
            location: '',
            success: function (res) {
              var city = res.result.ad_info.city;
              var json = require('./area.js');
              var v = [];
              var Array = json.dataList;
              var lily = Array.filter((p) => {
                return p.name == city
              });
              for (var h = 0; h < lily.length; h++) {
                v[h] = lily[h]["id"]
              }
              wx.setStorageSync('area_id', v[0]);

            }
          })
        }
      }
   })



  
}



module.exports = {
  formatTime: formatTime,
  get_address: get_address

}
