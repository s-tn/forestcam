console.log('hi')

$.getJSON('/musicdata', (data) => {
  console.log(data)

  // Split videos into compositions and performances
  const compositions = [];
  const performances = [];

  data.videos.forEach((e, i) => {
    // Check if copyright contains "CC BY 4.0" to identify compositions
    if (e.copyright.includes('CC BY 4.0')) {
      compositions.push(e);
    } else {
      performances.push(e);
    }
  });

  // Populate compositions section
  compositions.forEach((e, i) => {
    $('#compositions-videos')[0].insertAdjacentHTML('beforeend', `<div class="music-video-over">
        <div class="music-video-right">
          <iframe src="https://www.youtube.com/embed/${e.video}" allowfullscreen></iframe>
        </div>
        <div class="music-video-left">
          <div>
            <span class="music-video-name">
              ${e.title}
            </span>
            <span class="music-video-date">${e.copyright}</span>
          </div>
        </div>
      </div>`);
  });

  // Populate performances section
  performances.forEach((e, i) => {
    $('#performances-videos')[0].insertAdjacentHTML('beforeend', `<div class="music-video-over">
        <div class="music-video-right">
          <iframe src="https://www.youtube.com/embed/${e.video}" allowfullscreen></iframe>
        </div>
        <div class="music-video-left">
          <div>
            <span class="music-video-name">
              ${e.title}
            </span>
            <span class="music-video-date">${e.copyright}</span>
          </div>
        </div>
      </div>`);
  });
});