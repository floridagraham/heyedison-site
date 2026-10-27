// Edison's gentle sound cues (2026-10-26, Graham: "some gentle sound effects ... peaceful and not interruptive", so he
// can tell Edison is thinking without Edison talking). Every cue is made in the browser with Web Audio (soft sine
// tones and a little filtered air), so there are no sound files. Quiet by design: the loudest peak is about a third of
// full volume, and every note fades in and out so nothing clicks.
// window.edisonCue(moment, variant, volume): moment = heard | thinking | ready | done; variant = a..d; volume 0..1.
(function () {
  var ctx = null;
  function ac() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!ctx && AC) ctx = new AC();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // One soft note: a sine (plus a quieter octave for a bell colour), gentle attack, long smooth release.
  function note(freq, at, len, vol, opts) {
    var c = ac(); if (!c) return;
    opts = opts || {};
    var t = c.currentTime + at, g = c.createGain(), o = c.createOscillator();
    o.type = opts.type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (opts.glide) o.frequency.exponentialRampToValueAtTime(freq * opts.glide, t + len);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (opts.attack || 0.02));
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    var lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = opts.cut || 3200;
    o.connect(g); g.connect(lp); lp.connect(c.destination);
    o.start(t); o.stop(t + len + 0.05);
    if (opts.bell) note(freq * 2.01, at, len * 0.6, vol * 0.25, { attack: opts.attack, cut: 5000 });
  }
  // A soft breath of air: filtered noise that swells and fades.
  function air(at, len, vol, centre) {
    var c = ac(); if (!c) return;
    var t = c.currentTime + at, n = Math.floor(c.sampleRate * (len + 0.1)), buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain();
    s.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = centre || 900; bp.Q.value = 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + len * 0.45); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    s.connect(bp); bp.connect(g); g.connect(c.destination); s.start(t); s.stop(t + len + 0.05);
  }

  var CUES = {
    // He heard you and started thinking.
    heard: {
      a: { name: 'Glass tap', about: 'One soft high tap, like a fingertip on a glass.', play: function (v) { v *= 1.8; v = v * 1.8; note(1318.5, 0, 0.9, 0.18 * v, { bell: true }); } },
      b: { name: 'Rising pair', about: 'Two gentle notes going up: "got it".', play: function (v) { v *= 1.8; v = v * 1.8; note(784, 0, 0.6, 0.14 * v, { bell: true }); note(1046.5, 0.13, 0.9, 0.14 * v, { bell: true }); } },
      c: { name: 'Wooden blip', about: 'A warm, round marimba-style note.', play: function (v) { v *= 1.8; v = v * 1.8; note(523.25, 0, 0.5, 0.22 * v, { cut: 1400, attack: 0.008 }); note(1046.5, 0, 0.25, 0.05 * v, { cut: 1800 }); } },
      d: { name: 'Soft breath', about: 'A quiet whoosh of air, no note at all.', play: function (v) { v *= 1.8; v = v * 1.8; air(0, 0.8, 0.10 * v, 1100); } }
    },
    // Still thinking (played every few seconds while he works, very quietly).
    thinking: {
      a: { name: 'Slow heartbeat', about: 'Two low, soft pulses.', play: function (v) { v *= 1.8; v = v * 1.8; note(110, 0, 0.35, 0.16 * v, { cut: 500 }); note(110, 0.28, 0.4, 0.11 * v, { cut: 500 }); } },
      b: { name: 'Distant bell', about: 'One faraway bell, very quiet.', play: function (v) { v *= 1.8; v = v * 1.8; note(659.25, 0, 1.6, 0.07 * v, { bell: true, attack: 0.04 }); } },
      c: { name: 'Shimmer', about: 'A faint sparkle that drifts up.', play: function (v) { v *= 1.8; v = v * 1.8; [1567.98, 1760, 2093].forEach(function (f, i) { note(f, i * 0.09, 0.7, 0.035 * v, { bell: false }); }); } },
      d: { name: 'Tide', about: 'A slow breath in and out, like a calm wave.', play: function (v) { v *= 1.8; v = v * 1.8; air(0, 1.8, 0.05 * v, 500); } }
    },
    // The answer is ready (just before he speaks, or when it goes on his screen without words).
    ready: {
      a: { name: 'Settle', about: 'Two notes coming down to rest.', play: function (v) { v *= 1.8; v = v * 1.8; note(1046.5, 0, 0.5, 0.12 * v, { bell: true }); note(783.99, 0.12, 0.9, 0.12 * v, { bell: true }); } },
      b: { name: 'Little chime', about: 'One clear, short chime.', play: function (v) { v *= 1.8; v = v * 1.8; note(1174.66, 0, 0.8, 0.13 * v, { bell: true }); } },
      c: { name: 'Bloom', about: 'A soft chord that opens up.', play: function (v) { v *= 1.8; v = v * 1.8; [523.25, 659.25, 783.99].forEach(function (f, i) { note(f, i * 0.05, 1.2, 0.07 * v, { attack: 0.08, cut: 2200 }); }); } },
      d: { name: 'None', about: 'No sound; he just starts talking.', play: function () {} }
    },
    // A team job finished, or something new is waiting for you.
    done: {
      a: { name: 'Three steps up', about: 'Three soft rising notes: "all done".', play: function (v) { v *= 1.8; v = v * 1.8; [659.25, 783.99, 1046.5].forEach(function (f, i) { note(f, i * 0.14, 0.8, 0.12 * v, { bell: true }); }); } },
      b: { name: 'Wind chime', about: 'A few loose, gentle chime notes.', play: function (v) { v *= 1.8; v = v * 1.8; [1318.5, 1567.98, 1174.66, 1760].forEach(function (f, i) { note(f, i * 0.17 + Math.random() * 0.04, 1.4, 0.05 * v, { bell: true }); }); } },
      c: { name: 'Warm pair', about: 'Two low, warm notes, like a soft doorbell.', play: function (v) { v *= 1.8; v = v * 1.8; note(392, 0, 0.9, 0.16 * v, { cut: 1500 }); note(523.25, 0.22, 1.1, 0.16 * v, { cut: 1500 }); } },
      d: { name: 'Glass bloom', about: 'A slow glassy chord, very calm.', play: function (v) { v *= 1.8; v = v * 1.8; [783.99, 987.77, 1174.66].forEach(function (f, i) { note(f, i * 0.12, 1.8, 0.06 * v, { bell: true, attack: 0.1 }); }); } }
    }
  };

  window.edisonCues = CUES;
  window.edisonCue = function (moment, variant, volume) {
    var m = CUES[moment], c = m && m[variant || 'a'];
    if (!c) return;
    try { c.play(volume == null ? 1 : Math.max(0, Math.min(1, volume))); } catch (e) { /* sound is optional */ }
  };
})();
