console.log('hi')

$.getJSON('/musicdata', (data) => {
  console.log(data)
  data.videos.forEach((e, i) => {
    $('#music-left-videos')[0].insertAdjacentHTML('afterbegin', `           <div class="music-video-over">
        <div class="music-video-left">
          <div>
            <span class="music-video-name">
              ${e.title}
            </span>
            <span class="music-video-title">
              ${e.name}
            </span>
            <span class="music-video-date">${e.date}</span>
          </div>
        </div>
        <div class="music-video-right">
          <iframe src="https://www.youtube.com/embed/${e.video}" allowfullscreen></iframe>
        </div>
      </div>`);
  });

  data.timeline.reverse().forEach(event => {
    $('#music-right-schedule')[0].insertAdjacentHTML('afterbegin', `
      <div class="timeline-entry">
        - <div class="timeline-date">${event.date}</div> - <div class="timeline-name">${event.name}</div>
      </div>
    `);
  })
});