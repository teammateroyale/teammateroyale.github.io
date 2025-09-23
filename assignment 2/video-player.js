const video = document.getElementById("video");
const playPauseBtn = document.getElementById("play-pause");
const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const volumeBtn = document.querySelector(".volume-btn");
const fullscreenBtn = document.getElementById("fullscreen");

if (video && playPauseBtn && progress && volume && volumeBtn && fullscreenBtn) {
  playPauseBtn.addEventListener("click", () => {
    if (video.paused) {
      video.play();
      playPauseBtn.textContent = "⏸";
    } else {
      video.pause();
      playPauseBtn.textContent = "▶";
    }
  });

  video.addEventListener("timeupdate", () => {
    progress.max = video.duration;
    progress.value = video.currentTime;
  });

  progress.addEventListener("input", () => {
    video.currentTime = progress.value;
  });

  volume.addEventListener("input", () => {
    video.volume = volume.value;
  });
   volumeBtn.addEventListener("click", () => {
    if(video.volume > 0){
      video.dataset.prevVolume = video.volume;
      video.volume = 0;
      volume.value = 0;
      volumeBtn.textContent = "🔇";
    } else {
      video.volume = video.dataset.prevVolume || 1;
      volume.value = video.volume;
      volumeBtn.textContent = "🔊";
    }
  });

  // Fullscreen toggle
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      video.parentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

}





