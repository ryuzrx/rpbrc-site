/* rpbrc landing: in-game menu preview tabs (blank screen + menu + widget). */
(() => {
  const menu = document.querySelector('.gs-menu'); if (!menu) return;
  const title = menu.querySelector('[data-gs-title]');
  const tabs = [...menu.querySelectorAll('.gs-tab')], pages = [...menu.querySelectorAll('.gs-page')];
  const show = id => {
    const tab = tabs.find(t => t.dataset.page === id);
    // pages without their own preview fall back to clicker
    const page = pages.find(p => p.dataset.page === id) || pages[0];
    tabs.forEach(t => t.classList.toggle('on', t === tab));
    pages.forEach(p => p.classList.toggle('on', p === page));
    if (title && tab) title.textContent = tab.title;
  };
  tabs.forEach(t => t.addEventListener('click', () => { show(t.dataset.page); auto = false; }));
  // small toggles feel real
  menu.querySelectorAll('.gs-pill').forEach(p => p.addEventListener('click', () => { p.classList.toggle('on'); p.textContent = p.classList.contains('on') ? 'ON' : 'OFF'; }));
  menu.querySelectorAll('.gs-seg, .gs-opts, .gs-themes').forEach(g => g.addEventListener('click', e => {
    const item = e.target.closest('span, .gs-opt, i'); if (!item || item.parentElement !== g) return;
    const check = g.querySelector('.gs-check');
    [...g.children].forEach(c => c.classList.toggle('on', c === item));
    if (check) item.prepend(check);
  }));
  // gentle auto tour until the visitor clicks a tab
  let auto = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tour = ['clicker', 'display', 'flags', 'studio']; let i = 0;
  setInterval(() => { if (!auto || document.hidden) return; i = (i + 1) % tour.length; show(tour[i]); }, 3800);
})();
