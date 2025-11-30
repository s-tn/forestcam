// Admin.js - ForestCam Admin Interface
const socket = io();

// State
let galleryData = [];
let musicData = [];
let progressData = {};
let gallerySortable = null;
let musicSortable = null;

// Socket connection
socket.on('connect', () => {
  console.log('Connected to server');
  loadAllData();
});

// Load all data
function loadAllData() {
  loadGalleryData();
  loadMusicData();
  loadProgressData();
}

// ============================================
// TAB NAVIGATION
// ============================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;

    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
  });
});

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'success') {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// ============================================
// GALLERY MANAGEMENT
// ============================================

function loadGalleryData() {
  $.getJSON('/gallerydata', (data) => {
    galleryData = data;
    renderGallery();
  });
}

function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  grid.innerHTML = '';

  galleryData.forEach((item, index) => {
    const card = createGalleryCard(item, index);
    grid.appendChild(card);
  });

  // Initialize drag-and-drop
  if (gallerySortable) {
    gallerySortable.destroy();
  }

  gallerySortable = new Sortable(grid, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'dragging',
    onEnd: function(evt) {
      // Reorder gallery data
      const movedItem = galleryData.splice(evt.oldIndex, 1)[0];
      galleryData.splice(evt.newIndex, 0, movedItem);

      // Save new order
      socket.emit('reorderGallery', galleryData);
      showNotification('Gallery order updated');

      // Re-render to update numbers
      renderGallery();
    }
  });
}

function createGalleryCard(item, index) {
  const card = document.createElement('div');
  card.className = 'item-card';
  card.dataset.number = item.number;

  card.innerHTML = `
    <div class="drag-handle">☰</div>
    <div class="item-number">#${index + 1}</div>
    <img class="item-image" src="/imgs/${item.number}.png" alt="${item.caption}" data-number="${item.number}">
    <div class="item-content">
      <div class="item-caption" data-number="${item.number}">${item.caption}</div>
      <div class="item-actions">
        <button class="btn btn-small replace-image-btn" data-number="${item.number}">Replace Image</button>
        <button class="btn btn-small btn-danger delete-image-btn" data-number="${item.number}">Delete</button>
      </div>
    </div>
  `;

  // Add event listeners
  const caption = card.querySelector('.item-caption');
  caption.addEventListener('click', () => editCaption(item.number, caption));

  const image = card.querySelector('.item-image');
  image.addEventListener('click', () => replaceImage(item.number));

  const replaceBtn = card.querySelector('.replace-image-btn');
  replaceBtn.addEventListener('click', () => replaceImage(item.number));

  const deleteBtn = card.querySelector('.delete-image-btn');
  deleteBtn.addEventListener('click', () => deleteImage(item.number));

  return card;
}

function editCaption(number, captionElement) {
  const currentCaption = captionElement.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = currentCaption;

  captionElement.textContent = '';
  captionElement.appendChild(input);
  input.focus();
  input.select();

  const saveCaption = () => {
    const newCaption = input.value.trim();
    if (newCaption && newCaption !== currentCaption) {
      socket.emit('changeCaption', newCaption, number);

      // Update local data
      const itemIndex = galleryData.findIndex(item => item.number == number);
      if (itemIndex !== -1) {
        galleryData[itemIndex].caption = newCaption;
      }

      captionElement.textContent = newCaption;
      showNotification('Caption updated');
    } else {
      captionElement.textContent = currentCaption;
    }
  };

  input.addEventListener('blur', saveCaption);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveCaption();
    }
  });
}

function replaceImage(number) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';

  input.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function() {
        const base64 = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
        socket.emit('changeImage', base64, number);

        // Reload the image with cache buster
        setTimeout(() => {
          const img = document.querySelector(`img[data-number="${number}"]`);
          if (img) {
            img.src = `/imgs/${number}.png?${new Date().getTime()}`;
          }
          showNotification('Image updated');
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  });

  input.click();
}

function deleteImage(number) {
  if (!confirm('Are you sure you want to delete this image?')) {
    return;
  }

  socket.emit('deleteImage', number);

  // Remove from local data
  galleryData = galleryData.filter(item => item.number != number);

  // Re-render
  renderGallery();
  showNotification('Image deleted');
}

// Add new gallery image
document.getElementById('add-gallery-btn').addEventListener('click', () => {
  const fileInput = document.getElementById('gallery-image');
  const captionInput = document.getElementById('gallery-caption');

  const file = fileInput.files[0];
  const caption = captionInput.value.trim();

  if (!file) {
    showNotification('Please select an image', 'error');
    return;
  }

  if (!caption) {
    showNotification('Please enter a caption', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = function() {
    const base64 = reader.result.replace(/^data:image\/[a-z]+;base64,/, "");
    const number = Math.round(Math.random() * 99999999) + 10000000;

    socket.emit('upload', base64, number, caption);

    // Add to local data
    galleryData.push({ number, caption });

    // Clear inputs
    fileInput.value = '';
    captionInput.value = '';

    // Re-render
    renderGallery();
    showNotification('Image added successfully');
  };
  reader.readAsDataURL(file);
});

// ============================================
// MUSIC MANAGEMENT
// ============================================

function loadMusicData() {
  $.getJSON('/musicdata', (data) => {
    musicData = data.videos || [];
    renderMusic();
  });
}

function renderMusic() {
  const list = document.getElementById('music-list');
  list.innerHTML = '';

  musicData.forEach((item, index) => {
    const musicItem = createMusicItem(item, index);
    list.appendChild(musicItem);
  });

  // Initialize drag-and-drop
  if (musicSortable) {
    musicSortable.destroy();
  }

  musicSortable = new Sortable(list, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'dragging',
    onEnd: function(evt) {
      // Reorder music data
      const movedItem = musicData.splice(evt.oldIndex, 1)[0];
      musicData.splice(evt.newIndex, 0, movedItem);

      // Save new order
      socket.emit('updateMusicData', musicData);
      showNotification('Music order updated');

      // Re-render to update numbers
      renderMusic();
    }
  });
}

function createMusicItem(item, index) {
  const div = document.createElement('div');
  div.className = 'music-item';
  div.dataset.index = index;

  // Ensure type field exists
  const type = item.type || (item.copyright.includes('CC BY 4.0') ? 'composition' : 'performance');

  div.innerHTML = `
    <div class="music-item-content">
      <div class="drag-handle">☰</div>
      <div class="music-video-preview">
        <iframe src="https://www.youtube.com/embed/${item.video}" allowfullscreen></iframe>
      </div>
      <div class="music-details">
        <div class="item-number">#${index + 1}</div>
        <div class="music-title" data-index="${index}">${item.title}</div>
        <div class="music-meta">
          <div class="music-copyright" data-index="${index}">${item.copyright}</div>
          <span class="music-type-badge ${type}" data-index="${index}">${type === 'composition' ? 'Composition' : 'Performance'}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-small btn-danger delete-music-btn" data-index="${index}">Delete</button>
      </div>
    </div>
  `;

  // Add event listeners
  const title = div.querySelector('.music-title');
  title.addEventListener('click', () => editMusicField(index, 'title', title));

  const copyright = div.querySelector('.music-copyright');
  copyright.addEventListener('click', () => editMusicField(index, 'copyright', copyright));

  const typeBadge = div.querySelector('.music-type-badge');
  typeBadge.addEventListener('click', () => toggleMusicType(index, typeBadge));

  const deleteBtn = div.querySelector('.delete-music-btn');
  deleteBtn.addEventListener('click', () => deleteMusic(index));

  return div;
}

function editMusicField(index, field, element) {
  const currentValue = element.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = currentValue;

  element.textContent = '';
  element.appendChild(input);
  input.focus();
  input.select();

  const saveField = () => {
    const newValue = input.value.trim();
    if (newValue && newValue !== currentValue) {
      musicData[index][field] = newValue;
      socket.emit('updateMusicData', musicData);
      element.textContent = newValue;
      showNotification(`${field} updated`);
    } else {
      element.textContent = currentValue;
    }
  };

  input.addEventListener('blur', saveField);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveField();
    }
  });
}

function toggleMusicType(index, element) {
  const currentType = musicData[index].type || 'performance';
  const newType = currentType === 'composition' ? 'performance' : 'composition';

  musicData[index].type = newType;
  socket.emit('updateMusicData', musicData);

  element.className = `music-type-badge ${newType}`;
  element.textContent = newType === 'composition' ? 'Composition' : 'Performance';

  showNotification('Music type updated');
}

function deleteMusic(index) {
  if (!confirm('Are you sure you want to delete this music video?')) {
    return;
  }

  socket.emit('deleteMusic', index);
  musicData.splice(index, 1);
  renderMusic();
  showNotification('Music video deleted');
}

// Add new music video
document.getElementById('add-music-btn').addEventListener('click', () => {
  const youtubeId = document.getElementById('music-youtube-id').value.trim();
  const title = document.getElementById('music-title').value.trim();
  const copyright = document.getElementById('music-copyright').value.trim();
  const type = document.getElementById('music-type').value;

  if (!youtubeId || !title || !copyright) {
    showNotification('Please fill in all fields', 'error');
    return;
  }

  const newVideo = {
    video: youtubeId,
    title: title,
    copyright: copyright,
    type: type
  };

  socket.emit('addMusic', newVideo);
  musicData.push(newVideo);

  // Clear inputs
  document.getElementById('music-youtube-id').value = '';
  document.getElementById('music-title').value = '';
  document.getElementById('music-copyright').value = '';
  document.getElementById('music-type').value = 'composition';

  renderMusic();
  showNotification('Music video added');
});

// ============================================
// PROGRESS BARS MANAGEMENT
// ============================================

function loadProgressData() {
  $.getJSON('/progressdata', (data) => {
    progressData = data;
    renderProgress();
  });
}

function renderProgress() {
  const list = document.getElementById('progress-list');
  list.innerHTML = '';

  if (!progressData.projects || !progressData.progress) {
    return;
  }

  progressData.projects.forEach(id => {
    const item = progressData.progress[id];
    if (!item) return;

    const progressItem = createProgressItem(id, item);
    list.appendChild(progressItem);
  });
}

function createProgressItem(id, item) {
  const div = document.createElement('div');
  div.className = 'progress-item';

  const isInteger = Math.floor(item.progress) === item.progress;

  div.innerHTML = `
    <div class="progress-header">
      <div class="progress-name" data-id="${id}">${item.name}</div>
      <div class="item-actions">
        <button class="btn btn-small edit-progress-btn" data-id="${id}">Edit</button>
        <button class="btn btn-small btn-danger delete-progress-btn" data-id="${id}">Delete</button>
      </div>
    </div>
    <div class="progress-bar-container">
      <div class="progress-bar-fill" style="width: ${item.progress}%">${item.progress}%</div>
    </div>
  `;

  // Add event listeners
  const nameElement = div.querySelector('.progress-name');
  nameElement.addEventListener('click', () => editProgressName(id, nameElement));

  const editBtn = div.querySelector('.edit-progress-btn');
  editBtn.addEventListener('click', () => editProgressPercent(id));

  const deleteBtn = div.querySelector('.delete-progress-btn');
  deleteBtn.addEventListener('click', () => deleteProgress(id));

  return div;
}

function editProgressName(id, element) {
  const currentName = element.textContent;
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'inline-edit-input';
  input.value = currentName;

  element.textContent = '';
  element.appendChild(input);
  input.focus();
  input.select();

  const saveName = () => {
    const newName = input.value.trim();
    if (newName && newName !== currentName) {
      socket.emit('changeName', newName, id);
      progressData.progress[id].name = newName;
      element.textContent = newName;
      showNotification('Progress bar name updated');
    } else {
      element.textContent = currentName;
    }
  };

  input.addEventListener('blur', saveName);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveName();
    }
  });
}

function editProgressPercent(id) {
  const currentValue = progressData.progress[id].progress;
  const newValue = prompt('Enter new percentage (0-100):', currentValue);

  if (newValue !== null) {
    const percent = parseFloat(newValue);
    if (!isNaN(percent) && percent >= 0 && percent <= 100) {
      socket.emit('changeProgress', percent, id);
      progressData.progress[id].progress = percent;
      renderProgress();
      showNotification('Progress updated');
    } else {
      showNotification('Invalid percentage value', 'error');
    }
  }
}

function deleteProgress(id) {
  if (!confirm('Are you sure you want to delete this progress bar?')) {
    return;
  }

  socket.emit('removeBar', id);
  delete progressData.progress[id];
  progressData.projects = progressData.projects.filter(projectId => projectId != id);
  renderProgress();
  showNotification('Progress bar deleted');
}

// Add new progress bar
document.getElementById('add-progress-btn').addEventListener('click', () => {
  const name = document.getElementById('progress-name').value.trim();
  const percent = parseFloat(document.getElementById('progress-percent').value);

  if (!name) {
    showNotification('Please enter a name', 'error');
    return;
  }

  if (isNaN(percent) || percent < 0 || percent > 100) {
    showNotification('Please enter a valid percentage (0-100)', 'error');
    return;
  }

  socket.emit('createPBar', name, percent);

  // Clear inputs
  document.getElementById('progress-name').value = '';
  document.getElementById('progress-percent').value = '';

  // Reload data
  setTimeout(loadProgressData, 500);
  showNotification('Progress bar created');
});
