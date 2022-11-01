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
      $('.grid-container')[0].insertAdjacentHTML('afterbegin', `  <div>
        <img class='grid-item grid-item-${e.number}' src='/imgs/${e.number}.png' alt='${e.caption}'>
        <p>${e.caption}</p>
      </div>`)
    })
  })
})

//`<div class="gallery-entry">
//  <img src="/imgs/${e}" class="gallery-img">
//  <span class="gallery-caption">${data.captions[e]}</span><br><br><br></div>`