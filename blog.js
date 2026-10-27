// Blog pages: paint Edison as the O in the wordmark (his live rainbow icon) and animate the tab icon, like the home page.
(function () {
  if (!window.EdisonIcon) return;
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const marks = [...document.querySelectorAll('canvas.markO')].map((c) => ({ c, g: c.getContext('2d') }));
  const t0 = performance.now();
  const paint = (now) => marks.forEach((m) => EdisonIcon.draw(m.g, m.c.width, now - t0, { bare: true }));
  if (still) { paint(t0); return; }
  let last = 0;
  const tick = (now) => { if (now - last > 50) { last = now; paint(now); } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  EdisonIcon.start();
})();
