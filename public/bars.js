$('#after-text-1').text('25%')

$.getJSON('/progressdata', (data) => {
  $('#bars').html('')
  data.projects.map((e) => {
    var integer = Math.floor(data.progress[e].progress) === data.progress[e].progress;
    console.log(integer, e, data.progress[e].progress)
    $('#bars')[0].insertAdjacentHTML('beforeend', `
    <h1 class="after-text title">${data.progress[e].name}</h1><br><div class="w3-light-grey w3-round-xlarge pcont pbar-${e}">
    <div class="w3-container w3-round-xlarge pbar" style="width:${data.progress[e].progress}%;"><div class="w3-round-xlarge pbar2" id="progress-bar${e}"></div></div>
  </div>
  <span id="after-text-${e}" class="after-text progress ${integer}">${data.progress[e].progress}%</span><br><br><br>`)
  })
})

var time = setInterval(() => {
  document.querySelectorAll('.progress').forEach(node => {
    var integer = node.className.split(/\s+/)[node.className.split(/\s+/).length-1];
    var numFixed;
    if (integer==="true") {
      numFixed = 0
    } else {
      numFixed = 1
    }
    var nodeNumber = node.id.split('-')[2]
    node.innerText = (($('#progress-bar'+nodeNumber).width() / $('.pbar-'+nodeNumber).width())*100).toFixed(numFixed)+"%"
  })
}, 10)

setTimeout(() => {clearInterval(time)
  document.querySelectorAll('.progress').forEach(node => {
$.getJSON('/progressdata', (data) => {
  var nodeNumber = node.id.split('-')[2]
  node.innerText = data.progress[nodeNumber].progress + "%"
})
  })
}, 2000)