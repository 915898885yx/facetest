const http = require('http')
const fs = require('fs')
http.request({
  host: 'www.baidu.com',
  url: '/',
  method: 'GET',
  headers: {
  }
}, function (res) {
  let ret = ''
  res.on('data', function (data) {
    ret += data
  })
  res.on('end', function () {
    console.log(ret)
    fs.appendFile('index.html', ret, function (err) {
      if (err) return console.log('gg')
      console.log('追加成功')
  })
}).end()
