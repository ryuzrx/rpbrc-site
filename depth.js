/* depth.js — builds the 3D pieces depth.css styles, and fixes the nav highlight at the top of the page. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // client card: turn the flat mark into an extruded slab inside a shared 3D space with the rings
  document.querySelectorAll('.lx-orbit').forEach(orbit => {
    const img = orbit.querySelector('img');
    if (!img || orbit.classList.contains('d3')) return;
    const space = document.createElement('div'); space.className = 'o3';
    const slab = document.createElement('div'); slab.className = 'slab';
    for (let z = -10; z <= 10; z += 2) { const i = document.createElement('i'); i.style.setProperty('--z', z + 'px'); slab.append(i); }
    const back = img.cloneNode(); back.classList.add('back'); back.alt = '';
    slab.append(back, img);
    const shadow = document.createElement('span'); shadow.className = 'shadow';
    orbit.querySelectorAll('.r').forEach(r => space.append(r));
    space.append(shadow, slab);
    orbit.prepend(space);
    orbit.classList.add('d3');
  });

  // glare on app windows + mini previews, following the pointer
  document.querySelectorAll('.lx-win, .lx-mini').forEach(el => {
    const g = document.createElement('span'); g.className = 'lx-glare'; g.setAttribute('aria-hidden', 'true'); el.append(g);
    if (reduce) return;
    const host = el.closest('.lx-prod, .lx-stage') || el;
    host.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, {passive: true});
  });

  // nav: nothing is "current" while the hero is on screen
  const hero = document.getElementById('top');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      document.querySelectorAll('.navigation nav a[aria-current]').forEach(a => a.removeAttribute('aria-current'));
    },{threshold: .35}).observe(hero);
  }
})();
