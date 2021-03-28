const fs = require('fs')
const path = require('path')
fs.readdir(process.cwd(), function (err, files) {
  if (err) process.exit(1)
  if (!files.length) {
    return console.log('空的')
  }
  console.log('select file:')
  function file(i) {
    var filename = files[i]
    fs.stat(__dirname + '/' + filename, function (err, stat) {
      // if (stat.isDirectory()) {
        console.log(`${i}.${filename}`)
      // }
      i++
      if (i == files.length) {
        console.log('')
        process.stdout.write('Enter your choice:')
        process.stdin.resume()
        process.stdin.setEncoding('utf-8')

        process.stdin.on('data', function (data) {
          if (Number(data) <= files.length) {
            process.stdin.pause()
            var path1 =  path.resolve(__dirname, files[Number(data)])
            console.log(path1, "path")
            fs.readFile(path1, 'utf-8', function (err, content) {
              if (err) return console.log(err)
              console.log(content)
            })
          }
        })
      } else {
        file(i)
      }
    })
  }
  file(0)
})