import type * as ThreeNS from "three";
import { live } from "@/lib/live";

type Three = typeof ThreeNS;

interface Palette {
  fill: string;
  text: string;
  muted: string;
  acc: string;
  accA: string;
  block: string;
  line: string;
  ok: string;
}

const TITLES: [string, string][] = [["01", "API"], ["02", "State"], ["03", "Components"], ["04", "UI"]];
const DESCS = ["dados chegando da API", "estado, cache e filtros", "componentes reutilizáveis", "a interface final"];
export const HERO_HINT_DEFAULT = "Arraste para girar · toque numa camada";

const palette = (dk: boolean): Palette =>
  dk
    ? { fill: "rgba(12,34,61,0.9)", text: "#FFFFFF", muted: "#8FA6BD", acc: "#6CC0EE", accA: "rgba(108,192,238,0.18)", block: "rgba(108,192,238,0.10)", line: "rgba(159,179,200,0.28)", ok: "#3DDC97" }
    : { fill: "rgba(255,255,255,0.94)", text: "#0A3C6E", muted: "#6A7888", acc: "#1783C1", accA: "rgba(23,131,193,0.14)", block: "#EAF1F8", line: "#D3DDE8", ok: "#1A9B5E" };

const mono = (w: number, s: number) => `${w} ${s}px "JetBrains Mono", ui-monospace, monospace`;

export interface HeroScene {
  tick: (t: number) => void;
  restart: () => void;
  dispose: () => void;
}

export function createHeroScene(THREE: Three, mount: HTMLElement, getHint: () => HTMLElement | null): HeroScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  const coarse = matchMedia("(pointer: coarse)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, coarse ? 1.5 : 1.75));
  const cvs = renderer.domElement;
  cvs.style.display = "block";
  cvs.style.cursor = "grab";
  cvs.style.touchAction = "pan-y";
  mount.appendChild(cvs);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 17);

  const LW = 6.4, LH = 4, CW = 1024, CH = 640, RR = 0.3, x0 = -LW / 2, y0 = -LH / 2;
  const shape = new THREE.Shape();
  shape.moveTo(x0 + RR, y0);
  shape.lineTo(x0 + LW - RR, y0);
  shape.quadraticCurveTo(x0 + LW, y0, x0 + LW, y0 + RR);
  shape.lineTo(x0 + LW, y0 + LH - RR);
  shape.quadraticCurveTo(x0 + LW, y0 + LH, x0 + LW - RR, y0 + LH);
  shape.lineTo(x0 + RR, y0 + LH);
  shape.quadraticCurveTo(x0, y0 + LH, x0, y0 + LH - RR);
  shape.lineTo(x0, y0 + RR);
  shape.quadraticCurveTo(x0, y0, x0 + RR, y0);
  const geo = new THREE.ShapeGeometry(shape, 8);
  const uvA = geo.attributes.uv, pA = geo.attributes.position;
  for (let i = 0; i < uvA.count; i++) uvA.setXY(i, (pA.getX(i) - x0) / LW, (pA.getY(i) - y0) / LH);
  const edgeGeo = new THREE.EdgesGeometry(geo);

  const root = new THREE.Group();
  const stack = new THREE.Group();
  root.add(stack);
  scene.add(root);

  const layers = TITLES.map((tt, i) => {
    const cv = document.createElement("canvas");
    cv.width = CW;
    cv.height = CH;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false, opacity: 0 });
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x1783c1, transparent: true, opacity: 0 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x1783c1, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
    const g = new THREE.Group();
    const mesh = new THREE.Mesh(geo, mat);
    const glow = new THREE.Mesh(geo, glowMat);
    const edge = new THREE.LineSegments(edgeGeo, edgeMat);
    glow.scale.setScalar(1.04);
    glow.position.z = -0.02;
    glow.renderOrder = i * 4;
    mesh.renderOrder = i * 4 + 1;
    edge.renderOrder = i * 4 + 2;
    mesh.userData.i = i;
    g.add(glow, mesh, edge);
    stack.add(g);
    return { ctx: cv.getContext("2d")!, tex, mat, edgeMat, glowMat, g, mesh, lift: 0, tt };
  });

  const drawLayer = (L: (typeof layers)[number], i: number, C: Palette) => {
    const c = L.ctx;
    c.clearRect(0, 0, CW, CH);
    c.textAlign = "left";
    c.fillStyle = C.fill;
    c.fillRect(0, 0, CW, CH);
    const rr = (x: number, y: number, w: number, hh: number, r: number, fill?: string | null, stroke?: string | null, lw?: number) => {
      c.beginPath();
      if (c.roundRect) c.roundRect(x, y, w, hh, r);
      else c.rect(x, y, w, hh);
      if (fill) {
        c.fillStyle = fill;
        c.fill();
      }
      if (stroke) {
        c.strokeStyle = stroke;
        c.lineWidth = lw || 3;
        c.stroke();
      }
    };
    c.font = mono(600, 28);
    c.fillStyle = C.acc;
    c.fillText(L.tt[0], 48, 72);
    c.font = "700 40px Archivo, sans-serif";
    c.fillStyle = C.text;
    c.fillText(L.tt[1], 102, 74);
    if (i === 3) {
      rr(48, 116, CW - 96, 52, 14, C.block);
      ["#FF5F57", "#FEBC2E", "#28C840"].forEach((k, j) => {
        c.beginPath();
        c.arc(80 + j * 28, 142, 8, 0, 7);
        c.fillStyle = k;
        c.fill();
      });
      rr(186, 128, 360, 28, 14, C.fill);
      rr(48, 204, 440, 38, 10, C.text);
      rr(48, 258, 300, 18, 8, C.line);
      for (let k = 0; k < 3; k++) {
        rr(48 + k * 314, 310, 290, 130, 16, k === 0 ? C.accA : C.block, k === 0 ? C.acc : null);
        rr(72 + k * 314, 336, 110, 16, 6, C.acc);
        rr(72 + k * 314, 368, 200, 12, 6, C.line);
      }
      rr(48, 468, CW - 96, 124, 16, C.block);
      c.beginPath();
      for (let x = 0; x <= 880; x += 10) {
        const y = 548 - 30 * Math.sin(x / 95) - x * 0.028;
        if (x) c.lineTo(72 + x, y);
        else c.moveTo(72, y);
      }
      c.strokeStyle = C.acc;
      c.lineWidth = 5;
      c.lineCap = "round";
      c.stroke();
    }
    if (i === 2) {
      const comps: [string, number, number, number, number][] = [["<Header />", 48, 116, 928, 70], ["<FilterBar />", 48, 206, 300, 180], ["<Chart />", 368, 206, 608, 180], ["<DataTable />", 48, 406, 600, 186], ["<Card />", 668, 406, 308, 186]];
      c.setLineDash([12, 10]);
      comps.forEach(([, x, y, w, hh]) => rr(x, y, w, hh, 14, C.block, C.acc, 2.5));
      c.setLineDash([]);
      c.font = mono(500, 24);
      c.fillStyle = C.acc;
      comps.forEach(([n, x, y]) => c.fillText(n, x + 22, y + 44));
    }
    if (i === 1) {
      const nodes: [string, number, number][] = [["filters", 220, 280], ["query", 512, 210], ["cache", 804, 290], ["view", 380, 490], ["user", 700, 500]];
      [[0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [3, 4]].forEach(([a, b]) => {
        c.beginPath();
        c.moveTo(nodes[a][1], nodes[a][2]);
        c.lineTo(nodes[b][1], nodes[b][2]);
        c.strokeStyle = C.line;
        c.lineWidth = 4;
        c.stroke();
      });
      nodes.forEach(([n, x, y], k) => {
        c.beginPath();
        c.arc(x, y, 50, 0, 7);
        c.fillStyle = k === 1 ? C.acc : C.fill;
        c.fill();
        c.strokeStyle = C.acc;
        c.lineWidth = 3;
        c.stroke();
        c.font = mono(500, 22);
        c.fillStyle = k === 1 ? "#FFFFFF" : C.text;
        c.textAlign = "center";
        c.fillText(n, x, y + 8);
        c.textAlign = "left";
      });
    }
    if (i === 0) {
      const rows: [string, string][][] = [
        [["GET ", C.acc], ["/api/insights", C.text]],
        [["200 OK", C.ok], ["  ·  84 ms", C.muted]],
        [["{ ", C.muted], ['"segment"', C.acc], [': "A",', C.text]],
        [["  ", C.muted], ['"score"', C.acc], [": 0.82 }", C.text]],
      ];
      c.font = mono(500, 30);
      rows.forEach((row, k) => {
        let x = 56;
        row.forEach(([s, col]) => {
          c.fillStyle = col;
          c.fillText(s, x, 190 + k * 86);
          x += c.measureText(s).width;
        });
      });
    }
    L.tex.needsUpdate = true;
  };

  const conMat = new THREE.LineBasicMaterial({ color: 0x1783c1, transparent: true, opacity: 0 });
  const conGeo = new THREE.BufferGeometry().setFromPoints(
    [[-2.9, -1.8], [2.9, -1.8], [-2.9, 1.8], [2.9, 1.8]].flatMap(([x, y]) => [new THREE.Vector3(x, y, -0.5), new THREE.Vector3(x, y, 0.5)]),
  );
  const con = new THREE.LineSegments(conGeo, conMat);
  con.renderOrder = 50;
  stack.add(con);

  const pGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
  const packets = Array.from({ length: 8 }, (_, k) => {
    const mt = new THREE.MeshBasicMaterial({ color: 0x6cc0ee, transparent: true, opacity: 0, depthWrite: false });
    const m = new THREE.Mesh(pGeo, mt);
    m.userData = { x: (Math.random() - 0.5) * LW * 0.7, y: (Math.random() - 0.5) * LH * 0.6, ph: k / 8, sp: 0.09 + Math.random() * 0.05 };
    m.renderOrder = 100;
    stack.add(m);
    return m;
  });

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let t0: number | null = null, lastTheme: string | null = null, wide = true, frame = 0, rx = 0, ry = -0.3;
  let drag: { moved: number; lx: number } | null = null;
  let yawOff = 0, yawVel = 0, focus = -1, focusUntil = 0, hov = -1, lastT = 0, spacingCur = 1.05;

  const hitLayer = (clientX: number, clientY: number) => {
    const r = mount.getBoundingClientRect();
    ndc.set(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(layers.map((L) => L.mesh), false)[0];
    return hit ? (hit.object.userData.i as number) : -1;
  };

  let gx = 0, gy = 0, gyro = false, lastTouch = -99, autoI = -1, hintI = -2;
  const onOri = (e: DeviceOrientationEvent) => {
    if (e.gamma == null) return;
    gyro = true;
    gx = Math.max(-1, Math.min(1, e.gamma / 35));
    gy = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 35));
  };
  window.addEventListener("deviceorientation", onOri);
  const askGyro = () => {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    if (D && typeof D.requestPermission === "function") D.requestPermission().catch(() => {});
  };
  const onDown = (e: PointerEvent) => {
    if (!live.motion) return;
    if (e.pointerType === "touch") {
      lastTouch = lastT;
      askGyro();
    }
    drag = { moved: 0, lx: e.clientX };
    cvs.style.cursor = "grabbing";
  };
  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const dx = e.clientX - drag.lx;
    drag.lx = e.clientX;
    drag.moved += Math.abs(dx);
    yawOff += dx * 0.005;
    yawVel = dx * 0.005;
  };
  const onUp = (e: PointerEvent) => {
    if (!drag) return;
    lastTouch = lastT;
    if (drag.moved < 5) {
      const i = hitLayer(e.clientX, e.clientY);
      focus = i === focus ? -1 : i;
      focusUntil = lastT + 3.5;
    }
    drag = null;
    cvs.style.cursor = hov >= 0 ? "pointer" : "grab";
  };
  cvs.addEventListener("pointerdown", onDown);
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
  window.addEventListener("pointercancel", onUp);

  const resize = () => {
    const w = mount.clientWidth, hh = mount.clientHeight;
    if (!w || !hh) return;
    renderer.setSize(w, hh);
    camera.aspect = w / hh;
    camera.updateProjectionMatrix();
    wide = w > 980;
    const vh = 2 * 17 * Math.tan((15 * Math.PI) / 180), vw = vh * camera.aspect;
    root.position.set(wide ? Math.min(4.1, vw * 0.24) : 0, 0.1, 0);
    root.scale.setScalar(wide ? Math.min(0.78, vw / 17, vh / 8.2) : Math.min(0.78, vw / 10, vh / 7.4));
  };
  const ro = new ResizeObserver(resize);
  ro.observe(mount);
  resize();
  const onFonts = () => {
    lastTheme = null;
  };
  document.fonts?.ready.then(onFonts);

  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const damp = (a: number, b: number, k: number, dt: number) => a + (b - a) * (1 - Math.exp(-k * dt));

  const tick = (t: number) => {
    const r = mount.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const motion = live.motion, theme = live.theme;
    if (theme !== lastTheme) {
      const C = palette(theme === "dark");
      layers.forEach((L, i) => drawLayer(L, i, C));
      const pc = theme === "dark" ? "#6CC0EE" : "#1783C1";
      packets.forEach((p) => (p.material as ThreeNS.MeshBasicMaterial).color.set(pc));
      lastTheme = theme;
    }
    if (t0 === null) t0 = t;
    const dt = Math.min(0.05, Math.max(0.001, t - (lastT || t)));
    lastT = t;
    const el = motion ? t - t0 : 99, tt = motion ? t : 0, sy = live.scrollY, m = live.mouse;
    const useG = gyro && coarse && motion;
    const mx = useG ? gx * 0.9 : m.in && motion && !coarse ? m.x / innerWidth - 0.5 : 0;
    const my = useG ? gy * 0.6 : m.in && motion && !coarse ? m.y / innerHeight - 0.5 : 0;
    if (!wide && motion && !drag && t - lastTouch > 4 && el > 2.2) {
      const ai = Math.floor((t - lastTouch) / 2.6) % 5;
      autoI = ai < 4 ? 3 - ai : -1;
    } else if (drag || t - lastTouch <= 4) autoI = -1;
    const shown = focus >= 0 ? focus : autoI;
    const hint = getHint();
    if (!wide && shown !== hintI && hint) {
      hintI = shown;
      hint.textContent = shown >= 0 ? `${TITLES[shown][0]} · ${TITLES[shown][1]} — ${DESCS[shown]}` : HERO_HINT_DEFAULT;
    }
    if (!drag) {
      yawOff += yawVel;
      yawVel *= Math.pow(0.9, dt * 60);
      yawOff = damp(yawOff, 0, 0.6, dt);
    }
    ry = damp(ry, -0.3 + Math.sin(tt * 0.18) * 0.18 + mx * 0.3 + yawOff + (motion ? sy * 0.0004 : 0), 3, dt);
    rx = damp(rx, my * 0.14, 3, dt);
    root.rotation.set(rx, ry, 0);
    stack.rotation.set(-1.0, 0, 0.62);
    stack.position.y = Math.sin(tt * 0.6) * 0.07;
    spacingCur = damp(spacingCur, 1.1 + 0.06 * Math.sin(tt * 0.5) + (motion ? Math.min(0.9, sy / 600) : 0), 4, dt);
    if (motion && !drag && frame++ % 3 === 0) {
      const nh = m.in && m.y >= r.top && m.y <= r.bottom ? hitLayer(m.x, m.y) : -1;
      if (nh !== hov) {
        hov = nh;
        cvs.style.cursor = hov >= 0 ? "pointer" : "grab";
      }
    }
    if (focus >= 0 && t > focusUntil) focus = -1;
    layers.forEach((L, i) => {
      const p = ease(Math.min(1, Math.max(0, (el - 0.1 - i * 0.16) / 1.1)));
      const sel = focus >= 0 ? focus : autoI, hot = hov === i || sel === i, dim = sel >= 0 && sel !== i;
      L.lift = damp(L.lift, focus === i ? 1.1 : autoI === i ? 0.75 : hov === i ? 0.4 : 0, focus >= 0 ? 6 : 3.5, dt);
      L.g.position.set(0, Math.sin(tt * 0.55 + i * 1.4) * 0.04, (i - 1.5) * spacingCur * p + L.lift - (1 - p) * 1.4);
      L.mat.opacity = damp(L.mat.opacity, (dim ? (focus >= 0 ? 0.3 : 0.55) : 1) * p, focus >= 0 ? 8 : 4, dt);
      L.edgeMat.opacity = damp(L.edgeMat.opacity, (hot ? 0.95 : 0.3) * p, 8, dt);
      L.glowMat.opacity = damp(L.glowMat.opacity, hot ? 0.16 : 0, 8, dt);
    });
    const zb = -1.5 * spacingCur, zt = 1.5 * spacingCur;
    con.scale.z = Math.max(0.01, zt - zb);
    conMat.opacity = 0.18 * ease(Math.min(1, el / 1.6));
    packets.forEach((pk) => {
      const u = pk.userData as { x: number; y: number; ph: number; sp: number };
      const f = (tt * u.sp + u.ph) % 1;
      pk.position.set(u.x, u.y, zb + (zt - zb) * f);
      (pk.material as ThreeNS.MeshBasicMaterial).opacity = motion && el > 1.4 ? Math.sin(f * Math.PI) * 0.9 : 0;
      pk.scale.setScalar(0.6 + Math.sin(f * Math.PI) * 0.6);
    });
    renderer.render(scene, camera);
  };

  return {
    tick,
    restart: () => {
      t0 = null;
    },
    dispose: () => {
      ro.disconnect();
      window.removeEventListener("deviceorientation", onOri);
      cvs.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      layers.forEach((L) => {
        L.tex.dispose();
        L.mat.dispose();
        L.edgeMat.dispose();
        L.glowMat.dispose();
      });
      packets.forEach((p) => (p.material as ThreeNS.MeshBasicMaterial).dispose());
      [geo, edgeGeo, conGeo, pGeo, conMat].forEach((o) => o.dispose());
      renderer.dispose();
      cvs.remove();
    },
  };
}
