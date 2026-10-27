// The waves of dots behind the page (Graham, 2026-10-27: "slow, very faint pulsing dots in the background, for depth").
// Two layers of dots: a fine far layer and a sparser near layer that moves more when you scroll, so the page has depth.
// Slow waves of light roll across them; at a wave's crest a dot picks up a faint touch of Edison's rainbow.
// Drawn at 30 fps on a plain 2D canvas; reduced-motion visitors get one still frame.
(function () {
  const cv = document.getElementById('field'); if (!cv) return;
  const g = cv.getContext('2d');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Edison's iris colors, and the lavender the dots rest at
  const RAIN = ['#9C3DFF', '#4F6BFF', '#33D6FF', '#7CFF3B', '#FFE03B', '#FF8A1F', '#FF3D5A', '#FF3D99'];
  const REST = '#C9BCFF';
  const LAYERS = [
    { gap: 30, r: 0.9, base: 0.05, amp: 0.16, par: 0.06, speed: 0.35 },
    { gap: 62, r: 1.7, base: 0.05, amp: 0.26, par: 0.22, speed: 0.5 }
  ];
  let W = 0, H = 0, dpr = 1;
  function size() {
    dpr = Math.min(1.5, devicePixelRatio || 1); W = innerWidth; H = innerHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (still) draw(8);
  }
  function draw(t) {
    g.clearRect(0, 0, W, H);
    const sy = scrollY;
    for (const L of LAYERS) {
      const off = (sy * L.par) % L.gap, ts = t * L.speed;
      for (let y = -off - L.gap; y < H + L.gap; y += L.gap) {
        const wy = y + sy * L.par; // the dot's place in the field, so waves travel with the dots
        for (let x = (Math.floor(wy / L.gap) % 2) * L.gap / 2; x < W + L.gap; x += L.gap) {
          const w = 0.5 + 0.5 * Math.sin(x * 0.009 + wy * 0.006 - ts) * Math.sin(wy * 0.011 - x * 0.003 - ts * 0.6 + 1.3);
          const crest = w * w * w, a = L.base + L.amp * crest;
          g.globalAlpha = a;
          g.fillStyle = crest > 0.35 ? RAIN[((Math.floor((x + wy) / 180) % 8) + 8) % 8] : REST;
          g.beginPath(); g.arc(x, y, L.r * (0.8 + crest * 0.6), 0, 6.283); g.fill();
        }
      }
    }
    g.globalAlpha = 1;
  }
  addEventListener('resize', size); size();
  if (still) { addEventListener('scroll', () => draw(8), { passive: true }); return; }
  let last = 0;
  function loop(now) {
    if (now - last >= 33) { last = now; draw(now / 1000); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
