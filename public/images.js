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

function getColumnCount() {
  const width = window.innerWidth
  if (width <= 768) return 1    // Mobile: 1 column
  if (width <= 1024) return 2   // Tablet: 2 columns
  return 3                       // Desktop: 3 columns
}

function distributeGallery(data) {
  const gridContainer = $('.grid-container')[0]
  if (!gridContainer) {
    console.error('Grid container not found')
    return
  }

  const numColumns = getColumnCount()
  console.log(`Gallery: ${data.length} items, ${numColumns} column(s), width: ${window.innerWidth}px`)

  // Create only the number of columns we need for current screen size
  let columnsHTML = ''
  for (let i = 0; i < numColumns; i++) {
    columnsHTML += `<div class="gallery-column" data-column="${i}"></div>`
  }
  gridContainer.innerHTML = columnsHTML

  const columns = gridContainer.querySelectorAll('.gallery-column')

  // Distribute ALL items across active columns in round-robin fashion (left-to-right)
  data.forEach((e, index) => {
    const columnIndex = index % numColumns
    columns[columnIndex].insertAdjacentHTML('beforeend', `<div>
      <img class='grid-item grid-item-${e.number}' src='/imgs/${e.number}.png' alt='${e.caption}'>
      <p>${e.caption}</p>
    </div>`)
  })

  console.log(`Gallery distribution complete: Column 0 has ${columns[0].children.length} items${numColumns > 1 ? `, Column 1 has ${columns[1].children.length} items` : ''}${numColumns > 2 ? `, Column 2 has ${columns[2].children.length} items` : ''}`)
}

let galleryData = null

$.getJSON('/gallerydata', (data) => {
  galleryData = FilterImages(data)
  distributeGallery(galleryData)
})

// Re-distribute on window resize
let resizeTimeout
let lastColumnCount = getColumnCount()

window.addEventListener('resize', function() {
  if (!galleryData) return

  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const newColumnCount = getColumnCount()
    // Only redistribute if column count actually changed
    if (newColumnCount !== lastColumnCount) {
      console.log(`Column count changed: ${lastColumnCount} → ${newColumnCount}`)
      lastColumnCount = newColumnCount
      distributeGallery(galleryData)
    }
  }, 250)
})