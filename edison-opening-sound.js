// The sounds of Edison's sphere opening (LCARS board, 2026-10-26, Graham: "sounds like he's turning on... you hear the LCARS
// system, all the twinkling, you hear it turning on, you hear him turning on"). Everything is made live with Web Audio, like
// edison-cues.js and GlowBop's intro: no sound files, except his name. If public/sounds/edison-name.mp3 (or .wav) exists, that
// recording says "Edison" when the wordmark appears; until Graham records it, Edison's own Kokoro voice says it.
// His two lines ("Hello, sir. I'm Edison." / "Let me start your control panel.") come from his Kokoro voice through
// /api/voice/say, fetched early so they are ready on cue. Nothing plays while Edison is paused (the server refuses).
// window.EdisonOpeningSound: ready() waits for the browser to allow sound (a tap if it must), then the cue functions below.
(function () {
  'use strict';
  let ctx = null, out = null, room = null;
  function ac() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return ctx; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    out = ctx.createGain(); out.gain.value = 0.7;
    // a soft space around every sound: a short stereo reverb made from fading noise
    const len = Math.floor(ctx.sampleRate * 2.6), ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3); }
    room = ctx.createConvolver(); room.buffer = ir; const wet = ctx.createGain(); wet.gain.value = 0.35;
    out.connect(comp); out.connect(room); room.connect(wet); wet.connect(comp); comp.connect(ctx.destination);
    return ctx;
  }
  function tone(f, at, dur, vol, o) {
    const c = ac(); if (!c) return; o = o || {};
    const t = c.currentTime + (at || 0), osc = c.createOscillator(), g = c.createGain(), p = c.createStereoPanner();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur * 0.9);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.att || 0.01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    p.pan.value = o.pan || 0; let node = osc;
    if (o.lp) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(o.lp, t); if (o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo, t + dur * 0.8); fl.Q.value = o.q || 1; osc.connect(fl); node = fl; }
    node.connect(g); g.connect(p); p.connect(out); osc.start(t); osc.stop(t + dur + 0.05);
  }
  function air(at, dur, vol, from, to) { // a breath of filtered noise: whooshes and shimmer
    const c = ac(); if (!c) return;
    const t = c.currentTime + at, n = c.createBufferSource(), b = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = b; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(from, t); f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    n.connect(f); f.connect(g); g.connect(out); n.start(t); n.stop(t + dur);
  }
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];
  const S = {
    // he turns on: a low hum rises and opens up, like a machine waking
    wake() { tone(55, 0, 2.2, 0.16, { type: 'sawtooth', to: 220, lp: 120, lpTo: 1400, q: 4, att: 0.4 }); tone(110, 0.2, 2, 0.06, { to: 440, att: 0.5 }); air(0.1, 1.8, 0.05, 200, 1800); },
    beat() { tone(70, 0, 0.35, 0.3, { to: 42, att: 0.005 }); tone(140, 0, 0.18, 0.08, { att: 0.005 }); }, // his heartbeat, lub then dub
    burst() { air(0, 0.5, 0.08, 3000, 9000); [0, 1, 2, 3, 4, 5].forEach((i) => tone(PENTA[4 + (i % 6)], i * 0.035, 0.5, 0.05, { pan: -0.6 + i * 0.24 })); },
    light() { [261.63, 329.63, 392, 523.25].forEach((f, i) => tone(f, i * 0.05, 1.6, 0.05, { type: 'triangle', att: 0.25, lp: 600, lpTo: 4000, pan: (i - 1.5) * 0.3 })); },
    split() { for (let i = 0; i < 14; i++) tone(PENTA[Math.floor(Math.random() * PENTA.length)] * 2, i * 0.025, 0.25, 0.025, { pan: Math.random() * 2 - 1 }); air(0, 0.4, 0.05, 6000, 12000); },
    wink() { tone(1567.98, 0, 0.3, 0.06); tone(2093, 0.08, 0.4, 0.05, { pan: 0.3 }); },
    // floating out into space: a wide, quiet pad
    space() { [98, 146.83, 196, 293.66].forEach((f, i) => tone(f, i * 0.12, 4.5, 0.03, { type: 'triangle', att: 1.2, lp: 900, pan: (i - 1.5) * 0.4 })); air(0, 3.5, 0.02, 400, 1200); },
    twinkle() { tone(PENTA[Math.floor(Math.random() * PENTA.length)] * (Math.random() < 0.3 ? 2 : 1), 0, 0.6, 0.035, { pan: Math.random() * 1.6 - 0.8 }); },
    whoosh() { air(0, 1.2, 0.12, 300, 5000); tone(220, 0, 1.2, 0.05, { type: 'sawtooth', to: 880, lp: 800, lpTo: 5000 }); },
    // the board's pieces powering on: short LCARS chirps, two notes each
    chirp() { const f = [880, 987.77, 1174.66, 1318.51, 1567.98][Math.floor(Math.random() * 5)]; tone(f, 0, 0.09, 0.05, { type: 'square', lp: 3000, pan: Math.random() * 1.4 - 0.7 }); tone(f * 1.5, 0.06, 0.08, 0.03, { type: 'square', lp: 3200 }); },
    online() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.07, 1.4, 0.05, { type: 'triangle', pan: -0.4 + i * 0.27 })); tone(2093, 0.3, 1.2, 0.03); }
  };
  let lastChirp = 0;
  const quiet = () => typeof window.edisonVoiceOn === 'function' && !window.edisonVoiceOn(); // MUTE HIM on the board
  function play(name) { try { if (quiet() || !ac()) return; if (name === 'chirp') { const n = performance.now(); if (n - lastChirp < 45) return; lastChirp = n; } (S[name] || (() => {}))(); } catch (e) { /* no sound */ } }

  // His spoken lines, fetched early. say(text) resolves when he has finished (or at once if his voice is off or paused).
  const lines = {};
  function prepare(text) {
    if (lines[text]) return lines[text];
    lines[text] = fetch('/api/voice/say', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) })
      .then((r) => r.json()).then((r) => { if (!r.ok) return null; const a = new Audio(r.speakUrl); a.preload = 'auto'; return a; }).catch(() => null);
    return lines[text];
  }
  function say(text, onStart) {
    return prepare(text).then((a) => new Promise((done) => {
      if (!a || quiet()) { done(0); return; }
      const cap = setTimeout(() => done(1), 9000); // never hold the opening up for long
      a.onended = () => { clearTimeout(cap); done(1); }; a.onerror = () => { clearTimeout(cap); done(0); };
      a.play().then(() => { if (onStart) onStart(a.duration || 2); }).catch(() => { clearTimeout(cap); done(0); });
    }));
  }
  // His name: Graham's own recording if it is there, else his Kokoro voice
  let nameAudio = null;
  function prepareName() {
    if (nameAudio) return nameAudio;
    const tryFile = (u) => fetch(u, { method: 'HEAD' }).then((r) => (r.ok ? u : null)).catch(() => null);
    nameAudio = tryFile('/sounds/edison-name.mp3').then((u) => u || tryFile('/sounds/edison-name.wav')).then((u) => (u ? new Audio(u) : prepare('Edison.')));
    return nameAudio;
  }
  function sayName() { return prepareName().then((a) => { if (a && !quiet()) a.play().catch(() => {}); }); }

  // Browsers only allow sound after a tap or key press. If it is not allowed yet, show a quiet "tap to start" and wait.
  function ready() {
    const c = ac(); if (!c) return Promise.resolve(false);
    if (c.state === 'running') return Promise.resolve(true);
    return new Promise((ok) => {
      const tip = document.createElement('div');
      tip.textContent = 'TAP OR PRESS ANY KEY TO START EDISON';
      tip.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:#060418;color:#C9BCFF;font:700 22px/1 'Saira Condensed','Arial Narrow',sans-serif;letter-spacing:.3em;cursor:pointer";
      document.body.appendChild(tip);
      c.resume().then(() => { if (c.state === 'running') go(); }).catch(() => {});
      function go() { tip.remove(); removeEventListener('pointerdown', go, true); removeEventListener('keydown', go, true); c.resume().finally(() => ok(true)); }
      addEventListener('pointerdown', go, true); addEventListener('keydown', go, true);
    });
  }
  window.EdisonOpeningSound = { ready, play, say, prepare, prepareName, sayName };
})();
