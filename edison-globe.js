// Edison's dot globe for the website: the same ~1,500 GPU dots and rainbow eye as the board (look A, edison-core.js),
// mounted into any box on the page. Transparent background so the page's own sky shows through.
// Pauses itself when scrolled out of view, to save phone batteries.
import * as THREE from 'three';
import { GLSL, makeBrain } from './edison-core.js';

export function mountGlobe(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(1.75, devicePixelRatio));
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.45, 6.2); camera.lookAt(0, 0, 0);
  const brain = makeBrain(camera);

  // His dark core
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.0, 48, 32), new THREE.MeshBasicMaterial({ color: 0x060418 })));

  // The board's light layout: rings of latitude every 4.6 degrees
  const P = [];
  for (let la = -86; la <= 86; la += 4.6) {
    const r = Math.cos(la * Math.PI / 180), n = Math.max(6, Math.round(76 * r));
    for (let k = 0; k < n; k++) { const lo = k / n * Math.PI * 2; P.push(r * Math.sin(lo), Math.sin(la * Math.PI / 180), r * Math.cos(lo)); }
  }
  const geo = new THREE.InstancedBufferGeometry().copy(new THREE.SphereGeometry(0.04, 8, 6));
  geo.instanceCount = P.length / 3;
  geo.setAttribute('aDir', new THREE.InstancedBufferAttribute(new Float32Array(P), 3));
  const mat = new THREE.ShaderMaterial({
    uniforms: brain.U,
    vertexShader: GLSL + /* glsl */`
      attribute vec3 aDir; varying vec3 vC; varying float vShade;
      void main() {
        Ed e = edison(aDir);
        vec3 wp = uSpin * (aDir * (1.06 + e.lift) + position * e.size);
        vC = e.c; vShade = 0.72 + 0.45 * max(0.0, dot(uSpin * normalize(position), normalize(vec3(0.3, 0.6, 1.0))));
        gl_Position = projectionMatrix * viewMatrix * vec4(wp, 1.0);
      }`,
    fragmentShader: /* glsl */`varying vec3 vC; varying float vShade; void main() { gl_FragColor = vec4(vC * vShade, 1.0); }`
  });
  const dots = new THREE.Mesh(geo, mat); dots.frustumCulled = false; scene.add(dots);

  function size() {
    const w = el.clientWidth || 1, h = el.clientHeight || 1;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    // keep the whole globe in frame on tall, narrow boxes
    camera.fov = w / h < 1 ? 2 * Math.atan(Math.tan(15 * Math.PI / 180) / (w / h)) * 180 / Math.PI : 30;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(size).observe(el); size();

  // Draw only while the globe is on screen (checked every frame; an IntersectionObserver sometimes missed the way back in
  // after a fast scroll and left him blank). The browser stops the loop by itself while the tab is hidden.
  function loop(now) {
    requestAnimationFrame(loop);
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || !r.width) return;
    brain.update(now); renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
  return brain;
}
