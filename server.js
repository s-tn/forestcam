const fs = require('fs');
const qs = require('querystring');
const express = require('express');

module.exports = function(server, nebula) {
  const io = nebula.plugins['socket.io'];

  nebula.server.use('/imgs', express.static('imgs'));
  
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

    socket.on('changeCaption', (caption, img) => {
      var data = JSON.parse(fs.readFileSync('gallery.json', () => {}));
      data[data.findIndex(e=>e.number==img)].caption = caption;
      fs.writeFileSync('gallery.json', JSON.stringify(data), () => {});
    })

    socket.on('changeImage', (img, num) => {
      fs.writeFileSync('./imgs/'+num+'.png', img, 'base64', () => {})
    })

    socket.on('deleteImage', (caption, img) => {
      var data = JSON.parse(fs.readFileSync('gallery.json', () => {}));
      data.splice(data.findIndex(e=>e.number==img), 1);
      fs.writeFileSync('gallery.json', JSON.stringify(data), () => {});
    })
  });
  
  server.on('request', (req, res) => {
    if (res.headersSent) return;
    if (res.writableEnded) return;
    
    if (req.url=='/gallerydata') {
      return res.end(fs.readFileSync('./gallery.json'))
    }
    if (req.url=='/progressdata') {
      return res.end(fs.readFileSync('./progress.json'))
    }
    if (req.url=='/musicdata') {
      return res.end(fs.readFileSync('./music.json'))
    }
    if (req.url.startsWith('/admin')) {
      if (qs.parse(req.url.split('?')[1]).password=='j2405') {
        return res.writeHead(200, {'content-type': 'text/html'}).end(fs.readFileSync('./public/admin.data.html'));
      }
    }
  })
}

function createImg(data, num, caption) {
  fs.writeFileSync('./imgs/'+num+'.png', data, 'base64', () => {})
  var imgs = JSON.parse(fs.readFileSync('gallery.json', () => {}))
  imgs.push({
    number: num,
    caption: caption,
  });
  fs.writeFileSync('gallery.json', JSON.stringify(imgs), () => {})
  console.log('https://forestcam--enderkingj.repl.co/imgs/'+num+".png")
}

function createProgressBar(name, value) {
  var data = JSON.parse(fs.readFileSync('progress.json', () => {}))
  var num = data.projects.length + 1
  data.progress[num] = {progress:value,name:name}
  data.projects.push(num)
  console.log(data)
  fs.writeFileSync('progress.json', JSON.stringify(data), () => {})
}