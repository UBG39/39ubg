// UBG39 — Vanta waves + bubbles, games.json loader, live search, 3D tilt cards.
(function vanta() {
  try {
    if (window.VANTA && window.THREE) {
      window.VANTA.WAVES({
        el: "#vanta", mouseControls: true, touchControls: true, gyroControls: false,
        minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
        color: 0x0a5fc4, shininess: 60, waveHeight: 22, waveSpeed: 0.85, zoom: 0.8
      });
    }
  } catch (e) { /* CSS gradient fallback stays */ }
})();

(function bubbles() {
  const c = document.getElementById("bubbles"), ctx = c.getContext("2d");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let w, h, dpr, list = [];
  const make = (fresh) => ({ x: Math.random() * w, y: fresh ? Math.random() * h : h + 20,
    r: 2 + Math.random() * 9, s: .25 + Math.random() * .7, p: Math.random() * 6.28, a: .15 + Math.random() * .35 });
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    list = Array.from({ length: Math.round(Math.min(60, w / 24)) }, () => make(true)); }
  function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (const b of list) {
      b.y -= b.s; b.x += Math.sin(t / 900 + b.p) * .35;
      if (b.y < -20) Object.assign(b, make(false));
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283);
      ctx.fillStyle = `rgba(200,240,255,${b.a * .25})`; ctx.fill();
      ctx.strokeStyle = `rgba(255,255,255,${b.a + .15})`; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(b.x - b.r * .35, b.y - b.r * .35, b.r * .22, 0, 6.283);
      ctx.fillStyle = `rgba(255,255,255,${b.a + .3})`; ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  addEventListener("resize", size); size(); requestAnimationFrame(tick);
})();

const grid = document.getElementById("games");
const search = document.getElementById("search");
let games = [];
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PLAY = '<span class="play"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg></span>';

function render() {
  const q = search.value.trim().toLowerCase();
  const list = games.filter(g => g.title.toLowerCase().includes(q));
  grid.innerHTML = list.map((g, i) =>
    `<a class="card" style="--i:${i}" href="${esc(g.url)}" aria-label="${esc(g.title)}">
      <img src="${esc(g.image)}" alt="" loading="lazy">${PLAY}<span class="title">${esc(g.title)}</span></a>`).join("");
}

// 3D tilt + cursor light (mouse only)
if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
  grid.addEventListener("pointermove", e => {
    const card = e.target.closest(".card"); if (!card) return;
    const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    card.style.setProperty("--ry", ((x - .5) * 12).toFixed(2) + "deg");
    card.style.setProperty("--rx", ((.5 - y) * 10).toFixed(2) + "deg");
    card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
  });
  grid.addEventListener("pointerout", e => {
    const card = e.target.closest(".card"); if (!card || card.contains(e.relatedTarget)) return;
    card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg");
  });
}

search.addEventListener("input", render);
fetch("games.json").then(r => r.json()).then(d => { games = d; render(); }).catch(() => {});
