/* Final refined Reflor logic
   - consistent flower sizes, layered SVGs, leaf unfurl
   - click-to-water + progress bar above seed
   - erase tool removes by id
   - gradient swatches bottom-left saved to localStorage
   - persistence by stable id
*/

(() => {
  // DOM
  const garden = document.getElementById("garden");
  const instruction = document.getElementById("instruction");
  const resetBtn = document.getElementById("resetBtn");
  const swatches = Array.from(document.querySelectorAll(".swatch"));
  const toolBtns = Array.from(document.querySelectorAll(".tool"));
  const typeBtns = Array.from(document.querySelectorAll(".type"));
  const waterAudio = document.getElementById("waterAudio");

  // CONFIG
  const GROWTH_MS = 15000; // demo: 15s (change to 15*60*1000 for real-time)
  const STORAGE_KEY = "reflor_v_final_v1";
  const BG_KEY = "reflor_bg_v1";

  // STATE
  let selectedTool = "seed";
  let selectedSpecies = "daisy";
  const timers = new Map(); // id -> interval handle

  // helpers
  const uid = () =>
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const loadFlowers = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  };
  const saveFlowers = (arr) =>
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));

  // load saved background
  const savedBg = localStorage.getItem(BG_KEY);
  if (savedBg) document.body.style.background = savedBg;

  // initial render of saved
  window.addEventListener("load", () => {
    const saved = loadFlowers();
    saved.forEach((f) => spawnFlower(f.id, f.x, f.y, f.species, false));
  });

  // TOOL selection
  toolBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      selectedTool = btn.dataset.tool || "seed";
      toolBtns.forEach((b) => b.classList.toggle("active", b === btn));
    })
  );
  // TYPE selection
  typeBtns.forEach((btn) =>
    btn.addEventListener("click", () => {
      selectedSpecies = btn.dataset.species || "daisy";
      typeBtns.forEach((b) => b.classList.toggle("active", b === btn));
    })
  );

  // SWATCHES: apply gradient, save
  swatches.forEach((sw) =>
    sw.addEventListener("click", () => {
      const g = sw.dataset.g;
      document.body.style.background = g;
      localStorage.setItem(BG_KEY, g);
    })
  );

  // GARDEN click: plant seed or erase
  garden.addEventListener("click", (ev) => {
    // if erase selected and clicked seed/flower, remove
    if (selectedTool === "erase") {
      const el = ev.target.closest(".seed, .flower");
      if (el) {
        removeElement(el);
        return;
      }
    }
    // planting
    if (selectedTool === "seed") {
      const rect = garden.getBoundingClientRect();
      const x = Math.round(ev.clientX - rect.left);
      const y = Math.round(ev.clientY - rect.top);
      if (instruction) instruction.style.display = "none";
      createSeed(x, y, selectedSpecies);
    }
  });

  // create seed element with progress UI above it
  function createSeed(x, y, species) {
    const id = uid();
    const seed = document.createElement("div");
    seed.className = "seed";
    seed.dataset.id = id;
    seed.dataset.species = species;
    seed.dataset.watered = "false";
    seed.style.left = `${x}px`;
    seed.style.top = `${y}px`;

    // progress wrap placed above seed
    const progressWrap = document.createElement("div");
    progressWrap.className = "progress-wrap";
    progressWrap.style.left = `${x}px`;
    progressWrap.style.top = `${y - 28}px`;
    progressWrap.style.position = "absolute";
    progressWrap.style.transform = "translateX(-50%)";
    progressWrap.style.width = "64px";
    progressWrap.style.height = "8px";
    progressWrap.style.borderRadius = "6px";
    progressWrap.style.background = "rgba(255,255,255,0.9)";
    progressWrap.style.overflow = "hidden";
    progressWrap.style.display = "none";
    progressWrap.style.zIndex = 400;

    const inner = document.createElement("div");
    inner.className = "progress-inner";
    inner.style.width = "0%";
    progressWrap.appendChild(inner);

    seed.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectedTool === "erase") {
        removeElement(seed);
        progressWrap.remove();
        return;
      }
      if (selectedTool === "water") {
        if (seed.dataset.watered === "false" && !timers.has(id)) {
          // show progress bar and start growth
          progressWrap.style.display = "block";
          waterSeed(seed, id, inner, progressWrap);
        }
      }
    });

    garden.appendChild(seed);
    garden.appendChild(progressWrap);
  }

  // water a seed: play sound, set watered state, animate progress, spawn flower
  function waterSeed(seedEl, id, progressEl, progressWrap) {
    // play sound
    playWater();

    seedEl.dataset.watered = "true";
    seedEl.classList.add("watered");

    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / GROWTH_MS) * 100);
      progressEl.style.width = pct + "%";
      if (elapsed >= GROWTH_MS) {
        clearInterval(handle);
        timers.delete(id);
        // coordinates for final flower: center the flower on seed
        const x = parseFloat(seedEl.style.left);
        const y = parseFloat(seedEl.style.top);
        const species = seedEl.dataset.species || selectedSpecies;
        // cleanup seed + progress UI
        // remove corresponding progressWrap (closest by position)
        document.querySelectorAll(".progress-wrap").forEach((pw) => {
          const px = parseFloat(pw.style.left);
          const py = parseFloat(pw.style.top) + 28; // original seed top
          if (Math.abs(px - x) < 2 && Math.abs(py - y) < 2) pw.remove();
        });
        seedEl.remove();
        spawnFlower(id, x, y, species, true);
      }
    };
    const handle = setInterval(tick, 100);
    timers.set(id, handle);
  }

  // spawn consistent-size photoreal flower with layered SVG and leaf unfurl after bloom
  function spawnFlower(id, x, y, species, save = true) {
    const el = document.createElement("div");
    el.className = "flower";
    el.dataset.id = id;
    el.dataset.species = species;
    // center flower on seed coordinate -> adjust offset so flower center sits at seed position
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;

    // SVGs designed to fit -- consistent size via CSS
    const svgMap = {
      daisy: `
        <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dG1" x1="0" x2="1"><stop offset="0" stop-color="#fffef0"/><stop offset="1" stop-color="#fff1c8"/></linearGradient>
            <radialGradient id="dC" cx="50%" cy="40%"><stop offset="0" stop-color="#ffea8a"/><stop offset="1" stop-color="#ffbe3b"/></radialGradient>
          </defs>
          <g transform="translate(60,60)">
            ${[0, 45, 90, 135, 180, 225, 270, 315]
              .map(
                (a) =>
                  `<g transform="rotate(${a})"><ellipse rx="14" ry="30" fill="url(#dG1)"/></g>`
              )
              .join("")}
            <circle cx="0" cy="0" r="12" fill="url(#dC)"/>
          </g>
          <g class="leaf" transform="translate(60,110)"><path d="M-18 0 C -32 -10, -38 -30, 0 -40 C 38 -30, 32 -10, 18 0 Z" fill="#7fc6a4"/></g>
        </svg>`,

      tulip: `
        <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tG1" x1="0" x2="1"><stop offset="0" stop-color="#ffd6e0"/><stop offset="1" stop-color="#f4a7c4"/></linearGradient>
          </defs>
          <g transform="translate(60,56)">
            <path d="M0 -40 C22 -28, 34 -8, 22 16 C6 40, -6 40, -22 16 C-34 -8, -22 -28, 0 -40 Z" fill="url(#tG1)"/>
            <rect x="-3" y="14" width="6" height="44" rx="3" fill="#2e7d5a"/>
          </g>
          <g class="leaf" transform="translate(42,114) rotate(-18)"><path d="M0 0 C 10 -8, 28 -20, 48 -10 C 28 -4, 18 4, 0 0 Z" fill="#7fc6a4"/></g>
        </svg>`,

      rose: `
        <svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="rG1" x1="0" x2="1"><stop offset="0" stop-color="#f9b5bd"/><stop offset="1" stop-color="#e35d6a"/></linearGradient>
          </defs>
          <g transform="translate(60,60)">
            <path d="M0 -36 C22 -28, 44 -4, 30 18 C10 38, -10 40, -30 18 C-44 -4, -22 -28, 0 -36 Z" fill="url(#rG1)"/>
            <path d="M0 -20 C12 -16, 24 -6, 16 6 C6 18, -6 18, -16 6 C-24 -6, -12 -16, 0 -20 Z" fill="#f6a1ab"/>
            <rect x="-3" y="18" width="6" height="44" rx="3" fill="#2e7d5a"/>
          </g>
          <g class="leaf" transform="translate(86,116) rotate(18)"><path d="M0 0 C -12 -8, -30 -20, -46 -10 C -30 -4, -18 4, 0 0 Z" fill="#7fc6a4"/></g>
        </svg>`,
    };

    el.innerHTML = svgMap[species] || svgMap.daisy;
    garden.appendChild(el);

    // play bloom (CSS handles scale); add class after insert so transition animates
    requestAnimationFrame(() => el.classList.add("bloom"));

    // show leaf after a small delay
    setTimeout(() => el.classList.add("leaf-show"), 900);

    // save if required
    if (save) {
      const arr = loadFlowers();
      arr.push({ id, x, y, species });
      saveFlowers(arr);
    }

    // erase on click
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectedTool === "erase") removeElement(el);
    });
  }

  // remove element and clear timers + storage
  function removeElement(el) {
    const id = el.dataset.id;
    if (id && timers.has(id)) {
      clearInterval(timers.get(id));
      timers.delete(id);
    }
    if (id) {
      const arr = loadFlowers().filter((f) => f.id !== id);
      saveFlowers(arr);
    }
    el.remove();
  }

  // Reset
  resetBtn.addEventListener("click", () => {
    timers.forEach((h) => clearInterval(h));
    timers.clear();
    document
      .querySelectorAll(".seed, .progress-wrap, .flower")
      .forEach((n) => n.remove());
    localStorage.removeItem(STORAGE_KEY);
    if (instruction) instruction.style.display = "block";
  });

  // play water sound (file or synth fallback)
  function playWater() {
    if (
      waterAudio &&
      waterAudio.src &&
      waterAudio.src.indexOf("water.mp3") !== -1
    ) {
      waterAudio.currentTime = 0;
      waterAudio.play().catch(() => synthDrop());
    } else {
      synthDrop();
    }
  }
  function synthDrop() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(900, ctx.currentTime);
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.7);
    } catch (e) {
      /* ignore */
    }
  }

  // helper to spawn seed used above (kept separate for clarity) - replaced earlier createSeed usage
  function createSeed(x, y, species) {
    // same as earlier but we need progressWrap element scoped; reuse function above by calling createSeed from garden click
    const id = uid();
    const seed = document.createElement("div");
    seed.className = "seed";
    seed.dataset.id = id;
    seed.dataset.species = species;
    seed.dataset.watered = "false";
    seed.style.left = `${x}px`;
    seed.style.top = `${y}px`;

    // progress wrap (above seed)
    const progressWrap = document.createElement("div");
    progressWrap.className = "progress-wrap";
    progressWrap.style.left = `${x}px`;
    progressWrap.style.top = `${y - 28}px`; // sits above seed
    progressWrap.style.position = "absolute";
    progressWrap.style.transform = "translateX(-50%)";
    progressWrap.style.width = "64px";
    progressWrap.style.height = "8px";
    progressWrap.style.borderRadius = "6px";
    progressWrap.style.background = "rgba(255,255,255,0.9)";
    progressWrap.style.overflow = "hidden";
    progressWrap.style.display = "none";
    progressWrap.style.zIndex = 400;

    const inner = document.createElement("div");
    inner.className = "progress-inner";
    inner.style.width = "0%";
    inner.style.height = "100%";
    inner.style.background = "linear-gradient(90deg,#7be495,#00b4d8)";
    inner.style.transition = "width .12s linear";
    progressWrap.appendChild(inner);

    seed.addEventListener("click", (e) => {
      e.stopPropagation();
      if (selectedTool === "erase") {
        removeElement(seed);
        progressWrap.remove();
        return;
      }
      if (selectedTool === "water") {
        if (seed.dataset.watered === "false" && !timers.has(id)) {
          progressWrap.style.display = "block";
          // start the watering/growth process
          waterSeed(seed, id, inner, progressWrap);
        }
      }
    });

    garden.appendChild(seed);
    garden.appendChild(progressWrap);
  }

  // Expose createSeed for immediate use from garden click handler (we used above)
  window.createSeed = createSeed;

  // Accessibility keyboard shortcuts 1=seed 2=water 3=erase
  window.addEventListener("keydown", (e) => {
    if (e.key === "1") selectTool("seed");
    if (e.key === "2") selectTool("water");
    if (e.key === "3") selectTool("erase");
  });
  function selectTool(name) {
    selectedTool = name;
    toolBtns.forEach((b) =>
      b.classList.toggle("active", b.dataset.tool === name)
    );
  }
})();
