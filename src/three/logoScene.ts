import type * as ThreeNS from "three";
import { clamp01, live, smoothstep } from "@/lib/live";
import { view3d } from "./view3d";

type Three = typeof ThreeNS;

/** Envelope 3D do card de contato: abre ao rolar, reage ao hover e "envia" a carta no clique. */
export function createLogoScene(THREE: Three, mount: HTMLElement) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const W = 2.2, H = 1.4, hw = W / 2, hh = H / 2;
  const poly = (ps: [number, number][]) => {
    const s = new THREE.Shape();
    s.moveTo(ps[0][0], ps[0][1]);
    ps.slice(1).forEach((p) => s.lineTo(p[0], p[1]));
    s.closePath();
    return s;
  };
  const rr = (w: number, h2: number, r: number) => {
    const s = new THREE.Shape(), x = -w / 2, y = -h2 / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h2 - r);
    s.quadraticCurveTo(x + w, y + h2, x + w - r, y + h2);
    s.lineTo(x + r, y + h2);
    s.quadraticCurveTo(x, y + h2, x, y + h2 - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };
  const backGeo = new THREE.ExtrudeGeometry(rr(W, H, 0.1), { depth: 0.06, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 });
  backGeo.translate(0, 0, -0.12);
  const pocketGeo = new THREE.ExtrudeGeometry(poly([[-hw, -hh], [hw, -hh], [hw, hh - 0.04], [0, -0.02], [-hw, hh - 0.04]]), { depth: 0.03, bevelEnabled: false });
  pocketGeo.translate(0, 0, 0.05);
  const flapGeo = new THREE.ShapeGeometry(poly([[-hw, 0], [hw, 0], [0, -0.78]]));
  const mBack = new THREE.MeshStandardMaterial({ color: 0xcfe2f3, roughness: 0.5 });
  const mPocket = new THREE.MeshStandardMaterial({ color: 0xf4f9ff, roughness: 0.4 });
  const mFlap = new THREE.MeshStandardMaterial({ color: 0xe3eef8, roughness: 0.4, side: THREE.DoubleSide });

  const lc = document.createElement("canvas");
  lc.width = 512;
  lc.height = 340;
  const g2 = lc.getContext("2d")!;
  const lt = new THREE.CanvasTexture(lc);
  lt.colorSpace = THREE.SRGBColorSpace;
  lt.anisotropy = 4;
  const drawLetter = () => {
    g2.fillStyle = "#FFFFFF";
    g2.fillRect(0, 0, 512, 340);
    g2.fillStyle = "#5B6B7F";
    g2.font = '500 26px "JetBrains Mono", monospace';
    g2.fillText("contato.tsx", 34, 52);
    g2.fillStyle = "#1783C1";
    g2.font = '700 104px "JetBrains Mono", monospace';
    g2.fillText("</>", 30, 158);
    g2.fillStyle = "#0A3C6E";
    g2.font = '600 30px "JetBrains Mono", monospace';
    g2.fillText('send("olá")', 34, 218);
    [[34, 250, 300], [34, 280, 220]].forEach(([x, y, w]) => {
      g2.fillStyle = "#D6E4F1";
      g2.fillRect(x, y, w, 12);
    });
    lt.needsUpdate = true;
  };
  drawLetter();
  document.fonts?.ready.then(drawLetter);

  const letterMat = new THREE.MeshStandardMaterial({ map: lt, roughness: 0.6, transparent: true });
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 1.24), letterMat);
  const env = new THREE.Group();
  scene.add(env);
  const back = new THREE.Mesh(backGeo, mBack);
  const pocket = new THREE.Mesh(pocketGeo, mPocket);
  const hinge = new THREE.Group();
  hinge.position.set(0, hh - 0.02, 0.09);
  const flap = new THREE.Mesh(flapGeo, mFlap);
  hinge.add(flap);
  const sealGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.05, 36);
  const sealMat = new THREE.MeshStandardMaterial({ color: 0x1783c1, emissive: 0x1783c1, emissiveIntensity: 0.35, roughness: 0.3 });
  const seal = new THREE.Mesh(sealGeo, sealMat);
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, -0.62, 0.03);
  hinge.add(seal);
  env.add(back, letter, pocket, hinge);
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.5, 4, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0x6cc0ee, 30, 14);
  rim.position.set(-3, -2, 3);
  scene.add(rim);

  let mx = 0, my = 0, tmx = 0, tmy = 0, open = 0, rise = 0, spin = 0;
  const onDoc = (e: PointerEvent) => {
    const bx = mount.getBoundingClientRect();
    tmx = Math.max(-1, Math.min(1, (e.clientX - bx.left - bx.width / 2) / 420));
    tmy = Math.max(-1, Math.min(1, (e.clientY - bx.top - bx.height / 2) / 320));
  };
  document.addEventListener("pointermove", onDoc, { passive: true });

  const stop = view3d(
    mount,
    renderer,
    camera,
    (asp) => {
      const d = Math.max(6.0, 6.6 / asp);
      camera.position.set(0, 0.3, d);
      camera.lookAt(0, 0.15, 0);
    },
    (t) => {
      const motion = live.motion;
      const r = mount.getBoundingClientRect();
      const sp = clamp01((innerHeight - r.top) / (innerHeight * 0.7));
      const hover = live.mailHover;
      const sendAge = live.sendT ? performance.now() / 1000 - live.sendT : 99;
      const sending = sendAge < 1.8;
      const openT = motion ? Math.max(smoothstep(clamp01((sp - 0.35) / 0.4)), hover || sending ? 1 : 0) : 1;
      const riseT = motion ? (sending ? 1 : hover ? 1 : smoothstep(clamp01((sp - 0.7) / 0.3)) * 0.45) : 0.9;
      open += (openT - open) * (motion ? 0.12 : 1);
      rise += (riseT - rise) * (motion ? 0.1 : 1);
      hinge.rotation.x = -open * Math.PI * 0.93;
      hinge.position.z = open > 0.5 ? -0.13 : 0.09;
      let ly = rise * 0.9 - 0.02, lo = 1;
      if (sending && motion) {
        const f = clamp01(sendAge / 0.9);
        ly += smoothstep(f) * 2.4;
        lo = sendAge < 0.9 ? 1 - f : clamp01((sendAge - 1.2) / 0.6);
        if (sendAge >= 0.9) ly = -0.02 + clamp01((sendAge - 1.2) / 0.6) * 0.9;
      }
      letter.position.set(0, ly, -0.02);
      letterMat.opacity = lo;
      mx += (tmx - mx) * 0.08;
      my += (tmy - my) * 0.08;
      spin += ((1 - sp) * 1.2 - spin) * 0.1;
      if (motion) {
        env.rotation.set(0.12 + my * 0.55 + (hover ? -0.1 : 0), -0.3 + mx * 0.9 - spin, hover ? Math.sin(t * 9) * 0.03 : 0);
        env.position.y = Math.sin(t * 1.3) * 0.04;
      } else env.rotation.set(0.12, -0.3, 0);
      renderer.render(scene, camera);
    },
  );

  return {
    dispose: () => {
      stop();
      document.removeEventListener("pointermove", onDoc);
      [backGeo, pocketGeo, flapGeo, letter.geometry, sealGeo].forEach((x) => x.dispose());
      [mBack, mPocket, mFlap, letterMat, sealMat].forEach((m) => m.dispose());
      lt.dispose();
    },
  };
}
