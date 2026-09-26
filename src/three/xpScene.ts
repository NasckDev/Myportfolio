import type * as ThreeNS from "three";
import { clamp01, live, smoothstep } from "@/lib/live";
import { disposeScene, view3d } from "./view3d";

type Three = typeof ThreeNS;
type Ctx = CanvasRenderingContext2D;

interface Colors {
  page: string;
  chrome: string;
  muted: string;
  text: string;
  bar: string;
  img: string;
  card: string;
  line: string;
  chip: string;
  ed: string;
  edBar: string;
}

interface PanelDef {
  W: number;
  H: number;
  draw: (g: Ctx, W: number, H: number, C: Colors) => void;
  p: [number, number, number];
  r: [number, number, number];
  d: number;
}

const MONO = '"JetBrains Mono", monospace';
const SANS = "Archivo, sans-serif";

const rr = (g: Ctx, x: number, y: number, w: number, hh: number, r: number) => {
  g.beginPath();
  if (g.roundRect) g.roundRect(x, y, w, hh, r);
  else g.rect(x, y, w, hh);
};

const chrome = (g: Ctx, W: number, H: number, C: Colors, url: string) => {
  g.fillStyle = C.page;
  g.fillRect(0, 0, W, H);
  g.fillStyle = C.chrome;
  g.fillRect(0, 0, W, 46);
  ["#FF5F57", "#FEBC2E", "#28C840"].forEach((c, i) => {
    g.fillStyle = c;
    g.beginPath();
    g.arc(24 + i * 20, 23, 6, 0, 7);
    g.fill();
  });
  g.fillStyle = C.page;
  rr(g, 96, 11, W - 200, 24, 12);
  g.fill();
  g.fillStyle = C.muted;
  g.font = "500 14px " + MONO;
  g.fillText(url, 112, 28);
};

const TOK = /('[^']*'|"[^"]*"|<\/?[!A-Za-z][A-Za-z0-9]*|\/?>|\b(?:import|from|export|function|const|return|if|var)\b|\b(?:useState|useQuery|setCount|Notify)\b)/;

const editor = (g: Ctx, W: number, H: number, C: Colors, file: string, lines: string[]) => {
  g.fillStyle = C.ed;
  g.fillRect(0, 0, W, H);
  g.fillStyle = C.edBar;
  g.fillRect(0, 0, W, 42);
  g.fillStyle = C.ed;
  g.fillRect(10, 8, 170, 34);
  g.fillStyle = "#6CC0EE";
  g.beginPath();
  g.arc(26, 25, 4, 0, 7);
  g.fill();
  g.fillStyle = "#DCE6F0";
  g.font = "500 15px " + MONO;
  g.fillText(file, 38, 30);
  g.font = "500 17px " + MONO;
  lines.forEach((ln, i) => {
    const y = 78 + i * 28;
    g.fillStyle = "#4A6585";
    g.fillText(String(i + 1).padStart(2, " "), 14, y);
    let x = 54;
    ln.split(TOK).forEach((tk) => {
      if (!tk) return;
      g.fillStyle = /^['"]/.test(tk)
        ? "#A5E3B6"
        : /^<|^\/>/.test(tk)
          ? "#F5B82E"
          : /^(import|from|export|function|const|return|if|var)$/.test(tk)
            ? "#6CC0EE"
            : /^(useState|useQuery|setCount|Notify)$/.test(tk)
              ? "#C9B2FF"
              : "#DCE6F0";
      g.fillText(tk, x, y);
      x += g.measureText(tk).width;
    });
  });
};

const page0 = (g: Ctx, W: number, H: number, C: Colors) => {
  chrome(g, W, H, C, "meu-primeiro-site.html");
  g.fillStyle = C.text;
  g.font = "700 34px " + SANS;
  g.fillText("Olá, mundo!", 36, 112);
  g.fillStyle = C.bar;
  rr(g, 36, 134, 400, 14, 7);
  g.fill();
  rr(g, 36, 158, 300, 14, 7);
  g.fill();
  g.fillStyle = "#1783C1";
  rr(g, 36, 196, 196, 52, 26);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = "600 20px " + SANS;
  g.fillText("Clique", 94, 229);
  for (let i = 0; i < 3; i++) {
    const x = 36 + i * 186;
    g.strokeStyle = C.line;
    g.lineWidth = 2;
    rr(g, x, 282, 170, 104, 14);
    g.stroke();
    g.fillStyle = C.img;
    rr(g, x + 14, 296, 142, 40, 8);
    g.fill();
    g.fillStyle = C.bar;
    rr(g, x + 14, 348, 110, 10, 5);
    g.fill();
    rr(g, x + 14, 366, 80, 10, 5);
    g.fill();
  }
};

const page1 = (g: Ctx, W: number, H: number, C: Colors) => {
  chrome(g, W, H, C, "loja.com.br/ofertas");
  g.fillStyle = "#1783C1";
  rr(g, 28, 64, 34, 34, 9);
  g.fill();
  g.fillStyle = C.bar;
  rr(g, 74, 74, 120, 14, 7);
  g.fill();
  rr(g, 214, 74, 80, 14, 7);
  g.fill();
  g.strokeStyle = C.text;
  g.lineWidth = 3;
  rr(g, W - 72, 68, 30, 26, 6);
  g.stroke();
  g.fillStyle = "#1783C1";
  g.beginPath();
  g.arc(W - 40, 68, 11, 0, 7);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = "700 14px " + SANS;
  g.fillText("2", W - 44, 73);
  g.fillStyle = C.text;
  g.font = "700 26px " + SANS;
  g.fillText("Ofertas", 28, 146);
  const cw = (W - 56 - 28) / 3;
  ["Smartphone", "Fone Bluetooth", "Smartwatch"].forEach((nm, i) => {
    const x = 28 + i * (cw + 14), y = 164;
    g.fillStyle = C.card;
    rr(g, x, y, cw, 250, 16);
    g.fill();
    g.strokeStyle = C.line;
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = C.img;
    rr(g, x + 12, y + 12, cw - 24, 104, 10);
    g.fill();
    g.fillStyle = C.text;
    g.font = "600 17px " + SANS;
    g.fillText(nm, x + 14, y + 144);
    g.font = "700 20px " + SANS;
    g.fillText(["R$ 1.299", "R$ 249", "R$ 899"][i], x + 14, y + 174);
    g.fillStyle = "#1783C1";
    rr(g, x + 14, y + 192, cw - 28, 40, 20);
    g.fill();
    g.fillStyle = "#FFFFFF";
    g.font = "600 16px " + SANS;
    g.fillText("Comprar", x + cw / 2 - 32, y + 218);
  });
};

const ds = (g: Ctx, W: number, H: number, C: Colors) => {
  g.fillStyle = C.page;
  g.fillRect(0, 0, W, H);
  g.fillStyle = C.muted;
  g.font = "500 15px " + MONO;
  g.fillText("design-system / tokens", 28, 40);
  g.fillStyle = C.text;
  g.font = "700 26px " + SANS;
  g.fillText("Componentes", 28, 80);
  ["#0A3C6E", "#1783C1", "#6CC0EE", "#F5B82E", "#E3E9F0"].forEach((c, i) => {
    g.fillStyle = c;
    rr(g, 28 + i * 58, 100, 46, 46, 12);
    g.fill();
  });
  g.fillStyle = "#1783C1";
  rr(g, 28, 170, 140, 46, 23);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = "600 17px " + SANS;
  g.fillText("Primário", 62, 199);
  g.strokeStyle = C.text;
  g.lineWidth = 2;
  rr(g, 180, 170, 150, 46, 23);
  g.stroke();
  g.fillStyle = C.text;
  g.fillText("Secundário", 208, 199);
  g.fillStyle = "#1783C1";
  g.fillText("Link →", 350, 199);
  g.strokeStyle = C.line;
  g.lineWidth = 2;
  rr(g, 28, 236, W - 56, 50, 12);
  g.stroke();
  g.fillStyle = C.muted;
  g.font = "500 16px " + SANS;
  g.fillText("Buscar produto", 48, 267);
  g.fillStyle = "#1783C1";
  rr(g, 28, 308, 58, 32, 16);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.beginPath();
  g.arc(70, 324, 11, 0, 7);
  g.fill();
  g.fillStyle = C.text;
  g.font = "500 16px " + SANS;
  g.fillText("Notificações", 100, 330);
};

const page2 = (g: Ctx, W: number, H: number, C: Colors) => {
  chrome(g, W, H, C, "app/insights");
  ["Últimos 30 dias ▾", "Região ▾", "Segmento ▾"].forEach((t, i) => {
    const x = 28 + [0, 170, 280][i];
    g.fillStyle = i === 0 ? "#1783C1" : C.chip;
    rr(g, x, 62, [156, 100, 124][i], 34, 17);
    g.fill();
    g.fillStyle = i === 0 ? "#FFFFFF" : C.text;
    g.font = "600 14px " + SANS;
    g.fillText(t, x + 14, 84);
  });
  const kw = (W - 56 - 28) / 3;
  [["Respostas", "12,4 mil"], ["Satisfação", "68%"], ["Variação", "+8,2%"]].forEach(([l, v], i) => {
    const x = 28 + i * (kw + 14);
    g.fillStyle = C.card;
    rr(g, x, 112, kw, 86, 14);
    g.fill();
    g.strokeStyle = C.line;
    g.lineWidth = 2;
    g.stroke();
    g.fillStyle = C.muted;
    g.font = "500 14px " + SANS;
    g.fillText(l, x + 16, 138);
    g.fillStyle = C.text;
    g.font = "700 30px " + SANS;
    g.fillText(v, x + 16, 178);
  });
  const cw = (W - 56) * 0.6;
  g.fillStyle = C.card;
  rr(g, 28, 214, cw, 232, 14);
  g.fill();
  g.strokeStyle = C.line;
  g.stroke();
  g.fillStyle = C.text;
  g.font = "600 15px " + SANS;
  g.fillText("Respostas por semana", 44, 242);
  [0.45, 0.62, 0.5, 0.78, 0.66, 0.9, 0.72, 0.96].forEach((v, i) => {
    const bw = (cw - 60) / 8;
    g.fillStyle = i === 7 ? "#1783C1" : C.img;
    const bh = 160 * v;
    rr(g, 44 + i * bw, 430 - bh, bw - 10, bh, 6);
    g.fill();
  });
  const ix = 28 + cw + 14, iw = W - 28 - ix;
  g.fillStyle = C.card;
  rr(g, ix, 214, iw, 232, 14);
  g.fill();
  g.strokeStyle = C.line;
  g.stroke();
  g.fillStyle = "#1783C1";
  rr(g, ix + 16, 232, 70, 24, 12);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = "600 12px " + MONO;
  g.fillText("insight", ix + 24, 249);
  g.fillStyle = C.bar;
  [0, 1, 2, 3].forEach((k) => {
    rr(g, ix + 16, 276 + k * 26, iw - 32 - k * 24, 12, 6);
    g.fill();
  });
};

const crm = (g: Ctx, W: number, H: number, C: Colors) => {
  chrome(g, W, H, C, "c4c · Oportunidade");
  g.fillStyle = C.ed;
  g.fillRect(0, 46, 64, H - 46);
  [0, 1, 2, 3].forEach((k) => {
    g.fillStyle = k === 1 ? "#1783C1" : "#23405F";
    rr(g, 18, 70 + k * 46, 28, 28, 7);
    g.fill();
  });
  g.fillStyle = C.muted;
  g.font = "500 14px " + MONO;
  g.fillText("Oportunidade", 90, 84);
  g.fillStyle = C.text;
  g.font = "700 26px " + SANS;
  g.fillText("#4821 · Renovação", 90, 116);
  g.fillStyle = "#22B573";
  rr(g, W - 130, 92, 100, 30, 15);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = "600 14px " + SANS;
  g.fillText("Ganha", W - 104, 112);
  const fw = (W - 90 - 28 - 20) / 2;
  ["Cliente", "Responsável", "Valor", "Prioridade"].forEach((l, k) => {
    const x = 90 + (k % 2) * (fw + 20), y = 146 + Math.floor(k / 2) * 88;
    g.fillStyle = C.muted;
    g.font = "500 14px " + SANS;
    g.fillText(l, x, y + 14);
    g.strokeStyle = C.line;
    g.lineWidth = 2;
    rr(g, x, y + 24, fw, 42, 10);
    g.stroke();
    g.fillStyle = C.bar;
    rr(g, x + 14, y + 39, fw * (0.35 + (k % 3) * 0.15), 12, 6);
    g.fill();
  });
  g.fillStyle = "#1783C1";
  rr(g, 90, H - 70, 120, 42, 21);
  g.fill();
  g.fillStyle = "#FFFFFF";
  g.font = "600 16px " + SANS;
  g.fillText("Salvar", 124, H - 43);
};

const CODEH = ["<!DOCTYPE html>", '<html lang="pt-BR">', "  <body>", "    <h1>Olá, mundo!</h1>", '    <button id="btn">Clique</button>', "    <script>", "      btn.onclick = () => alert('Funcionou!');", "    </script>", "  </body>", "</html>"];
const CODES = ["import ABSL;", "", "var opp = this.Opportunity;", "", 'if (opp.Status == "Won") {', '  opp.Priority = "Alta";', "  Notify(opp.Owner);", "}"];
const CODE2 = ["const { data, status } = useQuery({", "  queryKey: ['insights', filtros],", "  queryFn: () => api.get('/insights'),", "});", "", "if (status === 'pending') return <Skeleton />;", "if (status === 'error') return <Retry />;", "return <Dashboard data={data} />;"];

/** Uma composição por etapa, em ordem cronológica (curso técnico → MindMiners). */
const LAY: PanelDef[][] = [
  [
    { W: 640, H: 400, draw: (g, W, H, C) => editor(g, W, H, C, "index.html", CODEH), p: [-1.2, 2.3, -1.2], r: [0, 0.24, 0], d: 0 },
    { W: 600, H: 400, draw: page0, p: [0.9, 1.72, 0.3], r: [0, 0.1, 0], d: 0.15 },
  ],
  [
    { W: 600, H: 320, draw: (g, W, H, C) => editor(g, W, H, C, "Oportunidade.absl", CODES), p: [-1.3, 2.6, -1.2], r: [0, 0.26, 0], d: 0 },
    { W: 720, H: 440, draw: crm, p: [0.55, 1.85, 0.2], r: [0, 0.08, 0], d: 0.15 },
  ],
  [
    { W: 520, H: 360, draw: ds, p: [-1.55, 2.55, -1.3], r: [0, 0.3, 0], d: 0 },
    { W: 760, H: 430, draw: page1, p: [0.45, 1.9, 0.1], r: [0, 0.08, 0], d: 0.15 },
  ],
  [
    { W: 640, H: 320, draw: (g, W, H, C) => editor(g, W, H, C, "useInsights.ts", CODE2), p: [-1.3, 2.75, -1.3], r: [0, 0.26, 0], d: 0 },
    { W: 780, H: 460, draw: page2, p: [0.5, 1.92, 0.1], r: [0, 0.08, 0], d: 0.15 },
  ],
];

export function createXpScene(THREE: Three, mount: HTMLElement, n: number) {
  const SP = 9, PX = 220;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 120);
  scene.fog = new THREE.Fog(0xffffff, 13, 32);
  const fog = scene.fog as ThreeNS.Fog;
  const grid = new THREE.GridHelper(140, 140, 0xc9d8e6, 0xc9d8e6);
  grid.position.x = ((n - 1) * SP) / 2;
  const gridMat = grid.material as ThreeNS.LineBasicMaterial;
  gridMat.vertexColors = false;
  gridMat.transparent = true;
  gridMat.opacity = 0.7;
  scene.add(grid);

  const shC = document.createElement("canvas");
  shC.width = shC.height = 256;
  {
    const sg = shC.getContext("2d")!;
    const sr = sg.createRadialGradient(128, 128, 0, 128, 128, 128);
    sr.addColorStop(0, "rgba(255,255,255,1)");
    sr.addColorStop(0.5, "rgba(255,255,255,.35)");
    sr.addColorStop(1, "rgba(255,255,255,0)");
    sg.fillStyle = sr;
    sg.fillRect(0, 0, 256, 256);
  }
  const shTex = new THREE.CanvasTexture(shC);
  const shGeo = new THREE.PlaneGeometry(7.5, 4.6);

  const rrShape = (w: number, hh: number, r: number) => {
    const s = new THREE.Shape(), x = -w / 2, y = -hh / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + hh - r);
    s.quadraticCurveTo(x + w, y + hh, x + w - r, y + hh);
    s.lineTo(x + r, y + hh);
    s.quadraticCurveTo(x, y + hh, x, y + hh - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);
    return s;
  };

  const mkPanel = (it: PanelDef) => {
    const w = it.W / PX, hh = it.H / PX, rad = 0.09;
    const geo = new THREE.ShapeGeometry(rrShape(w, hh, rad), 8);
    const uv = geo.attributes.uv, ps = geo.attributes.position;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ps.getX(i) / w + 0.5, ps.getY(i) / hh + 0.5);
    const cv = document.createElement("canvas");
    cv.width = it.W * 2;
    cv.height = it.H * 2;
    const g = cv.getContext("2d")!;
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false, toneMapped: false });
    const backGeo = new THREE.ShapeGeometry(rrShape(w + 0.05, hh + 0.05, rad + 0.025), 8);
    const backMat = new THREE.MeshBasicMaterial({ color: 0x1783c1, transparent: true, opacity: 0.2, fog: false });
    const grp = new THREE.Group();
    const front = new THREE.Mesh(geo, mat);
    const back = new THREE.Mesh(backGeo, backMat);
    back.position.z = -0.012;
    grp.add(back, front);
    return {
      ...it, grp, mat, backMat, hl: 1,
      redraw: (C: Colors) => {
        g.setTransform(2, 0, 0, 2, 0, 0);
        g.clearRect(0, 0, it.W, it.H);
        it.draw(g, it.W, it.H, C);
        tex.needsUpdate = true;
      },
    };
  };

  const stages = Array.from({ length: n }, (_, i) => {
    const g = new THREE.Group();
    g.position.x = i * SP;
    scene.add(g);
    const platMat = new THREE.MeshBasicMaterial({ map: shTex, color: 0x1783c1, transparent: true, opacity: 0.2, depthWrite: false, fog: false });
    const plat = new THREE.Mesh(shGeo, platMat);
    plat.rotation.x = -Math.PI / 2;
    plat.position.set(0.3, 0.01, 0.2);
    plat.renderOrder = -1;
    g.add(plat);
    const items = (LAY[Math.max(0, LAY.length - n + i)] || LAY[0]).map((it) => {
      const P = mkPanel(it);
      g.add(P.grp);
      return P;
    });
    return { i, platMat, items, a: 0, b: 0.4 };
  });

  let lastTheme: string | null = null;
  let on = new THREE.Color("#1783C1");
  let cxs = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
  const onMove = (e: PointerEvent) => {
    tmx = e.clientX / innerWidth - 0.5;
    tmy = e.clientY / innerHeight - 0.5;
  };
  window.addEventListener("pointermove", onMove, { passive: true });
  document.fonts?.ready.then(() => {
    lastTheme = null;
  });

  const stop = view3d(
    mount,
    renderer,
    camera,
    () => {
      const w = mount.clientWidth, hh = mount.clientHeight;
      camera.setViewOffset(w, hh, -w * 0.2, -hh * 0.14, w, hh);
    },
    (t) => {
      const motion = live.motion, theme = live.theme;
      if (theme !== lastTheme) {
        lastTheme = theme;
        const dk = theme === "dark", bg = dk ? "#06121F" : "#FAFBFD";
        on = new THREE.Color(dk ? "#6CC0EE" : "#1783C1");
        const line = dk ? "#1E3A5C" : "#D9DDE3";
        const C: Colors = dk
          ? { page: "#0F2440", chrome: "#0A1B31", muted: "#8FA6BF", text: "#E6EEF6", bar: "#23405F", img: "#1D4468", card: "#132C4B", line: "#244568", chip: "#1A3656", ed: "#071526", edBar: "#050F1C" }
          : { page: "#FFFFFF", chrome: "#EEF3F8", muted: "#5A6878", text: "#0A3C6E", bar: "#E3EBF3", img: "#D6E8F6", card: "#FFFFFF", line: "#DCE5EE", chip: "#EDF3F9", ed: "#0B1E33", edBar: "#08172A" };
        fog.color.set(bg);
        gridMat.color.set(line);
        gridMat.opacity = dk ? 0.7 : 0.9;
        gridMat.needsUpdate = true;
        fog.near = dk ? 13 : 10;
        fog.far = dk ? 32 : 24;
        stages.forEach((S) =>
          S.items.forEach((it) => {
            it.redraw(C);
            it.backMat.color.copy(on);
          }),
        );
      }
      const p = live.xpP, idx = live.xpIdx;
      const u = Math.min(n - 1, Math.max(0, p * n - 0.5));
      const k = Math.max(0, Math.min(n - 2, Math.floor(u)));
      const f = u - k;
      const cx = n < 2 ? 0 : (k + smoothstep(clamp01((f - 0.3) / 0.4))) * SP;
      cxs += (cx - cxs) * (motion ? 0.06 : 1);
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      camera.position.set(cxs - 2.2 + (motion ? mx * 1.2 + Math.sin(t * 0.25) * 0.4 : 0), 4.2 - (motion ? my * 0.6 : 0), 11.5);
      camera.lookAt(cxs + 0.3, 1.25, 0);
      stages.forEach((S) => {
        const active = S.i === idx;
        S.a += ((active ? 1 : 0) - S.a) * (motion ? 0.05 : 1);
        S.b += ((active ? 1 : 0.35) - S.b) * (motion ? 0.035 : 1);
        const bb = S.b;
        S.platMat.opacity = 0.08 + 0.22 * S.a;
        S.platMat.color.copy(on);
        S.items.forEach((it, m) => {
          const K = 0.9, e = smoothstep(clamp01(bb * 1.3 - it.d));
          const bob = motion ? Math.sin(t * 0.8 + m * 1.7) * 0.035 * S.a : 0;
          const par = motion ? (it.p[2] + 1.5) * 0.06 * S.a : 0;
          it.grp.position.set(K * it.p[0] * (0.7 + 0.3 * e) + mx * par, 0.25 + K * it.p[1] * (0.6 + 0.4 * e) + bob - my * par * 0.6, K * it.p[2] * e);
          it.grp.rotation.set(it.r[0] * e - (1 - e) * 0.5, it.r[1] * e, it.r[2]);
          const sc = K * (0.88 + 0.12 * e);
          it.hl += (1 - it.hl) * 0.15;
          it.grp.scale.setScalar(sc);
          it.mat.opacity = (0.28 + 0.72 * S.a) * it.hl * (0.4 + 0.6 * e);
          it.backMat.opacity = (0.06 + 0.2 * S.a) * e;
        });
      });
      renderer.render(scene, camera);
    },
  );

  return {
    dispose: () => {
      stop();
      window.removeEventListener("pointermove", onMove);
      disposeScene(scene);
      shTex.dispose();
    },
  };
}
