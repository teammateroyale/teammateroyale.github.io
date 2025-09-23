// grain effect
const canvas = document.getElementById("noiseCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function drawNoise() {
  const w = canvas.width;
  const h = canvas.height;
  const imageData = ctx.createImageData(w, h);
  const buffer = new Uint32Array(imageData.data.buffer);
  for (let i = 0; i < buffer.length; i++) {
    const val = Math.random() < 0.05 ? 0xff : 0; // black & white noise
    buffer[i] = 0xff000000 | (val << 16) | (val << 8) | val;
  }
  ctx.putImageData(imageData, 0, 0);
  requestAnimationFrame(drawNoise);
}

drawNoise();

