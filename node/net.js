const net = require('net')
let users = {}, count = 0
const server = net.createServer(function (conn) {
  var nickname = '', msg = '';
  conn.setEncoding('utf-8')
  conn.write(
    `welcome to node-chat, ${count} people are connected, please write your name and press enter:`
  )
  conn.on('data', function (data) {
    if (data == '\r\n') {
      if (!nickname) {
        nickname = msg
        users[nickname] = conn
      } else {
        for (var user in users) {
          if (user != nickname) {
            users[user].write(nickname + ':' + msg + '\r\n')
          }
        }
      }
      msg = ''
    }
    msg += data
    console.log(data, 'data')
  })
  conn.on('close', function () {
    console.log('有人退出')
    count--
  })
  count++
})
server.listen(3000, function () {
  console.log('listen:3000...')
})
