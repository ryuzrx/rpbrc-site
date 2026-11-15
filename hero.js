'use strict';
// rpbrc — white heaven. Pre-rendered cloud images moved only with GPU transforms; everything pauses off-screen.
(() => {
const hero = document.querySelector('.hero.hv'); if (!hero) return;
const root = document.documentElement;
const calm = () => root.classList.contains('motion-off');
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const SRC = ['assets/clouds/cloud-1.png', 'assets/clouds/cloud-2.png', 'assets/clouds/cloud-3.png', 'assets/clouds/cloud-4.png'];
const DUSK = ['assets/clouds/silver-1.png', 'assets/clouds/silver-2.png', 'assets/clouds/silver-3.png', 'assets/clouds/silver-4.png'];
const small = innerWidth < 760;

/* entrance after the launch animation */
const boot = document.getElementById('boot');
const ready = () => hero.classList.add('hv-ready');
if (!boot || boot.hidden) setTimeout(ready, 60);
else { new MutationObserver((m, o) => { if (boot.hidden || boot.classList.contains('exiting')) { ready(); o.disconnect(); } }).observe(boot, {attributes: true}); setTimeout(ready, 5200); }

/* one drifting cloud image */
function cloudImg(width, src){
  const img = new Image(); img.src = src || pick(SRC); img.alt = ''; img.decoding = 'async'; img.loading = 'lazy';
  img.className = 'cl-img'; img.style.width = `${width}px`; img.draggable = false;
  if (Math.random() < .5) img.style.setProperty('--flip', '-1');
  return img;
}
function drift(el, dur, fromPx, toCss){
  el.style.setProperty('--a', `${fromPx}px`); el.style.setProperty('--b', toCss);
  el.style.animationDuration = `${dur}s`; el.style.animationDelay = `${-rnd(0, dur)}s`;
}

/* hero sky */
function layer(sel, count, wMin, wMax, topMin, topMax, dMin, dMax, op){
  const L = hero.querySelector(sel); if (!L) return;
  for (let i = 0; i < count; i++) { const w = rnd(wMin, wMax), c = cloudImg(w, pick(DUSK)); c.classList.add('cl-drift');
    c.style.top = `${rnd(topMin, topMax)}%`; c.style.opacity = op; drift(c, rnd(dMin, dMax), -w, 'calc(100vw + 20px)'); L.appendChild(c); }
}
layer('.hv-far', small ? 3 : 5, 220, 380, 0, 22, 160, 240, .7);
layer('.hv-mid', small ? 2 : 4, 380, 640, 46, 66, 110, 170, .95);
const bank = hero.querySelector('.hv-bank');
if (bank) for (let i = 0; i < 2; i++) { const b = cloudImg(0, 'assets/clouds/silver-bank.png'); b.loading = 'eager'; b.className = 'cl-bank'; b.style.left = `${i * 50 - 6}%`; if (i) b.style.setProperty('--flip', '-1'); bank.appendChild(b); }

/* light motes: one sprite drawn once, then blitted */
const cv = document.getElementById('hv-motes'), cx = cv && cv.getContext('2d', {alpha: true});
const sprite = document.createElement('canvas'); sprite.width = sprite.height = 32;
{ const s = sprite.getContext('2d'), g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(222,186,112,.75)'); g.addColorStop(.3, 'rgba(255,232,180,.4)'); g.addColorStop(1, 'rgba(255,240,210,0)'); s.fillStyle = g; s.fillRect(0, 0, 32, 32); }
let W = 0, H = 0, motes = [];
function size(){ if (!cv) return; const d = Math.min(devicePixelRatio || 1, 1.5); W = hero.clientWidth; H = hero.clientHeight;
  cv.width = Math.round(W * d); cv.height = Math.round(H * d); cx.setTransform(d, 0, 0, d, 0, 0);
  motes = Array.from({length: small ? 22 : 45}, () => ({x: rnd(0, W), y: rnd(0, H), r: rnd(3, 9), v: rnd(.12, .45), s: rnd(0, 6)})); }
size(); addEventListener('resize', size, {passive: true});

/* parallax + animation loop — only while the hero is on screen */
let mx = 0, my = 0, tx = 0, ty = 0, onScreen = true, raf = 0;
addEventListener('pointermove', e => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, {passive: true});
const layers = [...hero.querySelectorAll('[data-depth]')], inner = hero.querySelector('.hv-inner');
function frame(t){
  raf = 0; if (!onScreen || document.hidden) return;
  raf = requestAnimationFrame(frame);
  mx += (tx - mx) * .06; my += (ty - my) * .06;
  const y = scrollY;
  if (!calm()) {
    for (const l of layers) { const d = +l.dataset.depth; l.style.transform = `translate3d(${(-mx * 50 * d).toFixed(1)}px,${(-my * 24 * d + y * d * .5).toFixed(1)}px,0)`; }
    if (inner) { inner.style.transform = `translate3d(0,${(y * .3).toFixed(1)}px,0)`; inner.style.opacity = Math.max(0, 1 - y / (H * .6)).toFixed(3); }
  }
  if (!cx || calm()) return;
  cx.clearRect(0, 0, W, H);
  for (const m of motes) {
    m.y -= m.v; m.x += Math.sin(t / 2200 + m.s) * .2; if (m.y < -12) { m.y = H + 12; m.x = rnd(0, W); }
    cx.globalAlpha = .5 + .5 * Math.sin(t / 650 + m.s * 3); cx.drawImage(sprite, m.x + mx * 16 - m.r, m.y - m.r, m.r * 2, m.r * 2);
  }
  cx.globalAlpha = 1;
}
const kick = () => { if (!raf && onScreen && !document.hidden) raf = requestAnimationFrame(frame); };
new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; hero.classList.toggle('cl-paused', !onScreen); kick(); }).observe(hero);
document.addEventListener('visibilitychange', kick);
kick();

/* ---------- clouds inside every panel (CSS animation, paused off-screen) ---------- */
const panels = document.querySelectorAll('.lx-card:not(.lx-prod), .detail-card, .feature-explorer, .lx-proof>div, .contact-section, .comparison, .lx-prod .lx-body');
const pio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('cl-run', e.isIntersecting)), {rootMargin: '100px'});
panels.forEach(p => {
  const box = document.createElement('div'); box.className = 'cl-sky'; box.setAttribute('aria-hidden', 'true');
  const pw = p.clientWidth || 600, big = pw > 700, n = big ? 3 : 2;
  const darkP = !!p.closest('.lx-dark, .contact-section');
  for (let i = 0; i < n; i++) { const w = rnd(big ? 260 : 170, big ? 420 : 260), c = cloudImg(w, darkP ? pick(DUSK) : pick(SRC)); c.classList.add('cl-drift');
    c.style.bottom = `${-rnd(.05, .2) * w}px`; drift(c, rnd(70, 120), -w, `${pw + 20}px`); box.appendChild(c); }
  p.prepend(box); p.classList.add('cl-host'); if (p.matches('.contact-section')) p.classList.add('cl-dark');
  pio.observe(p);
});
})();
