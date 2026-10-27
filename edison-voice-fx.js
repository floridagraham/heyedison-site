// Edison's voice finish (Graham, 2026-10-26, picked "Assistant" from mockups/voice-polish.html): his own voice, a little
// cleaner and more present, in a short room with a faint doubled shimmer, the "smart home in the walls" sound, without copying
// anyone's voice. Plain Web Audio, no download, nothing on the server.
// Use: out = EdisonVoiceFX.wrap(audioContext, sourceNode); out.connect(...). localStorage 'edison-voice-fx' = 'off' plays him dry.
(function () {
  var FINISH = { hp: 130, presence: 3, air: 4, room: 0.55, roomMix: 0.14, chorus: 0.16 }; // the same numbers as the audition page
  var irs = typeof WeakMap === 'function' ? new WeakMap() : null; // one room echo per audio context, made once
  function roomIR(c, sec) {
    var have = irs && irs.get(c); if (have) return have;
    var n = Math.floor(c.sampleRate * sec), ir = c.createBuffer(2, n, c.sampleRate);
    for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3.2); }
    if (irs) irs.set(c, ir); return ir;
  }
  function off() { try { return localStorage.getItem('edison-voice-fx') === 'off'; } catch (e) { return false; } }
  window.EdisonVoiceFX = {
    finish: FINISH,
    wrap: function (c, input) {
      if (off()) return input;
      try {
        var f = FINISH, node = input, out = c.createGain();
        var chain = function (n) { node.connect(n); node = n; };
        var hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = f.hp; chain(hp);
        var p = c.createBiquadFilter(); p.type = 'peaking'; p.frequency.value = 3200; p.Q.value = 0.9; p.gain.value = f.presence; chain(p);
        var a = c.createBiquadFilter(); a.type = 'highshelf'; a.frequency.value = 9000; a.gain.value = f.air; chain(a);
        var comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3; comp.attack.value = 0.005; comp.release.value = 0.15; chain(comp);
        node.connect(out); // his voice
        var d = c.createDelay(0.05); d.delayTime.value = 0.014; var lfo = c.createOscillator(), depth = c.createGain(); lfo.frequency.value = 0.35; depth.gain.value = 0.0025;
        lfo.connect(depth); depth.connect(d.delayTime); lfo.start(); var cg = c.createGain(); cg.gain.value = f.chorus; node.connect(d); d.connect(cg); cg.connect(out); // the faint doubled shimmer
        var cv = c.createConvolver(), rg = c.createGain(); cv.buffer = roomIR(c, f.room); rg.gain.value = f.roomMix; node.connect(cv); cv.connect(rg); rg.connect(out); // the short room
        return out;
      } catch (e) { return input; } // anything odd: play him dry rather than not at all
    }
  };
})();
