const fs = require('fs').promises;
const fsSync = require('fs');
const qs = require('querystring');
const express = require('express');

module.exports = function(server, nebula) {
  const io = nebula.plugins['socket.io'];

  nebula.server.use('/imgs', express.static('imgs'));

  io.on('connection', (socket) => {
    socket.join(socket.id)

    socket.on('upload', async (data, num, caption) => {
      console.log(num, caption)
      await createImg(data, num, caption)
    })

    socket.on('removeBar', async (num) => {
      try {
        const data = JSON.parse(await fs.readFile('progress.json', 'utf-8'))
        delete data.progress[num]
        data.projects.splice(data.projects.indexOf(num), 1)
        console.log(data)
        await fs.writeFile('progress.json', JSON.stringify(data))
      } catch (error) {
        console.error('Error removing progress bar:', error)
      }
    })

    socket.on('changeName', async (value, num) => {
      try {
        const data = JSON.parse(await fs.readFile('progress.json', 'utf-8'))
        data.progress[num].name = value
        await fs.writeFile('progress.json', JSON.stringify(data))
      } catch (error) {
        console.error('Error changing name:', error)
      }
    })

    socket.on('createPBar', async (name, value) => {
      await createProgressBar(name, value)
    })

    socket.on('changeProgress', async (value, num) => {
      try {
        const data = JSON.parse(await fs.readFile('progress.json', 'utf-8'))
        data.progress[num].progress = value
        await fs.writeFile('progress.json', JSON.stringify(data))
      } catch (error) {
        console.error('Error changing progress:', error)
      }
    })

    socket.on('changeCaption', async (caption, img) => {
      try {
        const data = JSON.parse(await fs.readFile('gallery.json', 'utf-8'))
        data[data.findIndex(e=>e.number==img)].caption = caption
        await fs.writeFile('gallery.json', JSON.stringify(data))
      } catch (error) {
        console.error('Error changing caption:', error)
      }
    })

    socket.on('changeImage', async (img, num) => {
      try {
        await fs.writeFile('./imgs/'+num+'.png', img, 'base64')
      } catch (error) {
        console.error('Error changing image:', error)
      }
    })

    socket.on('deleteImage', async (caption, img) => {
      try {
        const data = JSON.parse(await fs.readFile('gallery.json', 'utf-8'))
        data.splice(data.findIndex(e=>e.number==img), 1)
        await fs.writeFile('gallery.json', JSON.stringify(data))
      } catch (error) {
        console.error('Error deleting image:', error)
      }
    })

    // New socket events for music management
    socket.on('updateMusicData', async (videos) => {
      try {
        const data = JSON.parse(await fs.readFile('music.json', 'utf-8'))
        data.videos = videos
        await fs.writeFile('music.json', JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Error updating music data:', error)
      }
    })

    socket.on('addMusic', async (video) => {
      try {
        const data = JSON.parse(await fs.readFile('music.json', 'utf-8'))
        data.videos.push(video)
        await fs.writeFile('music.json', JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Error adding music:', error)
      }
    })

    socket.on('deleteMusic', async (index) => {
      try {
        const data = JSON.parse(await fs.readFile('music.json', 'utf-8'))
        data.videos.splice(index, 1)
        await fs.writeFile('music.json', JSON.stringify(data, null, 2))
      } catch (error) {
        console.error('Error deleting music:', error)
      }
    })

    // New socket event for gallery reordering
    socket.on('reorderGallery', async (galleryData) => {
      try {
        await fs.writeFile('gallery.json', JSON.stringify(galleryData))
      } catch (error) {
        console.error('Error reordering gallery:', error)
      }
    })
  });
  
  server.on('request', async (req, res) => {
    if (res.headersSent) return;
    if (res.writableEnded) return;

    try {
      if (req.url=='/gallerydata') {
        const data = await fs.readFile('./gallery.json', 'utf-8')
        return res.end(data)
      }
      if (req.url=='/progressdata') {
        const data = await fs.readFile('./progress.json', 'utf-8')
        return res.end(data)
      }
      if (req.url=='/musicdata') {
        const data = await fs.readFile('./music.json', 'utf-8')
        return res.end(data)
      }
      if (req.url.startsWith('/admin')) {
        if (qs.parse(req.url.split('?')[1]).password=='3eDVMA!RqoREHBGtM@vA') {
          const adminHtml = await fs.readFile('./public/admin.data.html', 'utf-8')
          return res.writeHead(200, {'content-type': 'text/html'}).end(adminHtml);
        }
      }
    } catch (error) {
      console.error('Error handling request:', error)
      res.writeHead(500).end('Internal Server Error')
    }
  })
}

async function createImg(data, num, caption) {
  try {
    await fs.writeFile('./imgs/'+num+'.png', data, 'base64')
    const imgs = JSON.parse(await fs.readFile('gallery.json', 'utf-8'))
    imgs.push({
      number: num,
      caption: caption,
    });
    await fs.writeFile('gallery.json', JSON.stringify(imgs))
    console.log('https://forestcam--enderkingj.repl.co/imgs/'+num+".png")
  } catch (error) {
    console.error('Error creating image:', error)
  }
}

async function createProgressBar(name, value) {
  try {
    const data = JSON.parse(await fs.readFile('progress.json', 'utf-8'))
    const num = data.projects.length + 1
    data.progress[num] = {progress:value,name:name}
    data.projects.push(num)
    console.log(data)
    await fs.writeFile('progress.json', JSON.stringify(data))
  } catch (error) {
    console.error('Error creating progress bar:', error)
  }
}