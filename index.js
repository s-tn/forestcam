const express = require('express');
var fs = require('fs');
var qs = require('querystring');

io.on('connection', (socket) => {
  socket.join(socket.id)

  socket.on('upload', (data, num, caption) => {
    console.log(num, caption)
    createImg(data, num, caption)
  })

  socket.on('removeBar', num => {
    var data = JSON.parse(fs.readFileSync('progress.json', () => {}))
    delete data.progress[num]
    delete data.projects.splice(data.projects.indexOf(num), 1)
    console.log(data)
    fs.writeFileSync('progress.json', JSON.stringify(data), () => {})
  })

  socket.on('changeName', (value, num) => {
    var data = JSON.parse(fs.readFileSync('progress.json', () => {}))
    data.progress[num].name = value
    fs.writeFileSync('progress.json', JSON.stringify(data), () => {})
  })

  socket.on('createPBar', (name, value) => {
    createProgressBar(name, value)
  })

  socket.on('changeProgress', (value, num) => {
    var data = JSON.parse(fs.readFileSync('progress.json', () => {}))
    data.progress[num].progress = value
    fs.writeFileSync('progress.json', JSON.stringify(data), () => {})
  })
});

app.use(express.static('public'));

app.use((req, res) => {
  if (res.headersSent) return;
  if (res.writableEnded) return;
  
  if (req.url=='/gallerydata') {
    return res.end(fs.readFileSync('./gallery.json'))
  }
  if (req.url=='/progressdata') {
    return res.end(fs.readFileSync('./progress.json'))
  }
});