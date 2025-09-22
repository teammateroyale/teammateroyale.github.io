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

// OPTIONAL: Simple floating particle effect
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray = [];
class Particle {
  constructor(){
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random()*3+1;
    this.speedY = Math.random()*1+0.5;
  }
  update(){
    this.y -= this.speedY;
    if(this.y < 0) this.y = canvas.height;
  }
  draw(){
    ctx.fillStyle = "rgba(255,215,0,0.5)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  }
}
function initParticles(){
  particlesArray = [];
  for(let i=0;i<50;i++){
    particlesArray.push(new Particle());
  }
}
function animateParticles(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particlesArray.forEach(p=>{p.update(); p.draw()});
  requestAnimationFrame(animateParticles);
}
initParticles();
animateParticles();
window.addEventListener('resize', ()=>{
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initParticles();
});


