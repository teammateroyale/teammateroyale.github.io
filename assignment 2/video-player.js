const video = document.getElementById('video');
const playPauseBtn = document.getElementById('play-pause');
const progress = document.getElementById('progress');
const volume = document.getElementById('volume');
const fullscreenBtn = document.getElementById('fullscreen');

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







