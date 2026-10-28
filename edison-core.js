// Shared by the three Edison look mockups (A GPU dots, B shader globe, C flat disc).
// Edison's whole face lives in one GLSL function, edison(), so the graphics card colors every light and the
// processor does nothing per dot. The JS here only moves a handful of numbers each frame: time, mood, where he looks, blinks.
// Ported from paintEdison() in ../../index.html (inverse rainbow iris, speaking waves, listening ring, love, happy, sad, angry).
import * as THREE from 'three';

export const MOODS = ['idle', 'speaking', 'listening', 'love', 'happy', 'sad', 'angry'];

export const GLSL = /* glsl */`
uniform float uTime, uMix, uOpen, uVoice, uListenT;
uniform int uMoodA, uMoodB;
uniform vec3 uEye, uRight, uUp;
uniform mat3 uSpin;
#define PI 3.14159265
#define DEG 0.01745329
#define HX(h) vec3(float((h >> 16) & 255) / 255.0, float((h >> 8) & 255) / 255.0, float(h & 255) / 255.0)
struct Ed { vec3 c; float lift; float size; };

float segD(vec2 p, vec2 a, vec2 b) { vec2 d = b - a; float k = clamp(dot(p - a, d) / dot(d, d), 0.0, 1.0); return length(p - a - d * k); }
float arcD(vec2 p, vec2 c, float r, float a0, float a1) {
  vec2 q = p - c; float a = atan(q.y, q.x);
  bool ok = (a >= a0 && a <= a1) || (a + 2.0 * PI >= a0 && a + 2.0 * PI <= a1) || (a - 2.0 * PI >= a0 && a - 2.0 * PI <= a1);
  return ok ? abs(length(q) - r) : 9.0;
}
float eyeDot(vec2 p, float x) { return length(p - vec2(x, 0.12)) - 0.06; }

// The inverse rainbow iris (Graham's pick, 2026-10-22), soft stops by degrees from the eye's centre
vec3 iris(float d) {
  if (d >= 52.0) return HX(0x1A2C7A) * 0.55;
  if (d < 6.0) return mix(HX(0xE6E0FF), HX(0xC9BCFF), d / 6.0);
  if (d < 11.0) return mix(HX(0xC9BCFF), HX(0x9C3DFF), (d - 6.0) / 5.0);
  if (d < 16.0) return mix(HX(0x9C3DFF), HX(0x3B5BFF), (d - 11.0) / 5.0);
  if (d < 21.0) return mix(HX(0x3B5BFF), HX(0x33D6FF), (d - 16.0) / 5.0);
  if (d < 26.0) return mix(HX(0x33D6FF), HX(0x7CFF3B), (d - 21.0) / 5.0);
  if (d < 31.0) return mix(HX(0x7CFF3B), HX(0xFFE03B), (d - 26.0) / 5.0);
  if (d < 37.0) return mix(HX(0xFFE03B), HX(0xFF8A1F), (d - 31.0) / 6.0);
  if (d < 43.0) return mix(HX(0xFF8A1F), HX(0xFF3D5A), (d - 37.0) / 6.0);
  if (d < 48.0) return mix(HX(0xFF3D5A), HX(0x7A2FB0), (d - 43.0) / 5.0);
  return mix(HX(0x7A2FB0), HX(0x1A2C7A), (d - 48.0) / 4.0);
}
// Emoji faces: an amber disc with dark features
vec3 emoFace(float r, bool feature) {
  if (r > 0.56) return HX(0x101A4A);
  if (r > 0.5) return HX(0xFFD36A);
  return feature ? HX(0x101A4A) : HX(0xFFB020);
}
vec3 signColor(int mood, vec2 p, float r, float t) {
  if (mood == 3) { // love: a pink heart with a white shine that beats gently
    float s = 0.4 * (1.0 + 0.07 * max(0.0, sin(t * 5.5))), x = p.x / s, y = (p.y + 0.06) / s * 1.1, q = x * x + y * y - 1.0;
    float h = q * q * q - x * x * y * y * y;
    if (h > 0.0) return HX(0x101A4A);
    return length(p - vec2(-0.13, 0.14)) < 0.06 ? vec3(1.0) : h > -0.08 ? HX(0xFF9CCB) : HX(0xFF3D99);
  }
  bool eyes = min(eyeDot(p, -0.17), eyeDot(p, 0.17)) < 0.0;
  if (mood == 4) return emoFace(r, eyes || arcD(p, vec2(0.0, 0.04), 0.27, -155.0 * DEG, -25.0 * DEG) < 0.05);
  // sad: a frown and a cyan tear that keeps rolling down
  float ty = 0.02 - fract(t * 0.45) * 0.42;
  if (length(vec2((p.x - 0.2) * 1.2, p.y - ty)) < 0.055 && r < 0.5) return HX(0x33D6FF);
  return emoFace(r, eyes || arcD(p, vec2(0.0, -0.38), 0.22, 35.0 * DEG, 145.0 * DEG) < 0.045);
}

// One light on his globe. nObj: the light's direction on the unspun globe.
Ed edisonMood(vec3 nObj, int mood) {
  float t = uTime;
  vec3 nW = uSpin * nObj;
  float c = dot(nW, uEye), raw = acos(clamp(c, -1.0, 1.0)) / DEG, v = dot(nW, uUp), u = dot(nW, uRight), around = atan(v, u);
  vec2 p = vec2(u, v);
  float talkBeat = mood == 1 ? 0.5 + 0.5 * sin(t * 6.2) * sin(t * 3.9 + 1.0) : 0.0;
  float deg = raw / (1.0 + talkBeat * 0.08);
  // Blink: no lids (Graham, 2026-10-23). The rainbow itself squeezes shut to a line and opens again.
  if (c > 0.0 && uOpen < 1.0) deg = asin(min(1.0, length(vec2(u, v / max(uOpen, 0.04))))) / DEG / (1.0 + talkBeat * 0.08);
  Ed e; e.c = iris(deg); e.lift = 0.0; e.size = 1.0;
  if (mood == 1) { // speaking: the pupil breathes, light pulses through the iris and soft rainbow waves roll out
    // Toned down for the website (Graham, 2026-10-28: "very in your face"): smaller, slower, softer than the board
    float pulse = 0.5 + 0.5 * sin(raw * 0.32 - t * 6.5);
    if (deg > 8.0 && deg < 52.0) e.c *= 0.88 + 0.24 * pulse;
    if (raw < 56.0) e.size = 1.0 + 0.05 * pulse + talkBeat * 0.03;
    if (c > -0.2) {
      float wave = 0.5 + 0.5 * sin(raw * 0.2 - t * 5.5), crest = max(0.0, (wave - 0.8) / 0.2) * max(0.0, 1.0 - raw / 100.0);
      if (raw > 50.0 && crest > 0.0) e.c = mix(e.c, iris(mod(raw * 0.6 - t * 25.0, 48.0)), min(1.0, crest * 0.45)) * (1.0 + crest * 0.15);
      e.lift = crest * 0.02 + talkBeat * 0.005; e.size = max(e.size, 1.0 + crest * 0.06);
    }
  } else if (mood == 2) { // listening: a cyan ring draws itself round his eye and swells with your voice
    // Toned down (Graham, 2026-10-23): a thinner, mostly cyan ring that stays near the eye instead of climbing his sides
    float L = uVoice, edge = 58.0 + L * 6.0 + L * 2.0 * sin(around * 6.0 + t * 9.0), f = min(1.0, uListenT / 0.5);
    bool drawn = mod(around + PI / 2.0, 2.0 * PI) <= f * 2.0 * PI;
    if (raw > 53.0 && raw < edge && drawn) { e.c = mix(HX(0x33D6FF), vec3(1.0), 0.05 + L * 0.15) * (0.8 + 0.3 * min(1.0, L * 1.4)); e.lift = 0.03 + L * 0.06; }
    float o = fract(t * 1.6), r2 = edge + o * 14.0;
    if (L > 0.25 && abs(raw - r2) < 1.8 && drawn) { e.c = mix(e.c, HX(0x33D6FF), (1.0 - o) * 0.6); e.lift = max(e.lift, 0.02 * (1.0 - o)); }
    if (raw < 52.0) e.c *= 1.0 + L * 0.4;
  } else if (mood >= 3 && mood <= 5) {
    e.c = c > 0.12 ? signColor(mood, p, length(p), t) : HX(0x101A4A) * 0.6;
  } else if (mood == 6) { // angry: hot red iris, a hard V brow, a slight tremble
    float su = u + sin(t * 38.0) * 0.01, r = length(vec2(su, v));
    float brow = min(segD(vec2(su, v), vec2(-0.5, 0.46), vec2(-0.05, 0.12)), segD(vec2(su, v), vec2(0.05, 0.12), vec2(0.5, 0.46)));
    float browLine = 0.12 + (abs(su) - 0.05) * 0.76;
    if (c < 0.2) e.c = HX(0x4A0F22) * 0.7;
    else if (brow < 0.075) e.c = mix(HX(0xFFB020), vec3(1.0), brow < 0.035 ? 0.5 : 0.0);
    else if (v > browLine) e.c = HX(0x4A0F22);
    else if (r < 0.09) e.c = vec3(1.0);
    else if (r < 0.4) e.c = mix(HX(0xFF3D3D), HX(0xFFB020), max(0.0, 0.4 - r) * 1.2);
    else e.c = HX(0x4A0F22);
  }
  return e;
}
// Moods cross-fade over a third of a second instead of snapping
Ed edison(vec3 nObj) {
  Ed b = edisonMood(nObj, uMoodB);
  if (uMix >= 1.0) return b;
  Ed a = edisonMood(nObj, uMoodA);
  b.c = mix(a.c, b.c, uMix); b.lift = mix(a.lift, b.lift, uMix); b.size = mix(a.size, b.size, uMix); return b;
}
`;

// The few numbers the shader needs, moved once a frame
const BLINK_EVERY = +new URLSearchParams(location.search).get('blink') * 1000; // ?blink=2 blinks every 2 s, for demo clips
export function makeBrain(camera, center = new THREE.Vector3()) {
  const U = {
    uTime: { value: 0 }, uMix: { value: 1 }, uOpen: { value: 1 }, uVoice: { value: 0 }, uListenT: { value: 0 },
    uMoodA: { value: 0 }, uMoodB: { value: 0 }, uEye: { value: new THREE.Vector3(0, 0, 1) }, uRight: { value: new THREE.Vector3(1, 0, 0) },
    uUp: { value: new THREE.Vector3(0, 1, 0) }, uSpin: { value: new THREE.Matrix3() }
  };
  const spin = new THREE.Euler(), m4 = new THREE.Matrix4(), WUP = new THREE.Vector3(0, 1, 0), dir = new THREE.Vector3(0, -0.3, 1).normalize();
  const want = new THREE.Vector3(0, 0, 1), toYou = new THREE.Vector3();
  let mood = 0, mixAt = -1e9, listenAt = 0, nextBlink = 2000, blinkAt = -1e9, nextGlance = 0, voice = 0, last = performance.now();
  const brain = {
    U, get mood() { return MOODS[mood]; },
    setMood(name) { const k = MOODS.indexOf(name); if (k < 0 || k === mood) return; U.uMoodA.value = mood; mood = k; U.uMoodB.value = k; mixAt = performance.now(); if (name === 'listening') listenAt = mixAt; },
    update(now) {
      const dt = Math.min(0.1, (now - last) / 1000), t = now / 1000; last = now;
      U.uTime.value = t; U.uMix.value = Math.min(1, (now - mixAt) / 350);
      // He spins like the board's Edison
      spin.set(0.35 * Math.sin(t * 0.3), t * 0.45, 0); U.uSpin.value.setFromMatrix4(m4.makeRotationFromEuler(spin));
      // Where he looks: faces and anger look straight at you; otherwise he glances around and comes back
      toYou.copy(camera.position).sub(center).normalize();
      if (mood >= 3) want.copy(toYou);
      else if (now > nextGlance) { want.set((Math.random() - 0.5) * 1.3, (Math.random() - 0.5) * 0.8, 0).add(toYou).normalize(); if (Math.random() < 0.35) want.copy(toYou); nextGlance = now + 1800 + Math.random() * 2500; }
      dir.lerp(want, Math.min(1, dt * 5)).normalize(); U.uEye.value.copy(dir);
      U.uRight.value.crossVectors(WUP, dir).normalize(); U.uUp.value.crossVectors(dir, U.uRight.value).normalize();
      if (now > nextBlink) { blinkAt = now; nextBlink = now + (BLINK_EVERY || 3000 + Math.random() * 4000); }
      const bk = (now - blinkAt) / 450, s = bk >= 0 && bk < 1 ? Math.sin(bk * Math.PI) : 0; U.uOpen.value = 1 - s * s * (3 - 2 * s); // a soft, unhurried close and open
      // A made-up voice so the listening ring can be seen moving (same as the board's fallback)
      const target = Math.max(0, Math.sin(t * 7.3) * Math.sin(t * 2.1 + 0.6) * (Math.sin(t * 0.9) > -0.3 ? 1 : 0));
      voice += (target - voice) * Math.min(1, dt * 14); U.uVoice.value = voice; U.uListenT.value = (now - listenAt) / 1000;
    }
  };
  return brain;
}

// Shared page frame: mood buttons, auto-cycle, and the fps / frame-time readout.
// ?mood=idle holds one mood (used for the GPU measurements); without it the moods cycle every 4 s.
export function makeHud(title, note, brain) {
  const css = document.createElement('style');
  css.textContent = `body{margin:0;background:#060418;color:#F4F0FF;font:500 15px 'Segoe UI',sans-serif;overflow:hidden}
  canvas{display:block}#hud{position:fixed;left:16px;top:14px;right:16px;pointer-events:none}
  h1{margin:0;font-size:20px;color:#FF3D99}p{margin:4px 0 10px;max-width:640px;color:#C9BCFF}
  #moods{display:flex;flex-wrap:wrap;gap:6px;pointer-events:auto}#moods button{background:#22174F;color:#F4F0FF;border:2px solid #2B1B6B;border-radius:8px;padding:5px 11px;font:600 14px 'Segoe UI',sans-serif;cursor:pointer}
  #moods button.on{border-color:#33D6FF;color:#33D6FF}#fps{position:fixed;right:16px;bottom:14px;background:#22174F;border:2px solid #9C3DFF;border-radius:8px;padding:6px 12px;font:600 15px Consolas,monospace;color:#B6FF3B}`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'hud'; hud.innerHTML = `<h1>${title}</h1><p>${note}</p><div id="moods"></div>`; document.body.appendChild(hud);
  const fpsBox = document.createElement('div'); fpsBox.id = 'fps'; document.body.appendChild(fpsBox);
  const q = new URLSearchParams(location.search), hold = q.get('mood'), btns = {};
  let auto = !hold, k = 0;
  for (const m of ['auto', ...MOODS]) {
    const b = document.createElement('button'); b.textContent = m; btns[m] = b;
    b.onclick = () => { auto = m === 'auto'; if (!auto) brain.setMood(m); paint(); };
    hud.querySelector('#moods').appendChild(b);
  }
  const paint = () => { for (const m in btns) btns[m].classList.toggle('on', m === 'auto' ? auto : !auto && brain.mood === m); };
  if (hold) brain.setMood(hold);
  if (q.has('clean')) { hud.style.display = 'none'; fpsBox.style.display = 'none'; } // just Edison, for the side-by-side demo
  setInterval(() => { if (auto) { k = (k + 1) % MOODS.length; brain.setMood(MOODS[k]); paint(); } }, 4000);
  paint();
  // Frames a second, plus how long each frame's JS + draw call took on the processor (avg / worst over the last second)
  let frames = 0, work = 0, worst = 0, since = performance.now();
  window.__perf = null;
  return {
    frame(ms) {
      frames++; work += ms; worst = Math.max(worst, ms);
      const now = performance.now();
      if (now - since >= 1000) {
        const fps = frames * 1000 / (now - since); window.__perf = { fps: +fps.toFixed(1), avg: +(work / frames).toFixed(2), max: +worst.toFixed(2), mood: brain.mood };
        fpsBox.textContent = `${fps.toFixed(0)} fps · frame ${(work / frames).toFixed(2)} ms (worst ${worst.toFixed(1)})`;
        frames = 0; work = 0; worst = 0; since = now;
      }
    }
  };
}

// Same camera and canvas setup for all three, so the numbers compare fairly: Edison about 520 px across at 1600 x 900
export function makeStage() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio)); renderer.setSize(innerWidth, innerHeight); renderer.setClearColor(0x060418);
  document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0.6, 6.2); camera.lookAt(0, 0.1, 0);
  addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });
  return { renderer, scene, camera };
}
