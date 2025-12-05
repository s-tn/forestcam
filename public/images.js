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
    var index = Months.indexOf(month)

    // If month not found, return default to prevent NaN
    if (index === -1) {
      console.warn('Month not found:', month)
      return '00'
    }

    // Convert to 1-based month (01-12) instead of 0-based index
    var monthNum = index + 1
    if (monthNum.toString().length==1) monthNum = '0'+monthNum
    return monthNum.toString()
  }

  function SortYears(array) {
    return array.sort(function(a,b) {return b.date - a.date})
  }
  
  function GetDate(str) {
    var parts = str.trim().split(' ')
    var year = parseInt(parts[parts.length - 1]);
    var monthName = parts[0]

    // Validate year
    if (isNaN(year) || year < 1900 || year > 2100) {
      console.warn('Invalid year:', year, 'in string:', str)
      year = 1900 // Default to old date so it sorts to bottom
    }

    var month = GetMonth(monthName)

    var dateNum = parseInt(year.toString() + month)

    // Final validation
    if (isNaN(dateNum)) {
      console.warn('Failed to parse date from:', str)
      return 190000 // Very old date to sort to bottom
    }

    return dateNum
  }

  var dateMap = data.map(e=>{
    var captionParts = e.caption.split('-')
    if (captionParts.length < 2) {
      console.warn('Invalid caption format (no hyphen):', e.caption)
      return {date: 190000, ...e} // Default to old date
    }

    var dateStr = captionParts[1].trim()
    var date = GetDate(dateStr);

    console.log('Parsed:', e.caption, '→ date:', date, '(', dateStr, ')')

    return {date: date, ...e}
  })

  data = SortYears(dateMap)
  console.log('Sorted gallery items (newest first):', data.map(e => `${e.caption} (${e.date})`))

  // Return sorted array directly - let CSS Grid handle the columns
  return data
}

$.getJSON('/gallerydata', (data) => {
  data = FilterImages(data)

  // Create 3 columns for masonry layout
  const gridContainer = $('.grid-container')[0]
  gridContainer.innerHTML = `
    <div class="gallery-column" data-column="0"></div>
    <div class="gallery-column" data-column="1"></div>
    <div class="gallery-column" data-column="2"></div>
  `

  const columns = gridContainer.querySelectorAll('.gallery-column')

  // Distribute items across columns in round-robin fashion (left-to-right)
  data.forEach((e, index) => {
    const columnIndex = index % 3
    columns[columnIndex].insertAdjacentHTML('beforeend', `<div>
      <img class='grid-item grid-item-${e.number}' src='/imgs/${e.number}.png' alt='${e.caption}'>
      <p>${e.caption}</p>
    </div>`)
  })
})

//`<div class="gallery-entry">
//  <img src="/imgs/${e}" class="gallery-img">
//  <span class="gallery-caption">${data.captions[e]}</span><br><br><br></div>`