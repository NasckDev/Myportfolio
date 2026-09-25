import type * as ThreeNS from "three";

/**
 * Monta o canvas no container, acompanha o tamanho e só anima enquanto visível.
 * Retorna a função de limpeza.
 */
export function view3d(
  mount: HTMLElement,
  renderer: ThreeNS.WebGLRenderer,
  camera: ThreeNS.PerspectiveCamera,
  onFit: ((aspect: number) => void) | null,
  onTick: (t: number) => void,
) {
  const cv = renderer.domElement;
  cv.style.display = "block";
  mount.appendChild(cv);
  let visible = false;
  let raf = 0;
  let dead = false;
  const fit = () => {
    const w = mount.clientWidth, hh = mount.clientHeight;
    if (!w || !hh) return;
    renderer.setSize(w, hh, false);
    cv.style.width = "100%";
    cv.style.height = hh + "px";
    camera.aspect = w / hh;
    onFit?.(w / hh);
    camera.updateProjectionMatrix();
  };
  const tick = (now: number) => {
    raf = 0;
    if (dead || !visible) return;
    onTick(now / 1000);
    raf = requestAnimationFrame(tick);
  };
  const ro = new ResizeObserver(fit);
  ro.observe(mount);
  fit();
  const io = new IntersectionObserver(
    (es) => {
      visible = es[0].isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    },
    { rootMargin: "120px" },
  );
  io.observe(mount);
  return () => {
    dead = true;
    cancelAnimationFrame(raf);
    ro.disconnect();
    io.disconnect();
    renderer.dispose();
    cv.remove();
  };
}

export function disposeScene(scene: ThreeNS.Scene) {
  scene.traverse((o) => {
    const m = o as ThreeNS.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as ThreeNS.Material | ThreeNS.Material[] | undefined;
    if (!mat) return;
    (Array.isArray(mat) ? mat : [mat]).forEach((x) => {
      const map = (x as ThreeNS.MeshBasicMaterial).map;
      if (map) map.dispose();
      x.dispose();
    });
  });
}
