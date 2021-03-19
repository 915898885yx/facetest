const fs = require('fs')
const { resolve } = require('path')
const _stream = fs.createReadStream(resolve(__dirname, 'index1.js'))
let num = 0
_stream.on('data', function (data) {
  console.log(String(data))
  ++num
})
_stream.on('end', function () {
  console.log('end:', num)
})