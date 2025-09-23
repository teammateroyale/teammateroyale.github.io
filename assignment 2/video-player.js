const video = document.getElementById('video');
const playPauseBtn = document.getElementById('play-pause');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const fullscreenBtn = document.getElementById('fullscreen');
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
// Play/Pause toggle
playPauseBtn.addEventListener('click', () => {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = '⏸';
  } else {
    video.pause();
    playPauseBtn.textContent = '▶';
  }
});

// Update progress bar
video.addEventListener('timeupdate', () => {
  progress.value = (video.currentTime / video.duration) * 100;
});

// Seek video
progress.addEventListener('input', () => {
  video.currentTime = (progress.value / 100) * video.duration;
});

// Volume control
volume.addEventListener('input', () => {
  video.volume = volume.value;
});

// Fullscreen toggle
fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    video.parentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});
// Show popup after video plays for X seconds
const magicPopup = document.getElementById('magic-popup');
const confirmBtn = document.getElementById('confirm-btn');
const videoTimeTrigger = 10; // seconds when popup should appear

let popupShown = false;

video.addEventListener('timeupdate', () => {
  // Only show once
  if (!popupShown && video.currentTime >= videoTimeTrigger) {
    magicPopup.style.display = 'flex';
    video.pause(); // optional: pause the video when popup appears
    popupShown = true;
  }
});

// Confirm button closes popup
confirmBtn.addEventListener('click', () => {
  magicPopup.style.display = 'none';
  video.play(); // resume video
});
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Update duration once metadata is loaded
video.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(video.duration);
  progress.max = Math.floor(video.duration);
});

// Update current time as video plays
video.addEventListener("timeupdate", () => {
  currentTimeEl.textContent = formatTime(video.currentTime);
  progress.value = Math.floor(video.currentTime);
});
// Allow seeking
progress.addEventListener("input", () => {
  video.currentTime = progress.value;
});






