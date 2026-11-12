import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const P = {
  bg: 0xebe7df, paper: 0xf4f1ec, n200: 0xe6e2da, n300: 0xd6d1c7, n400: 0xb9b4aa, n500: 0x9a958c, n600: 0x6f6b64, n700: 0x55524c, n800: 0x3a3834, ink: 0x151816,
  a100: 0xe9eef0, a200: 0xcfdbe2, a300: 0xa9bfcc, a400: 0x8aa3b3, a500: 0x6f8a9c, accent: 0xd4ec5c, a700: 0x3f5563, a800: 0x2a3a44, a900: 0x141917,
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const BOX = new THREE.BoxGeometry(1, 1, 1);
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return ((s >>> 0) % 100000) / 100000; }; }
export function hashStr(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.85, metalness: o.m ?? 0, transparent: !!o.op, opacity: o.op ?? 1, flatShading: !!o.flat });

function addLights(scene, size = 60) {
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd4d4d7, 1.7); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2.1);
  sun.position.set(size * 0.6, size, size * 0.5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const c = sun.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 1; c.far = size * 5;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun); scene.add(sun.target);
  return { hemi, sun };
}
function makeGrid(size, step, color, opacity, y = 0) {
  const pts = [], h = size / 2;
  for (let v = -h; v <= h + 1e-6; v += step) pts.push(-h, y, v, h, y, v, v, y, -h, v, y, h);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
}
function boxSegs(segs, w, h, d, x, y, z) {
  const x0 = x - w / 2, x1 = x + w / 2, y0 = y, y1 = y + h, z0 = z - d / 2, z1 = z + d / 2;
  const L = (a, b, c, e, f, g) => segs.push([a, b, c, e, f, g]);
  L(x0, y0, z0, x1, y0, z0); L(x1, y0, z0, x1, y0, z1); L(x1, y0, z1, x0, y0, z1); L(x0, y0, z1, x0, y0, z0);
  L(x0, y1, z0, x1, y1, z0); L(x1, y1, z0, x1, y1, z1); L(x1, y1, z1, x0, y1, z1); L(x0, y1, z1, x0, y1, z0);
  L(x0, y0, z0, x0, y1, z0); L(x1, y0, z0, x1, y1, z0); L(x1, y0, z1, x1, y1, z1); L(x0, y0, z1, x0, y1, z1);
}
function segGeo(segs) { const a = new Float32Array(segs.length * 6); segs.forEach((s, i) => a.set(s, i * 6)); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3)); return g; }
function mesh(parent, w, h, d, x, y, z, mat, shadow = true) {
  const m = new THREE.Mesh(BOX, mat); m.scale.set(w, h, d); m.position.set(x, y + h / 2, z);
  m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
}

class Viewer {
  constructor(el, { shadows = true } = {}) {
    this.el = el;
    const r = this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.shadowMap.enabled = shadows; r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.outputColorSpace = THREE.SRGBColorSpace; r.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene(); this.camera = new THREE.PerspectiveCamera(40, 1, 0.1, 3000);
    const c = r.domElement; c.style.cssText = 'display:block;width:100%;height:100%;outline:none;position:absolute;inset:0';
    el.appendChild(c);
    this.overlay = document.createElement('div'); this.overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden'; el.appendChild(this.overlay);
    this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(el); this.resize();
    this.visible = true; this.io = new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; }); this.io.observe(el);
    this.clock = new THREE.Clock(); this.tick = this.tick.bind(this); this.raf = requestAnimationFrame(this.tick);
  }
  resize() { const w = this.el.clientWidth || 1, h = this.el.clientHeight || 1; this.w = w; this.h = h; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }
  tick() { this.raf = requestAnimationFrame(this.tick); const dt = Math.min(this.clock.getDelta(), 0.05); if (!this.visible || document.hidden) return; this.update && this.update(dt); this.renderer.render(this.scene, this.camera); this.after && this.after(); }
  project(v) { const p = v.clone().project(this.camera); return { x: (p.x + 1) / 2 * this.w, y: (1 - p.y) / 2 * this.h, ok: p.z < 1 && p.z > -1 }; }
  local(e) { const r = this.renderer.domElement.getBoundingClientRect(); return { nx: ((e.clientX - r.left) / r.width) * 2 - 1, ny: -((e.clientY - r.top) / r.height) * 2 + 1, x: (e.clientX - r.left) / r.width * this.w, y: (e.clientY - r.top) / r.height * this.h }; }
  dispose() {
    cancelAnimationFrame(this.raf); this.ro.disconnect(); this.io.disconnect(); this.orbit && this.orbit.dispose();
    this.scene.traverse(o => { if (o.geometry && o.geometry !== BOX) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
    this.renderer.dispose(); try { this.renderer.forceContextLoss(); } catch (e) { } this.el.innerHTML = '';
  }
}

class Orbit {
  constructor(v, o = {}) {
    this.v = v; this.el = v.renderer.domElement;
    this.goal = { theta: o.theta ?? 0.6, phi: o.phi ?? 1, radius: o.radius ?? 50, target: (o.target || new THREE.Vector3()).clone() };
    this.cur = { ...this.goal, target: this.goal.target.clone() };
    this.minR = o.minR ?? 4; this.maxR = o.maxR ?? 400; this.minPhi = o.minPhi ?? 0.08; this.maxPhi = o.maxPhi ?? 1.45;
    this.wheel = o.wheel || 'ctrl'; this.enabled = true; this.rotate = true; this.auto = 0; this.speed = o.speed ?? 4;
    this.ptrs = new Map(); this.drag = 0; this.onInteract = o.onInteract; this.onWheelHint = o.onWheelHint;
    const el = this.el; el.tabIndex = 0; el.style.touchAction = 'pan-y'; el.style.cursor = 'grab';
    this.h = { pointerdown: e => this.down(e), pointermove: e => this.move(e), pointerup: e => this.up(e), pointercancel: e => this.up(e), wheel: e => this.wheelEv(e), keydown: e => this.key(e) };
    for (const k in this.h) el.addEventListener(k, this.h[k], k === 'wheel' ? { passive: false } : undefined);
  }
  down(e) { if (!this.enabled) return; this.ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); this.drag = 0; try { this.el.setPointerCapture(e.pointerId); } catch (_) { } this.el.style.cursor = 'grabbing'; }
  move(e) {
    const p = this.ptrs.get(e.pointerId); if (!p || !this.enabled) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    if (this.ptrs.size === 2) {
      const a = [...this.ptrs.values()]; const d0 = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      p.x = e.clientX; p.y = e.clientY; const d1 = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (d0 > 0 && d1 > 0) this.goal.radius = clamp(this.goal.radius * d0 / d1, this.minR, this.maxR); this.drag += 10; return;
    }
    p.x = e.clientX; p.y = e.clientY; this.drag += Math.abs(dx) + Math.abs(dy);
    if (this.rotate) { this.goal.theta -= dx * 0.006; this.goal.phi = clamp(this.goal.phi - dy * 0.005, this.minPhi, this.maxPhi); }
    if (this.drag > 6 && this.onInteract) this.onInteract('drag');
  }
  up(e) { this.ptrs.delete(e.pointerId); this.el.style.cursor = 'grab'; }
  wheelEv(e) {
    if (!this.enabled) return;
    if (this.wheel === 'ctrl' && !(e.ctrlKey || e.metaKey)) { this.onWheelHint && this.onWheelHint(); return; }
    e.preventDefault(); this.zoom(1 + Math.sign(e.deltaY) * 0.12); this.onInteract && this.onInteract('zoom');
  }
  key(e) {
    if (!this.enabled) return; const k = e.key; let h = true;
    if (k === 'ArrowLeft') this.goal.theta += 0.15; else if (k === 'ArrowRight') this.goal.theta -= 0.15;
    else if (k === 'ArrowUp') this.goal.phi = clamp(this.goal.phi - 0.1, this.minPhi, this.maxPhi);
    else if (k === 'ArrowDown') this.goal.phi = clamp(this.goal.phi + 0.1, this.minPhi, this.maxPhi);
    else if (k === '+' || k === '=') this.zoom(0.85); else if (k === '-') this.zoom(1.18); else h = false;
    if (h) { e.preventDefault(); this.onInteract && this.onInteract('key'); }
  }
  zoom(f) { this.goal.radius = clamp(this.goal.radius * f, this.minR, this.maxR); }
  set(g) {
    if (g.target) this.goal.target.copy(g.target);
    if (g.radius != null) this.goal.radius = clamp(g.radius, this.minR, this.maxR);
    if (g.phi != null) this.goal.phi = clamp(g.phi, this.minPhi, this.maxPhi);
    if (g.theta != null) {
      if (!isFinite(this.goal.theta)) { window.__thetaBad = this.goal.theta; this.goal.theta = 0; this.cur.theta = 0; }
      const c = this.goal.theta, d = g.theta - c; this.goal.theta = c + (d - Math.round(d / (2 * Math.PI)) * 2 * Math.PI);
    }
  }
  update(dt) {
    if (this.auto && this.ptrs.size === 0) this.goal.theta += dt * this.auto;
    const k = 1 - Math.exp(-dt * this.speed), c = this.cur, g = this.goal;
    c.theta += (g.theta - c.theta) * k; c.phi += (g.phi - c.phi) * k; c.radius += (g.radius - c.radius) * k; c.target.lerp(g.target, k);
    const s = Math.sin(c.phi);
    this.v.camera.position.set(c.target.x + c.radius * s * Math.sin(c.theta), c.target.y + c.radius * Math.cos(c.phi), c.target.z + c.radius * s * Math.cos(c.theta));
    this.v.camera.lookAt(c.target);
  }
  dispose() { for (const k in this.h) this.el.removeEventListener(k, this.h[k]); }
}

/* ───────────────────────── HERO: do traço à realidade ───────────────────────── */
export function createHero(el, cb = {}) {
  const v = new Viewer(el); v.camera.fov = 34; v.camera.updateProjectionMatrix();
  const L = addLights(v.scene, 45);
  const shadowMat = new THREE.ShadowMaterial({ opacity: 0, transparent: true });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), shadowMat); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; v.scene.add(ground);
  const grid = makeGrid(140, 4, P.n500, 0.22); v.scene.add(grid);
  const M = { conc: std(P.paper, { op: 1 }), glass: std(0x9db3c1, { r: 0.12, m: 0.35, op: 1 }), rail: std(P.a200, { r: 0.2, op: 1 }), dark: std(0x7a6a58, { op: 1 }), tree: std(0x93a874, { op: 1, flat: true }) };
  const base = { conc: 1, glass: 0.9, rail: 0.55, dark: 1, tree: 1 };
  const solids = new THREE.Group(); v.scene.add(solids);
  const segs = [];
  const B = (w, h, d, x, y, z, mat, edges = true) => { if (mat) mesh(solids, w, h, d, x, y, z, mat); if (edges) boxSegs(segs, w, h, d, x, y, z); };
  const line = (a, b, c, d, e, f) => segs.push([a, b, c, d, e, f]);
  // site + plinth
  boxSegs(segs, 64, 0, 44, 0, 0, 0);
  for (let i = -32; i <= 32; i += 8) line(i, 0, 25, i, 0, 26.2);
  line(-32, 0, 25.6, 32, 0, 25.6);
  B(34, 0.5, 21, 0, 0, 0, M.conc);
  B(30, 3.6, 17, 0, 0.5, 0, M.glass, false); boxSegs(segs, 30, 3.6, 17, 0, 0.5, 0);
  B(32, 0.35, 19, 0, 4.1, 0, M.conc);
  B(30, 3.3, 17, 0, 4.45, 0, M.glass, false);
  for (let x = -15; x <= 15; x += 2.5) { line(x, 0.5, 8.5, x, 4.1, 8.5); line(x, 4.45, 8.5, x, 7.75, 8.5); }
  B(32, 0.4, 19, 0, 7.75, 0, M.conc);
  // pergola on podium roof
  for (let x = 4; x <= 14; x += 1.25) B(0.15, 0.15, 8, x, 10.6, 3, M.dark);
  [[4, -1], [14, -1], [4, 7], [14, 7]].forEach(([x, z]) => B(0.2, 2.45, 0.2, x, 8.15, z, M.dark));
  const tower = (cx, cz, w, d, floors, y0, balc) => {
    for (let f = 0; f < floors; f++) {
      const yb = y0 + f * 3;
      B(w + 1, 0.3, d + 1, cx, yb, cz, M.conc);
      B(w - 0.6, 2.7, d - 0.6, cx, yb + 0.3, cz, M.glass, false);
      const n = Math.round(w / 1.35);
      for (let k = 1; k < n; k++) { const x = cx - w / 2 + k * w / n; line(x, yb + 0.3, cz + d / 2 - 0.3, x, yb + 3, cz + d / 2 - 0.3); line(x, yb + 0.3, cz - d / 2 + 0.3, x, yb + 3, cz - d / 2 + 0.3); }
      if (balc) for (let b = 0; b < balc; b++) {
        const bx = cx - w / 2 + (b + 0.5) * w / balc, bw = w / balc - 1.2, off = (f % 2) * 0.6;
        B(bw, 0.15, 1.6, bx + off - 0.3, yb + 0.15, cz + d / 2 + 0.8, M.conc);
        B(bw, 1.0, 0.06, bx + off - 0.3, yb + 0.3, cz + d / 2 + 1.57, M.rail);
      }
    }
    const top = y0 + floors * 3;
    B(w + 1, 0.6, d + 1, cx, top, cz, M.conc);
    B(w * 0.36, 3, d * 0.4, cx - w * 0.2, top + 0.6, cz - d * 0.15, M.conc);
    return top;
  };
  tower(-6, -1, 16, 12, 12, 8.15, 3);
  tower(10.5, 1, 10, 10, 7, 8.15, 2);
  // trees (solids only)
  const r = rng(7);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2, R = 21 + r() * 6; const x = Math.cos(a) * R * 1.25, z = Math.sin(a) * R * 0.9;
    mesh(solids, 0.3, 2.2, 0.3, x, 0, z, M.dark);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6 + r() * 0.8, 1), M.tree); c.position.set(x, 3.4, z); c.castShadow = true; solids.add(c);
  }
  segs.sort((a, b) => (Math.min(a[1], a[4]) - Math.min(b[1], b[4])) || (a[0] - b[0]));
  const lines = new THREE.LineSegments(segGeo(segs), new THREE.LineBasicMaterial({ color: P.ink, transparent: true, opacity: 0.95 }));
  v.scene.add(lines);
  const pen = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 12), new THREE.MeshBasicMaterial({ color: 0xb9d23f })); v.scene.add(pen);
  const orbit = { theta: 0.75, phi: 1.18, radius: 92, target: new THREE.Vector3(1, 13, 0) };
  let t = 0, goal = 0, playing = false, reduce = !!cb.reduceMotion, time = 0, px = 0, py = 0, cpx = 0, cpy = 0, lastSent = -1;
  const onMove = e => { const l = v.local(e); px = l.nx; py = l.ny; };
  el.addEventListener('pointermove', onMove);
  const fit = () => { const a = v.camera.aspect; orbit.radius = a < 0.9 ? 120 : a < 1.2 ? 105 : 92; };
  v.update = dt => {
    time += dt; fit();
    if (playing) { goal = Math.min(1, goal + dt / 4.2); if (goal >= 1) playing = false; }
    t += (goal - t) * (1 - Math.exp(-dt * (reduce ? 30 : 6)));
    const draw = ease(clamp(t / 0.62, 0, 1)), solid = clamp((t - 0.5) / 0.45, 0, 1);
    const n = Math.floor(segs.length * draw); lines.geometry.setDrawRange(0, n * 2);
    lines.material.opacity = 0.95 - solid * 0.62; grid.material.opacity = 0.16 - solid * 0.06;
    if (n > 0 && n < segs.length) { const s = segs[n - 1]; pen.position.set(s[3], s[4], s[5]); pen.visible = true; } else pen.visible = false;
    for (const k in M) M[k].opacity = base[k] * solid;
    solids.visible = solid > 0.01; shadowMat.opacity = 0.14 * solid;
    cpx += (px - cpx) * 0.05; cpy += (py - cpy) * 0.05;
    const th = orbit.theta + (reduce ? 0 : Math.sin(time * 0.12) * 0.35) + cpx * 0.25, ph = orbit.phi - cpy * 0.08, R = orbit.radius;
    v.camera.position.set(orbit.target.x + R * Math.sin(ph) * Math.sin(th), orbit.target.y + R * Math.cos(ph), orbit.target.z + R * Math.sin(ph) * Math.cos(th));
    v.camera.lookAt(orbit.target);
    const rounded = Math.round(t * 100); if (rounded !== lastSent) { lastSent = rounded; cb.onProgress && cb.onProgress(rounded); }
  };
  return {
    play() { if (reduce) { goal = 1; return; } goal = 0; t = 0; playing = true; },
    setProgress(p) { playing = false; goal = clamp(p, 0, 1); },
    setReduce(b) { reduce = b; },
    dispose() { el.removeEventListener('pointermove', onMove); v.dispose(); },
  };
}

/* ───────────────────────── SITE: empreendimento interativo ───────────────────────── */
const FH = 3, TERREO = 4.2;
function towerLayout(emp) { const n = emp.towers.length; return emp.towers.map((t, i) => ({ ...t, x: (i - (n - 1) / 2) * 30, z: -9, w: t.cols * 4.4, d: 11 })); }
function unitXform(t, u) {
  const cols = t.cols, uw = t.w / cols, front = u.pos < cols, xi = front ? u.pos : (2 * cols - 1 - u.pos), side = front ? 1 : -1;
  const x = t.x - t.w / 2 + uw * (xi + 0.5), yb = TERREO + (u.floor - 1) * FH;
  return { pos: new THREE.Vector3(x, yb + 0.3 + 1.35, t.z + side * t.d / 4), scale: new THREE.Vector3(uw - 0.3, 2.7, t.d / 2 - 0.3), side, uw };
}
const AMEN = {
  piscina: 'Piscina', quadra: 'Quadra', playground: 'Playground', churrasqueira: 'Espaço gourmet', salao: 'Salão de festas', pet: 'Pet place', fitness: 'Academia', bike: 'Bicicletário',
};
function buildSite(emp, units, scene) {
  const root = new THREE.Group(); scene.add(root);
  const T = towerLayout(emp), n = T.length, W = Math.max(64, n * 30 + 26), D = 60;
  const maxFloors = Math.max(...T.map(t => t.floors)), maxH = TERREO + maxFloors * FH + 3.5;
  const M = {
    ground: std(P.bg, { r: 1 }), lot: std(0xd9dfc6, { r: 1 }), conc: std(P.paper), wall: std(P.n300), street: std(0x8c8882, { r: 1 }),
    path: std(0xeeeae2, { r: 1 }), glass: std(0x9db3c1, { r: 0.15, m: 0.3, op: 0.8 }), rail: std(P.a300, { r: 0.2, op: 0.45 }), water: std(0x8cc3d2, { r: 0.08, m: 0.15 }),
    tree: std(0x93a874, { flat: true }), trunk: std(0x7a6a58), dark: std(P.n500), soft: std(0xe4d9c4), court: std(0xb7c19f, { r: 1 }), ctx: std(0xe3dfd7, { r: 1 }),
    unitDay: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25, metalness: 0.15 }), unitNight: new THREE.MeshBasicMaterial({ color: 0xffffff }),
  };
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), M.ground); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
  const grid = makeGrid(W + 120, 5, P.n500, 0.0, 0.02); grid.visible = false; root.add(grid); scene.fog = new THREE.Fog(0xe4e1d9, 260, 620);
  mesh(root, W + 200, 0.05, 12, 0, 0, D / 2 + 7, M.street, false);
  for (let x = -W / 2 - 90; x < W / 2 + 90; x += 7) mesh(root, 3, 0.02, 0.25, x, 0.05, D / 2 + 7, M.conc, false);
  mesh(root, W, 0.12, D, 0, 0, 0, M.lot, false);
  const wallH = 0.9;
  mesh(root, W, wallH, 0.25, 0, 0.12, -D / 2, M.wall); mesh(root, 0.25, wallH, D, -W / 2, 0.12, 0, M.wall); mesh(root, 0.25, wallH, D, W / 2, 0.12, 0, M.wall);
  mesh(root, W / 2 - 4, wallH, 0.25, -W / 4 - 2, 0.12, D / 2, M.wall); mesh(root, W / 2 - 4, wallH, 0.25, W / 4 + 2, 0.12, D / 2, M.wall);
  mesh(root, 3, 3, 3, -6.5, 0.12, D / 2 - 2, M.conc); // portaria
  mesh(root, 4, 0.03, D / 2 + 9, 0, 0.12, D / 4 - 4.5, M.path, false);
  mesh(root, W - 10, 0.03, 3, 0, 0.12, 2.5, M.path, false);
  // context (traço only)
  const ctx = [], r = rng(hashStr(emp.id));
  for (let i = 0; i < 14; i++) {
    const side = i % 3; const w = 10 + r() * 14, d = 10 + r() * 12, h = 6 + r() * 30;
    let x, z; if (side === 0) { x = -W / 2 - 40 + i * 14; z = D / 2 + 26 + r() * 8; } else if (side === 1) { x = -W / 2 - 18 - r() * 10; z = -D / 2 + (i % 5) * 16; } else { x = W / 2 + 18 + r() * 10; z = -D / 2 + (i % 5) * 16; }
    mesh(root, w, h, d, x, 0, z, M.ctx);
  }
  // towers
  const recs = { units: [], slabs: [], balc: [], rails: [], fins: [] }, extras = [], occupied = [];
  T.forEach((t, ti) => {
    occupied.push([t.x - t.w / 2 - 3, t.z - t.d / 2 - 3, t.x + t.w / 2 + 3, t.z + t.d / 2 + 3]);
    const lob = mesh(root, t.w - 1.5, TERREO - 0.2, t.d - 1.5, t.x, 0.12, t.z, M.glass); extras.push({ obj: lob, floor: 0, base: lob.scale.clone() });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz]) => { const c = mesh(root, 0.5, TERREO, 0.5, t.x + sx * (t.w / 2 - 0.3), 0.12, t.z + sz * (t.d / 2 - 0.3), M.conc); extras.push({ obj: c, floor: 0, base: c.scale.clone() }); });
    for (let f = 1; f <= t.floors + 1; f++) {
      const yb = TERREO + (f - 1) * FH;
      recs.slabs.push({ pos: new THREE.Vector3(t.x, yb + 0.15, t.z), scale: new THREE.Vector3(t.w + 0.7, f > t.floors ? 0.6 : 0.3, t.d + 0.7), floor: f });
      if (f > t.floors) continue;
      const uw = t.w / t.cols;
      for (let k = 0; k <= t.cols; k++) for (const s of [1, -1]) recs.fins.push({ pos: new THREE.Vector3(t.x - t.w / 2 + k * uw, yb + 0.3 + 1.35, t.z + s * (t.d / 2 - 0.05)), scale: new THREE.Vector3(0.28, 2.7, 0.35), floor: f });
      for (let k = 0; k < t.cols; k++) for (const s of [1, -1]) {
        const bx = t.x - t.w / 2 + (k + 0.5) * uw, bw = uw * 0.62;
        recs.balc.push({ pos: new THREE.Vector3(bx, yb + 0.22, t.z + s * (t.d / 2 + 0.7)), scale: new THREE.Vector3(bw, 0.15, 1.4), floor: f });
        recs.rails.push({ pos: new THREE.Vector3(bx, yb + 0.8, t.z + s * (t.d / 2 + 1.38)), scale: new THREE.Vector3(bw, 1.0, 0.05), floor: f });
      }
    }
    const top = TERREO + t.floors * FH + 0.6;
    const mr = mesh(root, t.w * 0.35, 2.6, t.d * 0.45, t.x - t.w * 0.18, top, t.z - 1, M.conc); extras.push({ obj: mr, floor: t.floors + 2, base: mr.scale.clone() });
  });
  units.forEach(u => { const t = T[u.towerIdx]; const x = unitXform(t, u); recs.units.push({ pos: x.pos, scale: x.scale, floor: u.floor, side: x.side }); });
  const mkIM = (list, mat, shadow = true) => { const im = new THREE.InstancedMesh(BOX, mat, Math.max(1, list.length)); im.count = list.length; im.castShadow = shadow; im.receiveShadow = true; im.frustumCulled = false; root.add(im); return im; };
  const ims = { slabs: mkIM(recs.slabs, M.conc), fins: mkIM(recs.fins, M.conc), balc: mkIM(recs.balc, M.conc), rails: mkIM(recs.rails, M.rail, false), units: mkIM(recs.units, M.unitDay) };
  const c0 = new THREE.Color(P.a500); recs.units.forEach((_, i) => ims.units.setColorAt(i, c0));
  // amenities
  const hotspots = [], keys = (emp.lazer || []).filter(k => AMEN[k]).slice(0, 6), sx = W / 64;
  const slots = [[-17, 11], [1, 13], [19, 11], [-17, 23], [3, 23], [19, 23]];
  const amen = new THREE.Group(); root.add(amen);
  keys.forEach((k, i) => {
    const [x0, z0] = slots[i]; const x = x0 * sx, z = z0; const g = new THREE.Group(); g.position.set(x, 0.12, z); amen.add(g);
    let hw = 5, hd = 3.5;
    if (k === 'piscina') { mesh(g, 13, 0.25, 7.5, 0, 0, 0, M.conc); mesh(g, 10, 0.06, 4.6, -0.8, 0.22, 0, M.water, false); mesh(g, 2.4, 0.06, 2.4, 5, 0.22, 1.5, M.water, false); for (let j = 0; j < 4; j++) mesh(g, 0.7, 0.35, 1.8, -4.5 + j * 2.2, 0.25, -3.1, M.dark); hw = 6.5; hd = 3.8; }
    else if (k === 'quadra') { mesh(g, 13, 0.08, 7.5, 0, 0, 0, M.court, false); const ls = []; boxSegs(ls, 11.5, 0, 6.2, 0, 0.1, 0); ls.push([0, 0.1, -3.1, 0, 0.1, 3.1]); const lm = new THREE.LineSegments(segGeo(ls), new THREE.LineBasicMaterial({ color: 0xffffff })); g.add(lm); [[-6.4, -3.6], [6.4, -3.6], [-6.4, 3.6], [6.4, 3.6]].forEach(([a, b]) => mesh(g, 0.12, 3, 0.12, a, 0, b, M.dark)); hw = 6.5; hd = 3.8; }
    else if (k === 'playground') { mesh(g, 9, 0.08, 6.5, 0, 0, 0, M.soft, false); mesh(g, 1.6, 1.6, 1.6, -2, 0.08, -1, M.conc); const sl = mesh(g, 0.9, 0.12, 3, -2, 0.9, 1.2, M.dark); sl.rotation.x = 0.55; [-1, 1].forEach(s => { const a = mesh(g, 0.1, 2.4, 0.1, 2.5 + s * 1.1, 0.08, -1.5, M.dark); }); mesh(g, 2.4, 0.1, 0.1, 2.5, 2.4, -1.5, M.dark); const sb = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.3, 24), M.conc); sb.position.set(2.4, 0.2, 1.6); sb.castShadow = true; g.add(sb); hw = 4.5; hd = 3.3; }
    else if (k === 'pet') { mesh(g, 8, 0.06, 6, 0, 0, 0, M.soft, false); [[0, -3, 8, 0.1], [0, 3, 8, 0.1], [-4, 0, 0.1, 6], [4, 0, 0.1, 6]].forEach(([a, b, w, d]) => mesh(g, w, 0.8, d, a, 0, b, M.dark)); for (let j = 0; j < 3; j++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.6, 12), M.conc); c.position.set(-2 + j * 2, 0.3, 0); c.castShadow = true; g.add(c); } hw = 4; hd = 3; }
    else if (k === 'bike') { mesh(g, 8, 0.06, 3, 0, 0, 0, M.path, false); for (let j = 0; j < 8; j++) mesh(g, 0.06, 0.8, 1.2, -3.5 + j, 0, 0, M.dark); mesh(g, 8.6, 0.12, 3.4, 0, 2.6, 0, M.conc); [[-4.1, -1.5], [4.1, -1.5], [-4.1, 1.5], [4.1, 1.5]].forEach(([a, b]) => mesh(g, 0.15, 2.6, 0.15, a, 0, b, M.dark)); hw = 4.3; hd = 1.7; }
    else { mesh(g, 10, 0.2, 7.5, 0, 0, 0, M.conc); [[-4.6, -3.4], [4.6, -3.4], [-4.6, 3.4], [4.6, 3.4]].forEach(([a, b]) => mesh(g, 0.3, 3.2, 0.3, a, 0.2, b, M.conc)); mesh(g, 11, 0.35, 8.4, 0, 3.4, 0, M.conc); if (k === 'salao' || k === 'fitness') mesh(g, 8.8, 3.1, 6.4, 0, 0.2, 0, M.glass); if (k === 'churrasqueira') { mesh(g, 3.2, 1, 0.8, -2, 0.2, -2.8, M.dark); mesh(g, 0.8, 2.4, 0.7, -3.2, 1.2, -2.8, M.conc); mesh(g, 2.6, 0.8, 1.2, 1.5, 0.2, 0.5, M.dark); } if (k === 'fitness') for (let j = 0; j < 4; j++) mesh(g, 0.7, 1.1, 1.6, -3 + j * 2, 0.2, 0, M.dark); hw = 5.5; hd = 4.2; }
    occupied.push([x - hw - 1, z - hd - 1, x + hw + 1, z + hd + 1]);
    hotspots.push({ key: k, label: AMEN[k], pos: new THREE.Vector3(x, 4.5, z) });
  });
  // trees
  const tp = [];
  for (let i = 0; i < 260 && tp.length < 46; i++) {
    const x = (r() - 0.5) * (W - 5), z = (r() - 0.5) * (D - 5);
    if (occupied.some(o => x > o[0] && x < o[2] && z > o[1] && z < o[3])) continue;
    if (Math.abs(x) < 3.5 && z > 0) continue; if (Math.abs(z - 2.5) < 2.5) continue;
    if (tp.some(p => Math.hypot(p[0] - x, p[1] - z) < 3.6)) continue; tp.push([x, z, 0.8 + r() * 0.6]);
  }
  const trunks = new THREE.InstancedMesh(BOX, M.trunk, tp.length), crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), M.tree, tp.length);
  const mm = new THREE.Matrix4(), q = new THREE.Quaternion();
  tp.forEach(([x, z, s], i) => { trunks.setMatrixAt(i, mm.compose(new THREE.Vector3(x, 1.2 * s, z), q, new THREE.Vector3(0.25, 2.4 * s, 0.25))); crowns.setMatrixAt(i, mm.compose(new THREE.Vector3(x, 3.1 * s, z), q, new THREE.Vector3(1.7 * s, 1.9 * s, 1.7 * s))); });
  trunks.castShadow = crowns.castShadow = true; root.add(trunks); root.add(crowns);
  return { root, T, W, D, maxH, maxFloors, recs, ims, extras, hotspots, M, grid };
}
function applyIMs(S, factor) {
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
  for (const k in S.recs) {
    const im = S.ims[k]; S.recs[k].forEach((r, i) => { const f = factor(r.floor); sc.copy(r.scale).multiplyScalar(Math.max(f, 1e-4)); im.setMatrixAt(i, m.compose(r.pos, q, sc)); });
    im.instanceMatrix.needsUpdate = true; im.boundingSphere = null;
  }
  S.extras.forEach(e => { const f = factor(e.floor); e.obj.scale.copy(e.base).multiplyScalar(Math.max(f, 1e-4)); });
}
function siteFactor(S, build, cut) {
  return floor => { const g = ease(clamp(build * (S.maxFloors + 4) - floor, 0, 1)); return (cut != null && floor > cut && floor > 0) ? 0 : g; };
}

export function createSite(el, emp, units, cb = {}) {
  const v = new Viewer(el); v.camera.fov = 38; v.camera.updateProjectionMatrix();
  const L = addLights(v.scene, 95);
  const S = buildSite(emp, units, v.scene);
  const overview = () => ({ target: new THREE.Vector3(0, S.maxH * 0.38, -3), radius: Math.max(S.W * 1.35, S.maxH * 2.9) * (v.camera.aspect < 1 ? 1.45 : v.camera.aspect < 1.3 ? 1.15 : 1), theta: 0.55, phi: 1.06 });
  const orbit = v.orbit = new Orbit(v, { ...overview(), minR: 12, maxR: 420, maxPhi: 1.42, onInteract: k => { stopTour(); cb.onInteract && cb.onInteract(k); }, onWheelHint: cb.onWheelHint });
  let build = cb.reduceMotion ? 1 : 0, cut = null, night = false, hover = -1, sel = -1, match = () => true, tour = null, dirty = true;
  const C = { disp: new THREE.Color(P.accent), res: new THREE.Color(P.n400), sold: new THREE.Color(0x46525a), ghost: new THREE.Color(P.n200), hover: new THREE.Color(0xf1f9c4), sel: new THREE.Color(P.ink), nDisp: new THREE.Color(P.accent), nRes: new THREE.Color(P.n700), nSold: new THREE.Color(P.n800), nGhost: new THREE.Color(0x2b2b2d) };
  const recolor = () => {
    units.forEach((u, i) => {
      let c; if (i === sel) c = night ? C.hover : C.sel; else if (i === hover) c = C.hover; else if (!match(u)) c = night ? C.nGhost : C.ghost;
      else c = u.status === 'disponivel' ? (night ? C.nDisp : C.disp) : u.status === 'reservado' ? (night ? C.nRes : C.res) : (night ? C.nSold : C.sold);
      S.ims.units.setColorAt(i, c);
    });
    if (S.ims.units.instanceColor) S.ims.units.instanceColor.needsUpdate = true;
  };
  recolor();
  // selection outline + beacon
  const outline = new THREE.LineSegments(new THREE.EdgesGeometry(BOX), new THREE.LineBasicMaterial({ color: P.ink })); outline.visible = false; v.scene.add(outline);
  const beaconG = segGeo([[0, 0, 0, 0, 7, 0]]); const beacon = new THREE.LineSegments(beaconG, new THREE.LineBasicMaterial({ color: P.a800 })); beacon.visible = false; v.scene.add(beacon);
  const tag = document.createElement('div'); tag.style.cssText = 'position:absolute;left:0;top:0;padding:7px 13px;border-radius:999px;background:#151816;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.18);font:600 13px/1.2 Urbanist,sans-serif;letter-spacing:.04em;white-space:nowrap;display:none;transform:translate(-50%,-100%)'; v.overlay.appendChild(tag);
  // hotspots
  const hsEls = S.hotspots.map(h => {
    const b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Ir até ' + h.label);
    b.innerHTML = '<span style="width:10px;height:10px;border-radius:50%;background:#d4ec5c;box-shadow:0 0 0 3px rgba(212,236,92,.35);flex:none"></span>' + h.label;
    b.style.cssText = 'position:absolute;left:0;top:0;pointer-events:auto;display:flex;align-items:center;gap:6px;padding:7px 13px;border-radius:999px;box-shadow:0 6px 18px rgba(0,0,0,.10);font:600 13px/1.2 Manrope,sans-serif;color:#151816;background:color-mix(in srgb,#ffffff 92%,transparent);border:1px solid rgba(21,24,22,.14);cursor:pointer;white-space:nowrap';
    b.onmouseenter = () => b.style.borderColor = '#151816'; b.onmouseleave = () => b.style.borderColor = 'rgba(21,24,22,.14)';
    b.onclick = () => { stopTour(); api.focusHotspot(h.key); cb.onHotspot && cb.onHotspot(h.key, h.label); };
    v.overlay.appendChild(b); return b;
  });
  let cutEls = [];
  const makeCutLabels = () => {
    cutEls.forEach(e => e.el.remove()); cutEls = [];
    if (cut == null) return;
    units.forEach((u, i) => {
      if (u.floor !== cut) return;
      const b = document.createElement('button'); b.type = 'button'; b.textContent = u.num;
      const ok = u.status === 'disponivel';
      b.setAttribute('aria-label', `Apartamento ${u.num}, torre ${u.tower}, ${ok ? 'disponível' : u.status}`);
      b.style.cssText = `position:absolute;left:0;top:0;pointer-events:auto;padding:4px 9px;border-radius:999px;font:700 12px/1.1 Urbanist,sans-serif;cursor:pointer;border:1px solid ${ok ? '#b9d23f' : 'rgba(21,24,22,.14)'};background:${ok ? '#d4ec5c' : '#ece9e2'};color:${ok ? '#151816' : '#55524c'}`;
      b.onclick = () => { api.select(u.id); cb.onSelect && cb.onSelect(u); };
      v.overlay.appendChild(b); cutEls.push({ el: b, pos: S.recs.units[i].pos.clone().add(new THREE.Vector3(0, 1.9, 0)) });
    });
  };
  // picking
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let downAt = null;
  const pick = e => { const l = v.local(e); ndc.set(l.nx, l.ny); ray.setFromCamera(ndc, v.camera); const hit = ray.intersectObject(S.ims.units, false)[0]; return { i: hit ? hit.instanceId : -1, l }; };
  const cv = v.renderer.domElement;
  cv.setAttribute('role', 'application'); cv.setAttribute('aria-label', `Maquete 3D do ${emp.name}. Arraste ou use as setas para girar, + e − para aproximar. Clique em uma unidade para ver detalhes.`);
  const onMove = e => {
    if (orbit.ptrs.size) return; const { i, l } = pick(e);
    if (i !== hover) { hover = i; recolor(); cv.style.cursor = i >= 0 ? 'pointer' : 'grab'; }
    cb.onHover && cb.onHover(i >= 0 ? units[i] : null, l.x, l.y);
  };
  const onDown = e => { downAt = { x: e.clientX, y: e.clientY }; };
  const onUp = e => {
    if (!downAt) return; const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y); downAt = null; if (moved > 6) return;
    const { i } = pick(e); if (i >= 0) { stopTour(); api.select(units[i].id); cb.onSelect && cb.onSelect(units[i]); }
  };
  const onLeave = () => { if (hover !== -1) { hover = -1; recolor(); } cb.onHover && cb.onHover(null); };
  cv.addEventListener('pointermove', onMove); cv.addEventListener('pointerdown', onDown); cv.addEventListener('pointerup', onUp); cv.addEventListener('pointerleave', onLeave);
  const stopTour = () => { if (tour) { tour = null; orbit.auto = 0; cb.onTour && cb.onTour(null); } };
  const tourSteps = () => {
    const o = overview(); const top = new THREE.Vector3(S.T[0].x, S.maxH - 2, S.T[0].z);
    return [{ label: 'Visão geral do empreendimento', g: o, auto: 0.1 },
    ...S.hotspots.map((h, i) => ({ label: h.label, g: { target: h.pos.clone().setY(1), radius: 26, phi: 1.0, theta: 0.4 + i * 0.7 }, auto: 0.06 })),
    { label: 'Fachada e varandas', g: { target: new THREE.Vector3(S.T[0].x, S.maxH * 0.45, S.T[0].z + 4), radius: 46, phi: 1.3, theta: 0.15 }, auto: 0.04 },
    { label: 'Vista do alto', g: { target: top, radius: 60, phi: 0.5, theta: 2.4 }, auto: 0.08 }];
  };
  const nextTour = () => { tour.i = (tour.i + 1) % tour.steps.length; tour.t = 0; const s = tour.steps[tour.i]; orbit.speed = 1.6; orbit.set(s.g); orbit.auto = s.auto; cb.onTour && cb.onTour(s.label, tour.i, tour.steps.length); };
  v.update = dt => {
    if (build < 1) { build = Math.min(1, build + dt / 2.6); dirty = true; }
    if (dirty) { applyIMs(S, siteFactor(S, build, cut)); dirty = false; }
    if (tour) { tour.t += dt; if (tour.t > 5.5) nextTour(); } else orbit.speed = 4;
    orbit.update(dt);
  };
  v.after = () => {
    S.hotspots.forEach((h, i) => { const p = v.project(h.pos); const el2 = hsEls[i]; el2.style.display = p.ok ? 'flex' : 'none'; el2.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%)`; });
    cutEls.forEach(c => { const p = v.project(c.pos); c.el.style.display = p.ok ? 'block' : 'none'; c.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%)`; });
    if (sel >= 0) { const r = S.recs.units[sel]; const p = v.project(r.pos.clone().add(new THREE.Vector3(0, 8.6, 0))); tag.style.display = p.ok ? 'block' : 'none'; tag.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-100%)`; }
  };
  const api = {
    select(id, fly = true) {
      sel = units.findIndex(u => u.id === id); recolor();
      if (sel < 0) { outline.visible = beacon.visible = false; tag.style.display = 'none'; return; }
      const r = S.recs.units[sel], u = units[sel];
      outline.position.copy(r.pos); outline.scale.copy(r.scale).addScalar(0.12); outline.visible = true;
      beacon.position.copy(r.pos).add(new THREE.Vector3(0, 1.4, 0)); beacon.visible = true;
      tag.textContent = `Torre ${u.tower} · ${u.num}`; tag.style.display = 'block';
      if (fly) orbit.set({ target: r.pos.clone(), radius: 34, phi: 1.2, theta: r.side > 0 ? 0.35 : Math.PI + 0.35 });
    },
    setFilter(fn) { match = fn || (() => true); recolor(); },
    setCut(f) { cut = f; dirty = true; makeCutLabels(); if (f != null) orbit.set({ target: new THREE.Vector3(0, TERREO + (f - 1) * FH + 1.5, -9), radius: Math.max(S.W * 0.62, 44) * (v.camera.aspect < 1 ? 1.4 : 1), phi: 0.72 }); else orbit.set(overview()); },
    setNight(b) {
      night = b; S.ims.units.material = b ? S.M.unitNight : S.M.unitDay;
      L.hemi.intensity = b ? 0.35 : 1.7; L.sun.intensity = b ? 0.25 : 2.1; v.renderer.setClearColor(b ? P.a900 : 0x000000, b ? 1 : 0);
      S.M.ground.color.set(b ? 0x1f2523 : P.bg); v.scene.fog && v.scene.fog.color.set(b ? 0x141917 : 0xe4e1d9); S.grid.material.color.set(b ? P.a700 : P.accent); recolor();
    },
    zoom(f) { orbit.zoom(f); }, reset() { stopTour(); orbit.set(overview()); },
    tour(on) { if (on) { tour = { steps: tourSteps(), i: -1, t: 0 }; nextTour(); } else stopTour(); },
    focusHotspot(k) { const h = S.hotspots.find(x => x.key === k); if (h) orbit.set({ target: h.pos.clone().setY(1), radius: 24, phi: 0.95 }); },
    setFull(b) { cv.style.touchAction = b ? 'none' : 'pan-y'; orbit.wheel = b ? 'always' : 'ctrl'; },
    setLabels(b) { hsEls.forEach(e => e.style.visibility = b ? 'visible' : 'hidden'); },
    dispose() { cv.removeEventListener('pointermove', onMove); cv.removeEventListener('pointerdown', onDown); cv.removeEventListener('pointerup', onUp); cv.removeEventListener('pointerleave', onLeave); v.dispose(); },
  };
  return api;
}

let thumbR = null;
export function renderThumb(emp, units, w = 640, h = 440) {
  if (!thumbR) { thumbR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); thumbR.shadowMap.enabled = true; thumbR.shadowMap.type = THREE.PCFSoftShadowMap; thumbR.outputColorSpace = THREE.SRGBColorSpace; thumbR.setPixelRatio(1); }
  thumbR.setSize(w, h, false); thumbR.setClearColor(0x000000, 0);
  const scene = new THREE.Scene(); addLights(scene, 95); const S = buildSite(emp, units, scene); applyIMs(S, () => 1);
  const cs = { disponivel: new THREE.Color(0x9fb6c4), reservado: new THREE.Color(0x8aa1b0), vendido: new THREE.Color(0x7d93a2) };
  units.forEach((u, i) => S.ims.units.setColorAt(i, cs[u.status])); if (S.ims.units.instanceColor) S.ims.units.instanceColor.needsUpdate = true;
  const cam = new THREE.PerspectiveCamera(32, w / h, 0.5, 3000);
  const R = Math.max(S.W * 1.3, S.maxH * 2.7), th = 0.62, ph = 1.08, tg = new THREE.Vector3(0, S.maxH * 0.4, -4);
  cam.position.set(tg.x + R * Math.sin(ph) * Math.sin(th), tg.y + R * Math.cos(ph), tg.z + R * Math.sin(ph) * Math.cos(th)); cam.lookAt(tg);
  thumbR.render(scene, cam); const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h; const g2 = cv2.getContext('2d'); const gr = g2.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#b9cbd7'); gr.addColorStop(0.5, '#e2dfd6'); gr.addColorStop(1, '#ebe7df'); g2.fillStyle = gr; g2.fillRect(0, 0, w, h); g2.drawImage(thumbR.domElement, 0, 0, w, h); const url = cv2.toDataURL('image/jpeg', 0.88);
  scene.traverse(o => { if (o.geometry && o.geometry !== BOX) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => m.dispose()); });
  return url;
}

/* ───────────────────────── PLANTA: apartamento em 3D ───────────────────────── */
export function wallSegments(rooms, openings) {
  const lines = { x: new Map(), z: new Map() };
  const add = (axis, c, a, b, room) => { const k = Math.round(c * 100); if (!lines[axis].has(k)) lines[axis].set(k, { c, items: [] }); lines[axis].get(k).items.push({ a, b, room }); };
  rooms.forEach(r => { add('x', r.z, r.x, r.x + r.w, r); add('x', r.z + r.d, r.x, r.x + r.w, r); add('z', r.x, r.z, r.z + r.d, r); add('z', r.x + r.w, r.z, r.z + r.d, r); });
  const out = [];
  for (const axis of ['x', 'z']) for (const { c, items } of lines[axis].values()) {
    const pts = [...new Set(items.flatMap(i => [Math.round(i.a * 100), Math.round(i.b * 100)]))].sort((p, q) => p - q).map(p => p / 100);
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], m = (a + b) / 2, owners = items.filter(it => it.a < m && it.b > m).map(it => it.room);
      if (!owners.length) continue;
      const kind = owners.every(o => o.type === 'varanda') ? 'rail' : (owners.length === 1 || owners.some(o => o.type === 'varanda')) ? 'ext' : 'int';
      const prev = out[out.length - 1];
      if (prev && prev.axis === axis && prev.c === c && Math.abs(prev.b - a) < 1e-6 && prev.kind === kind) prev.b = b; else out.push({ axis, c, a, b, kind });
    }
  }
  const walls = [], ops = [];
  for (const s of out) {
    let parts = [{ a: s.a, b: s.b }];
    for (const o of openings) {
      if (o.axis !== s.axis) continue; const oc = s.axis === 'x' ? o.z : o.x; if (Math.abs(oc - s.c) > 0.02) continue;
      const op = s.axis === 'x' ? o.x : o.z, oa = op - o.w / 2, ob = op + o.w / 2, np = [];
      for (const p of parts) { if (ob <= p.a || oa >= p.b) { np.push(p); continue; } if (oa > p.a) np.push({ a: p.a, b: oa }); if (ob < p.b) np.push({ a: ob, b: p.b }); ops.push({ ...o, seg: s, a: Math.max(oa, p.a), b: Math.min(ob, p.b) }); }
      parts = np;
    }
    parts.forEach(p => { if (p.b - p.a > 0.01) walls.push({ ...s, a: p.a, b: p.b }); });
  }
  return { walls, ops };
}
const FLOOR_COL = { sala: 0xd9c7a9, quarto: 0xd9c7a9, office: 0xd9c7a9, corredor: 0xd9c7a9, hall: 0xd9c7a9, closet: 0xd9c7a9, cozinha: 0xe3e7e8, banho: 0xe3e7e8, servico: 0xe3e7e8, varanda: 0xcbc3b5 };
function furniture(kind, M, o = {}) {
  const g = new THREE.Group(), A = (w, h, d, x, y, z, m) => mesh(g, w, h, d, x, y, z, m);
  const cyl = (r, h, x, y, z, m) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), m); c.position.set(x, y + h / 2, z); c.castShadow = true; g.add(c); return c; };
  switch (kind) {
    case 'sofa': A(2, .42, .85, 0, 0, 0, M.fabric); A(2, .42, .2, 0, .42, -.325, M.fabric); A(.16, .62, .85, -.92, 0, 0, M.fabric); A(.16, .62, .85, .92, 0, 0, M.fabric); A(1.66, .08, .6, 0, .42, .08, M.fabricL); A(2.4, .01, 1.6, 0, 0, .9, M.rug); break;
    case 'coffee': A(.9, .38, .5, 0, 0, 0, M.wood); break;
    case 'tv': A(1.6, .45, .4, 0, 0, 0, M.wood); A(1.3, .75, .05, 0, .75, -.12, M.dark); break;
    case 'dining': A(1.2, .04, .8, 0, .72, 0, M.wood); [[-.55, -.35], [.55, -.35], [-.55, .35], [.55, .35]].forEach(([x, z]) => A(.05, .72, .05, x, 0, z, M.dark)); [[-.3, -.6], [.3, -.6], [-.3, .6], [.3, .6]].forEach(([x, z]) => { A(.42, .45, .42, x, 0, z, M.fabricL); A(.42, .45, .06, x, .45, z + (z < 0 ? -.18 : .18), M.fabricL); }); break;
    case 'bedDouble': A(1.4, .32, 1.95, 0, 0, 0, M.wood); A(1.38, .2, 1.9, 0, .32, .02, M.linen); A(1.42, .05, 1.1, 0, .52, .4, M.fabric); A(1.55, .95, .08, 0, 0, -1, M.wood); A(.55, .12, .35, -.35, .52, -.72, M.linen); A(.55, .12, .35, .35, .52, -.72, M.linen); break;
    case 'bedSingle': A(.9, .32, 1.9, 0, 0, 0, M.wood); A(.88, .2, 1.85, 0, .32, .02, M.linen); A(.92, .05, 1, 0, .52, .4, M.fabric); A(1, .9, .08, 0, 0, -.97, M.wood); A(.55, .12, .32, 0, .52, -.7, M.linen); break;
    case 'nightstand': A(.45, .5, .4, 0, 0, 0, M.wood); break;
    case 'wardrobe': { const w = o.w || 1.6, n = Math.max(2, Math.round(w / .5)); A(w, 2.1, .55, 0, 0, 0, M.paper); for (let i = 1; i < n; i++) A(.012, 2, .01, -w / 2 + i * w / n, .05, .28, M.dark); break; }
    case 'desk': A(1.2, .04, .6, 0, .72, 0, M.wood); A(.04, .72, .56, -.56, 0, 0, M.wood); A(.04, .72, .56, .56, 0, 0, M.wood); A(.45, .45, .45, 0, 0, .5, M.fabric); A(.55, .34, .03, 0, .76, -.2, M.dark); break;
    case 'kitchen': { const l = o.len || 2; A(l, .88, .6, 0, 0, 0, M.paper); A(l, .04, .62, 0, .88, 0, M.dark); A(l, .7, .35, 0, 1.5, -.125, M.paper); A(.5, .02, .4, -l * .2, .92, 0, M.steel); A(.6, .02, .5, l * .25, .92, 0, M.dark); break; }
    case 'fridge': A(.7, 1.8, .7, 0, 0, 0, M.steel); break;
    case 'washer': A(.6, .85, .6, 0, 0, 0, M.paper); cyl(.2, .02, 0, .5, .31, M.dark).rotation.x = Math.PI / 2; break;
    case 'toilet': A(.38, .4, .5, 0, 0, .05, M.ceramic); A(.4, .35, .18, 0, .4, -.22, M.ceramic); break;
    case 'shower': A(.9, .05, .9, 0, 0, 0, M.ceramic); A(.02, 1.9, .9, .44, .05, 0, M.glass); A(.9, 1.9, .02, 0, .05, .44, M.glass); break;
    case 'bistro': cyl(.36, .03, 0, .72, 0, M.wood); cyl(.04, .72, 0, 0, 0, M.dark); A(.42, .45, .42, -.6, 0, 0, M.fabricL); A(.42, .45, .42, .6, 0, 0, M.fabricL); break;
    case 'plant': cyl(.2, .4, 0, 0, 0, M.paper); { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(.38, 1), M.plant); s.position.set(0, .8, 0); s.castShadow = true; g.add(s); } break;
    case 'bbq': A(1.2, .9, .6, 0, 0, 0, M.paper); A(.7, .5, .5, 0, .9, -.05, M.dark); A(.4, 1.1, .35, 0, 1.4, -.1, M.paper); break;
  }
  return g;
}

export function createPlan(el, plan, cb = {}) {
  const v = new Viewer(el); v.camera.fov = 50; v.camera.near = 0.05; v.camera.updateProjectionMatrix();
  const rooms = plan.rooms, x0 = Math.min(...rooms.map(r => r.x)), x1 = Math.max(...rooms.map(r => r.x + r.w)), z0 = Math.min(...rooms.map(r => r.z)), z1 = Math.max(...rooms.map(r => r.z + r.d));
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, spanX = x1 - x0, spanZ = z1 - z0;
  const L = addLights(v.scene, 10); L.sun.target.position.set(cx, 0, cz);
  const amb = new THREE.AmbientLight(0xffffff, 0.5); v.scene.add(amb);
  const M = {
    wall: std(0xfbfbfc), rail: std(P.a300, { r: .2, op: .4 }), glass: std(P.a300, { r: .1, op: .35 }), lintel: std(0xfbfbfc), entry: std(0x3a3834),
    fabric: std(0x5f6f66), fabricL: std(0xd9d3c7), linen: std(0xffffff), wood: std(0xb9986f), dark: std(P.n700), steel: std(P.n400, { r: .4, m: .2 }), ceramic: std(0xffffff, { r: .3 }), paper: std(0xfafafa), rug: std(0xe6dccb), plant: std(0x8fa36e, { flat: true }),
  };
  const shadowG = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.12 })); shadowG.rotation.x = -Math.PI / 2; shadowG.position.y = -0.01; shadowG.receiveShadow = true; v.scene.add(shadowG);
  const grid = makeGrid(40, 0.5, P.n500, 0.14, -0.005); grid.position.set(cx, 0, cz); v.scene.add(grid);
  mesh(v.scene, spanX + 0.5, 0.12, spanZ + 0.5, cx, -0.13, cz, std(P.n300), false);
  const floors = {}, paper = new THREE.Color(0xfafafa);
  rooms.forEach(r => { const mat = std(FLOOR_COL[r.type] || P.n200, { r: .9 }); mat.userData.target = new THREE.Color(FLOOR_COL[r.type] || P.n200); const m = mesh(v.scene, r.w, 0.04, r.d, r.x + r.w / 2, -0.01, r.z + r.d / 2, mat, false); floors[r.id] = m; });
  const ls = []; rooms.forEach(r => boxSegs(ls, r.w, 0, r.d, r.x + r.w / 2, 0.04, r.z + r.d / 2));
  const lines = new THREE.LineSegments(segGeo(ls), new THREE.LineBasicMaterial({ color: P.a700, transparent: true, opacity: 1 })); v.scene.add(lines);
  const { walls, ops } = wallSegments(rooms, plan.openings || []);
  const WG = new THREE.Group(); v.scene.add(WG); const H = 2.7;
  const piece = (s, a, b, y0, h, mat, th) => { const len = b - a, mid = (a + b) / 2; const m = s.axis === 'x' ? mesh(WG, len, h, th, mid, y0, s.c, mat) : mesh(WG, th, h, len, s.c, y0, mid, mat); return m; };
  const thick = s => s.kind === 'ext' ? 0.18 : s.kind === 'rail' ? 0.06 : 0.1;
  walls.forEach(s => piece(s, s.a, s.b, 0, s.kind === 'rail' ? 1.1 : H, s.kind === 'rail' ? M.rail : M.wall, thick(s)));
  const col = walls.map(s => ({ ...s, th: thick(s) }));
  ops.forEach(o => {
    const s = o.seg, th = thick(s);
    if (o.type === 'window') { const sill = o.sill || 1.0; piece(s, o.a, o.b, 0, sill, M.wall, th); piece(s, o.a, o.b, 2.1, H - 2.1, M.lintel, th); piece(s, o.a, o.b, sill, 2.1 - sill, M.glass, 0.03); col.push({ ...s, a: o.a, b: o.b, th }); }
    else { if (s.kind !== 'rail') piece(s, o.a, o.b, 2.15, H - 2.15, M.lintel, th); if (o.type === 'glass') { const l = (o.b - o.a) / 2; piece(s, o.a, o.a + l * 0.95, 0, 2.15, M.glass, 0.03); } if (o.type === 'entry') { const leaf = s.axis === 'x' ? mesh(WG, 0.05, 2.1, o.w - 0.05, o.a + 0.03, 0, s.c + (o.w) / 2, M.entry) : mesh(WG, o.w - 0.05, 2.1, 0.05, s.c + o.w / 2, 0, o.a + 0.03, M.entry); } }
  });
  const FG = []; (plan.furniture || []).forEach(f => { const g = furniture(f.k, M, f); g.position.set(f.x, 0, f.z); g.rotation.y = (f.r || 0) * Math.PI / 180; v.scene.add(g); FG.push(g); });
  // dimension lines
  const dl = [], dz = z0 - 0.9, dx = x0 - 0.9;
  dl.push([x0, 0.05, dz, x1, 0.05, dz], [x0, 0.05, dz - 0.2, x0, 0.05, dz + 0.2], [x1, 0.05, dz - 0.2, x1, 0.05, dz + 0.2]);
  dl.push([dx, 0.05, z0, dx, 0.05, z1], [dx - 0.2, 0.05, z0, dx + 0.2, 0.05, z0], [dx - 0.2, 0.05, z1, dx + 0.2, 0.05, z1]);
  const dims = new THREE.LineSegments(segGeo(dl), new THREE.LineBasicMaterial({ color: P.a700 })); v.scene.add(dims);
  const fmt = n => n.toFixed(2).replace('.', ',') + ' m';
  const mkLabel = (html, css = '') => { const d = document.createElement('div'); d.innerHTML = html; d.style.cssText = 'position:absolute;left:0;top:0;transform:translate(-50%,-50%);text-align:center;pointer-events:none;white-space:nowrap;font:500 12px/1.2 Manrope,sans-serif;color:#151816;' + css; v.overlay.appendChild(d); return d; };
  const roomLabels = rooms.map(r => ({ r, el: mkLabel(`<div style="font:600 13px/1.1 Urbanist,sans-serif;letter-spacing:.02em">${r.name}</div><div style="opacity:.7">${(r.w * r.d).toFixed(1).replace('.', ',')} m²</div>`, 'background:rgba(255,255,255,.9);padding:4px 9px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.06)'), pos: new THREE.Vector3(r.x + r.w / 2, 0.9, r.z + r.d / 2) }));
  const dimLabels = [{ el: mkLabel(fmt(spanX), 'color:#3a3834;font-weight:600;background:#ffffff;padding:1px 4px'), pos: new THREE.Vector3(cx, 0.05, dz) }, { el: mkLabel(fmt(spanZ), 'color:#3a3834;font-weight:600;background:#ffffff;padding:1px 4px'), pos: new THREE.Vector3(dx, 0.05, cz) }];
  const fitR = () => Math.max(spanX / v.camera.aspect, spanZ) / (2 * Math.tan(v.camera.fov * Math.PI / 360)) * 1.35 + 1;
  const orbit = v.orbit = new Orbit(v, { target: new THREE.Vector3(cx, 0, cz), radius: fitR() * 1.15, theta: 0.6, phi: 0.85, minR: 3, maxR: 40, wheel: 'always', onInteract: k => cb.onInteract && cb.onInteract(k) });
  orbit.el.style.touchAction = 'none';
  orbit.el.setAttribute('aria-label', `Planta ${plan.name} em 3D. Arraste para girar, use + e − para zoom.`);
  let t = 0, tGoal = 1, mode = 'maquete', furnished = true, hour = 10, reduce = !!cb.reduceMotion; if (reduce) t = 1;
  const walk = { x: plan.start.x, z: plan.start.z, yaw: plan.start.yaw * Math.PI / 180, pitch: 0, move: {}, room: null, lastSent: 0 };
  const camQ = new THREE.Quaternion(), eul = new THREE.Euler(0, 0, 0, 'YXZ');
  const collide = (x, z) => {
    for (let it = 0; it < 3; it++) for (const s of col) {
      const R = s.th / 2 + 0.22; let px, pz; if (s.axis === 'x') { px = clamp(x, s.a, s.b); pz = s.c; } else { px = s.c; pz = clamp(z, s.a, s.b); }
      const ddx = x - px, ddz = z - pz, d = Math.hypot(ddx, ddz); if (d < R && d > 1e-6) { x = px + ddx / d * R; z = pz + ddz / d * R; }
    }
    return [clamp(x, x0 + 0.2, x1 - 0.2), clamp(z, z0 + 0.2, z1 - 0.2)];
  };
  const roomAt = (x, z) => rooms.find(r => x >= r.x && x <= r.x + r.w && z >= r.z && z <= r.z + r.d);
  const keys = { w: 'f', arrowup: 'f', s: 'b', arrowdown: 'b', a: 'l', d: 'r', arrowleft: 'tl', arrowright: 'tr', q: 'tl', e: 'tr' };
  const kd = e => { if (mode !== 'passeio' || /input|textarea|select/i.test(e.target.tagName)) return; const k = keys[e.key.toLowerCase()]; if (k) { walk.move[k] = true; e.preventDefault(); } };
  const ku = e => { const k = keys[e.key.toLowerCase()]; if (k) walk.move[k] = false; };
  window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
  let look = null; const cv = v.renderer.domElement;
  const ld = e => { if (mode === 'passeio') { look = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (_) { } } };
  const lm = e => { if (mode === 'passeio' && look) { walk.yaw -= (e.clientX - look.x) * 0.005; walk.pitch = clamp(walk.pitch - (e.clientY - look.y) * 0.004, -0.7, 0.6); look = { x: e.clientX, y: e.clientY }; } };
  const lu = () => { look = null; };
  cv.addEventListener('pointerdown', ld); cv.addEventListener('pointermove', lm); cv.addEventListener('pointerup', lu); cv.addEventListener('pointercancel', lu);
  const setHour = h => { hour = h; const a = (h - 6) / 12 * Math.PI, R = 18; L.sun.position.set(cx + Math.cos(a) * R, Math.sin(a) * R * 0.85 + 1.2, cz - R * 0.35); L.sun.intensity = 0.5 + Math.sin(a) * 1.9; L.hemi.intensity = 0.9 + Math.sin(a) * 0.8; };
  setHour(hour);
  const tmp = new THREE.Vector3();
  v.update = dt => {
    t += (tGoal - t) * (1 - Math.exp(-dt * (reduce ? 40 : 2.2)));
    WG.scale.y = Math.max(0.004, t); WG.visible = t > 0.01;
    lines.material.opacity = 1 - 0.75 * clamp(t, 0, 1);
    rooms.forEach(r => floors[r.id].material.color.copy(paper).lerp(floors[r.id].material.userData.target, clamp(t * 1.4, 0, 1)));
    FG.forEach((g, i) => { const k = clamp((t - 0.62 - i * 0.008) / 0.25, 0, 1) * (furnished ? 1 : 0); g.scale.setScalar(Math.max(ease(k), 1e-4)); g.visible = k > 0.01; });
    const top = mode === 'planta'; dims.visible = top; dimLabels.forEach(d => d.el.style.display = top ? 'block' : 'none');
    if (mode === 'passeio') {
      const m = walk.move, f = (m.f ? 1 : 0) - (m.b ? 1 : 0), s = (m.r ? 1 : 0) - (m.l ? 1 : 0), turn = (m.tl ? 1 : 0) - (m.tr ? 1 : 0);
      walk.yaw += turn * dt * 1.7; const sp = 1.5 * dt, fx = -Math.sin(walk.yaw), fz = -Math.cos(walk.yaw), rx = Math.cos(walk.yaw), rz = -Math.sin(walk.yaw);
      if (f || s) { const [nx, nz] = collide(walk.x + (fx * f + rx * s) * sp, walk.z + (fz * f + rz * s) * sp); walk.x = nx; walk.z = nz; if (cb.onInteract) cb.onInteract('walk'); }
      const k = 1 - Math.exp(-dt * 6); v.camera.position.lerp(tmp.set(walk.x, 1.6, walk.z), k);
      eul.set(walk.pitch, walk.yaw, 0); camQ.setFromEuler(eul); v.camera.quaternion.slerp(camQ, k);
      const r = roomAt(walk.x, walk.z); if (r && r.id !== walk.room) { walk.room = r.id; cb.onRoom && cb.onRoom(r); }
      walk.lastSent += dt; if (walk.lastSent > 0.08) { walk.lastSent = 0; cb.onPlayer && cb.onPlayer(walk.x, walk.z, walk.yaw); }
    } else orbit.update(dt);
  };
  v.after = () => {
    const show = mode !== 'passeio';
    roomLabels.forEach(l => { if (!show) { l.el.style.display = 'none'; return; } const p = v.project(l.pos); l.el.style.display = p.ok ? 'block' : 'none'; l.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`; });
    dimLabels.forEach(d => { const p = v.project(d.pos); d.el.style.transform = `translate(${p.x}px,${p.y}px) translate(-50%,-50%)`; });
  };
  const api = {
    setMode(m) {
      mode = m; orbit.enabled = m !== 'passeio'; amb.intensity = m === 'passeio' ? 1.3 : 0.5;
      if (m === 'planta') { orbit.rotate = false; orbit.minPhi = 0.001; orbit.set({ target: new THREE.Vector3(cx, 0, cz), radius: fitR(), phi: 0.001, theta: 0 }); }
      else if (m === 'maquete') { orbit.rotate = true; orbit.minPhi = 0.15; orbit.set({ target: new THREE.Vector3(cx, 0, cz), radius: fitR() * 1.1, phi: 0.85, theta: 0.6 }); orbit.cur.theta = orbit.goal.theta + 0.0001; }
      else { walk.room = null; cv.style.cursor = 'grab'; cv.focus({ preventScroll: true }); }
      if (m !== 'passeio') { const c = orbit.cur; c.target.set(cx, 0, cz); }
    },
    setT(x) { tGoal = clamp(x, 0, 1); }, setHour, setFurnished(b) { furnished = b; }, setReduce(b) { reduce = b; },
    setMove(m) { walk.move = { ...walk.move, ...m }; },
    zoom(f) { if (mode === 'passeio') { walk.move = {}; return; } orbit.zoom(f); },
    focusRoom(id) {
      const r = rooms.find(x => x.id === id); if (!r) return;
      if (mode === 'passeio') { const [nx, nz] = collide(r.x + r.w / 2, r.z + r.d / 2); walk.x = nx; walk.z = nz; }
      else orbit.set({ target: new THREE.Vector3(r.x + r.w / 2, 0, r.z + r.d / 2), radius: Math.max(r.w, r.d) * 1.6 + 2.5, phi: mode === 'planta' ? 0.001 : 0.8 });
    },
    dispose() { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); cv.removeEventListener('pointerdown', ld); cv.removeEventListener('pointermove', lm); cv.removeEventListener('pointerup', lu); v.dispose(); },
  };
  // when entering passeio from orbit, seed camera at current orbit position (smooth fly-in)
  return api;
}
