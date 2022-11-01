const socket = io()
var currentImage = null;

socket.on('connect', (socket) => {
  console.log('Connected!')
})
let toChange;

function getBase64(file, num) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     socket.emit('upload', reader.result.replace(/^data:image\/[a-z]+;base64,/, ""), num, $('#caption').val());
   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };
}

function changeImageBase(file, num) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     socket.emit('changeImage', reader.result.replace(/^data:image\/[a-z]+;base64,/, ""), num);
     setTimeout(function() {reloadData(currentImage);}, 1000);
   };
   reader.onerror = function (error) {
     console.log('Error: ', error);
   };
}

$('#initiate').click(() => {
  var file = $('#input')[0].files[0];
  var num = Math.round(Math.random() * 99999999) + 10000000;
  getBase64(file, num)
  $('#open-url').text('https://'+location.host+'/imgs/'+num+'.png');$('#open-url').attr('href', 'https://'+location.host+'/imgs/'+num+'.png')
  alert('Uploaded Successfully')
})

function emitImage(num, data, caption) {
  socket.emit('upload', data, num, caption);
}

function reloadProgress() {
$.getJSON('/progressdata', (data) => {
  $('#progress-change').html('')
  data.projects.map((e) => {
    if ($('container-pbar-'+e)[0]) {return}
    if (!data.progress[e]) {return}
    var integer = Math.floor(data.progress[e].progress) === data.progress[e].progress;
    console.log(integer, e, data.progress[e].progress)
    $('#progress-change')[0].insertAdjacentHTML('beforeend', `
    <div id="container-pbar-${e}"><h3 id="title-pbar-${e}" class="after-text title">${data.progress[e].name}</h3><div class="w3-light-grey w3-round-xlarge pcont pbar-${e}">
    <div class="w3-container w3-round-xlarge pbar" style="width:${data.progress[e].progress}%;"><div class="w3-round-xlarge pbar2" id="progress-bar${e}"></div></div>
  </div>
  <span id="after-text-${e}" class="after-text progress ${integer}">${data.progress[e].progress}%</span> <a href="javascript:" id="thing-${e}" class="edit-button">Edit</a>  <a href="javascript:" id="del-${e}" class="delete-button" id="delete-bar-${e}" onclick="$('#edit-bar-container').hide();if(confirm('Confirm Deletion, ${data.progress[e].name}')){socket.emit('removeBar', ${e});$('#container-pbar-${e}')[0].remove()}">Delete</a><br><br><br></div>`)
  })
document.querySelectorAll('.edit-button').forEach(node => {
  node.addEventListener('click', () => {
    console.log(node.id.split('-')[1])
    $('#edit-bar-container').show()
    $('#change-name').show()
    $('#create-pbar').hide()
    toChange = node.id.split('-')[1]
  })
})
})
}

reloadProgress()

$('#create-progress').click(() => {
  $('#edit-bar-container').hide()
  $('#create-pbar').show()
})

$('#option-select').change(() => {
  var option = $('#option-select').val()
  console.log(option)
  document.querySelector('input[value="Change"]').style.display = "block"
  if (option==='name') {
    $('.percent-change').hide()
    $('.percent-change').removeAttr('required')
    $('.name-change').show()
    $('.name-change').attr('required', true)
  } else if (option==='num') {
    $('.name-change').hide()
    $('.name-change').removeAttr('required')
    $('.percent-change').show()
    $('.percent-change').attr('required', true)
  }
})

$('#change-name').submit((e) => {
  e.preventDefault();
  var type = $('#option-select').val()
  if (type=="name") {
    var val = $('#name-change').val()
    socket.emit('changeName', val, toChange)
    $('#title-pbar-'+toChange).text(val)
    alert('Updated Successfully')
  } else if (type=="num") {
    var value = $('.percent-change')[1].value
    console.log(value, toChange)
    socket.emit('changeProgress', value, toChange)
    $('#after-text-'+toChange).text(value+'%')
    alert('Updated Successfully')
  }
})

$('#create-pbar').submit((e) => {
  e.preventDefault();
  var name = $(".name-input").val()
  var value = $(".percent-input")[0].value
  socket.emit('createPBar', name, value)
  alert('Created Successfully')
  reloadProgress()
})

function FilterImages(data) {
  var Months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]

  function GetMonth(month) {
    month = Months.indexOf(month)

    if (month.toString().length==1) month = '0'+month
    return month.toString()
  }

  function SortYears(array) {
    return array.sort(function(a,b) {return a.date>b.date})
  }
  
  function GetDate(str) {
    var year = parseInt(str.split(' ').pop());

    var month = GetMonth(str.split(' ')[0])

    return parseInt(year+month)
  }

  var orders = [[], [], []]

  var currentDoing = 0;

  function SplitParts(order) {
    order.map(e=>{
      if (currentDoing==3) currentDoing = 0
      orders[currentDoing].push(e)
      currentDoing++
    })

    return orders;
  }
  
  var dateMap = data.map(e=>{
    console.log(e.caption)
    var a = e.caption.split('-')[1].replace(/^\s*/gi, '')
    var date = GetDate(a);

    return {date: date, ...e}
  })

  data = SortYears(dateMap)
  return SplitParts(data).reverse()
}

$.getJSON('/gallerydata', (data) => {
  data = FilterImages(data)
  data.map((e, i) => {
    e.forEach(e=>{
      $('.grid-container')[0].insertAdjacentHTML('afterbegin', `  <div class="image-jquery-item" data-number="${e.number}">
      <div class="image-delete-btn" onclick="deleteImage('${e.number}')">x</div>
        <img class='grid-item grid-item-${e.number}' src='/imgs/${e.number}.png' alt='${e.caption}'>
        <p>${e.caption}</p>
      </div>`)
    })
  })
})

function deleteImage(num) {
  if (!confirm('Confirm Image Delete')) return;
  
  socket.emit('deleteImage', num);

  function delImg() {
    var el = [...document.querySelectorAll('img')].find(e=>e.src.includes(num));
  
    var container = el.parent;
    container.remove();
  }

  setTimeout(delImg, 1000);
}

$('.grid-container')[0].addEventListener('click', function(e) {
  if (!e.path) return;

  var el = e.path.find(e=>e.classList.contains('image-jquery-item'));

  if (!el) return;

  var number = el.dataset.number;

  currentImage = number;

  if (e.path[0].tagName=='P') {
    $('#edit-caption-container').show()
    $('#caption-change').show()
    $('#change-image').hide()
  }

  if (e.path[0].tagName=='IMG') {
    $('#edit-image-container').show()
    $('#change-image').show()
    $('#caption-change').hide()
  }
})

$('#change-image').submit(function(e) {
  e.preventDefault();

  var image = $('#new-image-upload')[0].files[0];

  changeImageBase(image, currentImage);
});

$('#caption-change').submit(function(e) {
  e.preventDefault();

  var caption = $('#caption-input-new').val();

  socket.emit('changeCaption', caption, currentImage);

  var el = [...document.querySelectorAll('img')].find(e=>e.src.includes(currentImage));

  var container = el.parentNode;

  container.querySelector('p').innerText = caption;
});

function reloadData(num) {
  var el = [...document.querySelectorAll('img')].find(e=>e.src.includes(num));

  var container = el.parent;
  el.src = el.src.split('?')[0]+'?'+new Date().getTime();
}