const http = require('http')
const fs = require('fs')
http.createServer(function (req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'set-cookie': 'a=2'
  })
  fs.readFile('index.html', {
    encoding: 'utf-8'
  }, function (err, html) {
    console.log(html)
    res.end(html)
  })
}).listen(3001)