import * as inat from "./inat.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const fmt = new Intl.NumberFormat("en-US");

const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
const LITE = matchMedia("(max-width: 760px)").matches || !!(navigator.connection && navigator.connection.saveData);
const FEATURED_ID = 12942; // Eastern Bluebird no iNaturalist
const SPECIES_RADIUS_KM = 20;
const NEARBY_RADIUS_KM = 10;
const LISTEN_MS = 8000;
const LAND_AT_S = 4.85;
const JOURNAL_KEY = "bluebird-journal-v1";
const GROUPS = { Aves: "Bird", Amphibia: "Amphibian", Insecta: "Insect", Mammalia: "Mammal" };
const DEFAULT_PLACE = { lat: 40.7812, lng: -73.9665, label: "Around Central Park, New York", short: "Central Park" };

let place = DEFAULT_PLACE;

/* ---------- hero: vídeo 3D, palavra mascarada e canto ---------- */

const hero = $("#hero");
const intro = $("#intro");
const loop = $("#loop");
const word = $("#word");
const soundBtn = $("#soundBtn");
let landed = false;
let soundOn = false;
let songTimer = 0;
let watchRaf = 0;
let chirpIdx = 0;
const chirps = ["media/chirp-1.mp4", "media/chirp-2.mp4"].map((src) => {
  const a = new Audio(src);
  a.preload = "auto";
  a.addEventListener("ended", () => queueSong(2500 + Math.random() * 4000));
  return a;
});

const suffix = LITE ? "-480" : "";
loop.loop = true;
loop.src = `media/loop${suffix}.mp4`;
word.style.webkitMaskImage = word.style.maskImage = 'url("media/mask.png")';

function setLanded() {
  if (landed) return;
  landed = true;
  hero.classList.add("is-landed");
  queueSong(900);
  scheduleDock();
}

function watchLanding() {
  if (!landed && intro.currentTime >= LAND_AT_S) setLanded();
  if (!landed) watchRaf = requestAnimationFrame(watchLanding);
}

function startLoop() {
  setLanded();
  intro.style.opacity = "0";
  try { loop.currentTime = 0; } catch { /* vídeo ainda sem metadados */ }
  loop.muted = true;
  const p = loop.play();
  if (p && p.catch) p.catch(() => {});
}

function bootHero() {
  if (REDUCE) {
    intro.remove();
    setLanded();
    return;
  }
  intro.src = `media/intro${suffix}.mp4`;
  intro.addEventListener("playing", () => { cancelAnimationFrame(watchRaf); watchRaf = requestAnimationFrame(watchLanding); });
  intro.addEventListener("ended", startLoop);
  intro.addEventListener("error", startLoop);
  const p = intro.play();
  if (p && p.catch) p.catch(startLoop);
  setTimeout(() => { if (!landed) startLoop(); }, 9000);
}

function replay() {
  if (REDUCE || !intro.isConnected) return;
  loop.pause();
  stopSong();
  landed = false;
  hero.classList.remove("is-landed");
  intro.style.opacity = "1";
  intro.muted = !soundOn;
  try { intro.currentTime = 0; } catch { /* ignora */ }
  const p = intro.play();
  if (p && p.catch) p.catch(startLoop);
}

function renderSound() {
  soundBtn.setAttribute("aria-pressed", String(soundOn));
  soundBtn.setAttribute("aria-label", soundOn ? "Mute the bluebird's song" : "Play the bluebird's song");
  $("#icoOn").hidden = !soundOn;
  $("#icoOff").hidden = soundOn;
  $("#soundStatus").textContent = soundOn ? "Singing now · tap to mute" : "Tap to hear its song";
}

function toggleSound() {
  soundOn = !soundOn;
  if (intro.isConnected) intro.muted = !soundOn;
  if (soundOn) {
    stopRecording();
    queueSong(landed ? 250 : 900);
  } else {
    stopSong();
    stopRecording();
  }
  renderSound();
}

function queueSong(ms) {
  clearTimeout(songTimer);
  songTimer = setTimeout(song, ms);
}

function song() {
  if (!soundOn || !landed || !rec.paused) return;
  chirpIdx = (chirpIdx + 1) % chirps.length;
  const a = chirps[chirpIdx];
  try { a.currentTime = 0; } catch { /* ignora */ }
  const p = a.play();
  if (p && p.catch) p.catch(() => {});
}

function stopSong() {
  clearTimeout(songTimer);
  chirps.forEach((a) => a.pause());
}

soundBtn.addEventListener("click", toggleSound);
$("#replayBtn").addEventListener("click", replay);
renderSound();

/* ---------- gravações do iNaturalist (um player compartilhado) ---------- */

const rec = new Audio();
rec.preload = "none";
let recFor = null; // id do táxon tocando
const recCache = new Map();
const recListeners = new Set();

function notifyRec() { recListeners.forEach((fn) => fn()); }
rec.addEventListener("play", notifyRec);
rec.addEventListener("pause", notifyRec);
rec.addEventListener("ended", () => { recFor = null; notifyRec(); });
rec.addEventListener("timeupdate", notifyRec);

function loadRecording(taxonId) {
  if (!recCache.has(taxonId)) {
    const p = inat.recording(taxonId);
    recCache.set(taxonId, p);
    p.catch(() => recCache.delete(taxonId));
  }
  return recCache.get(taxonId);
}

/** Alterna a gravação do táxon: { state: "stopped" | "none" | "playing", rec? }. */
async function toggleRecording(taxonId) {
  if (recFor === taxonId) { stopRecording(); return { state: "stopped" }; }
  stopSong();
  recFor = taxonId;
  notifyRec();
  const r = await loadRecording(taxonId);
  if (recFor !== taxonId) return { state: "stopped" };
  if (!r) { recFor = null; notifyRec(); return { state: "none" }; }
  rec.src = r.url;
  try {
    await rec.play();
  } catch {
    recFor = null;
    notifyRec();
    throw new Error("play");
  }
  return { state: "playing", rec: r };
}

function stopRecording() {
  recFor = null;
  rec.pause();
  notifyRec();
}

/* ---------- lugar (padrão ou localização do usuário) ---------- */

function renderPlace() {
  $$("[data-place-label]").forEach((el) => { el.textContent = place.label; });
}

function locate(btn) {
  if (!("geolocation" in navigator)) { toast("Location isn't available in this browser"); return; }
  btn.disabled = true;
  btn.textContent = "Finding you…";
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      // ~1 km de precisão: basta para a busca e não expõe o endereço exato.
      const lat = Math.round(pos.coords.latitude * 100) / 100;
      const lng = Math.round(pos.coords.longitude * 100) / 100;
      place = { lat, lng, label: "Around your location (±1 km)", short: "you" };
      resetPlaceButtons();
      renderPlace();
      guide.loaded = null;
      refreshOpenView();
      scheduleDock(true);
    },
    () => {
      resetPlaceButtons();
      toast("Location blocked, still showing Central Park");
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
  );
}

function resetPlaceButtons() {
  $$("[data-locate]").forEach((b) => {
    b.disabled = false;
    b.textContent = place === DEFAULT_PLACE ? "Use my location" : "Back to Central Park";
  });
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-locate]");
  if (!b) return;
  if (place === DEFAULT_PLACE) { locate(b); return; }
  place = DEFAULT_PLACE;
  resetPlaceButtons();
  renderPlace();
  guide.loaded = null;
  refreshOpenView();
  scheduleDock(true);
});

/* ---------- dock: espécies com gravação por perto ---------- */

let dockTimer = 0;
function scheduleDock(now = false) {
  clearTimeout(dockTimer);
  dockTimer = setTimeout(loadDock, now ? 0 : 1200);
}

async function loadDock() {
  const sub = $("#dockNearby");
  try {
    const { total, species } = await inat.speciesNear({ ...place, radius: SPECIES_RADIUS_KM, iconic: "Aves" });
    const withPhoto = species.filter((s) => s.photo).slice(0, 2);
    if (!total) return;
    const rest = Math.max(0, total - withPhoto.length);
    $("#dockAvatars").innerHTML =
      withPhoto.map((s) => `<span class="bb-avatar"><img src="${esc(s.photo.square)}" alt="" width="40" height="40"></span>`).join("") +
      (rest ? `<span class="bb-avatar" style="background:#f2ad84;color:#10294a">+${rest > 999 ? "999" : rest}</span>` : "");
    sub.textContent = `${fmt.format(total)} bird species with recordings around ${place.short}`;
  } catch {
    /* sem rede: mantém o texto original do dock */
  }
}

/* ---------- modal ---------- */

const overlay = $("#overlay");
const dialog = $("#dialog");
const TITLES = { listen: "Sound ID", guide: "Field guide", journal: "Journal", app: "Get Bluebird", login: "Log in" };
let current = null;
let lastFocus = null;

function open(name, opts = {}) {
  closeMenu();
  if (!current) lastFocus = document.activeElement;
  stopMic();
  current = name;
  $("#dialogTitle").textContent = TITLES[name];
  dialog.classList.toggle("is-wide", name === "guide");
  $$(".bb-view[data-view]").forEach((v) => { v.hidden = v.dataset.view !== name; });
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  renderPlace();
  if (name === "guide") openGuide(opts.taxon ? Number(opts.taxon) : null);
  if (name === "listen") showListen("start");
  if (name === "journal") showJournal(opts.tab || "mine");
  if (name === "app") { $("#appForm").hidden = false; $("#appDone").hidden = true; }
  if (name === "login") { $("#loginForm").hidden = false; $("#loginDone").hidden = true; }
  overlay.scrollTop = 0;
  dialog.focus();
}

function close() {
  if (!current) return;
  stopMic();
  stopRecording();
  current = null;
  overlay.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && lastFocus.focus) lastFocus.focus();
}

function refreshOpenView() {
  if (current === "guide") openGuide(null);
  if (current === "journal") showJournal(journalTab);
  if (current === "listen" && !$("#listenCompare").hidden) showCompare(compareNote);
}

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) { e.preventDefault(); open(opener.dataset.open, { tab: opener.dataset.tab, taxon: opener.dataset.taxon }); return; }
  if (e.target.closest("[data-close]")) close();
});
$("#closeBtn").addEventListener("click", close);
overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { if (current) close(); else closeMenu(); return; }
  if (e.key !== "Tab" || !current) return;
  const items = $$('button:not([disabled]),a[href],input,[tabindex="0"]', dialog).filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

/* menu mobile */
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");
function closeMenu() { mobileMenu.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
menuBtn.addEventListener("click", () => {
  const openNow = mobileMenu.hidden;
  mobileMenu.hidden = !openNow;
  menuBtn.setAttribute("aria-expanded", String(openNow));
});

/* toast */
let toastTimer = 0;
function toast(text) {
  $("#toastText").textContent = text;
  $("#toastWrap").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $("#toastWrap").hidden = true; }, 2600);
}

/* formulários demonstrativos */
$("#appForm").addEventListener("submit", (e) => { e.preventDefault(); $("#appForm").hidden = true; $("#appDone").hidden = false; });
$("#loginForm").addEventListener("submit", (e) => { e.preventDefault(); $("#loginForm").hidden = true; $("#loginDone").hidden = false; });

/* ---------- diário (localStorage) ---------- */

function readJournal() {
  try {
    const list = JSON.parse(localStorage.getItem(JOURNAL_KEY) || "[]");
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeJournal(list) {
  try { localStorage.setItem(JOURNAL_KEY, JSON.stringify(list.slice(0, 50))); } catch { /* armazenamento bloqueado */ }
}

function saveSighting(s) {
  const list = readJournal().filter((x) => x.id !== s.id);
  list.unshift({
    id: s.id,
    name: s.name,
    sci: s.sci,
    photo: s.photo ? s.photo.square : "",
    credit: s.photo ? s.photo.attribution : "",
    savedAt: new Date().toISOString(),
    where: place.label,
  });
  writeJournal(list);
  toast(`${s.name} saved to your journal`);
}

/* ---------- field guide: carrossel 3D ---------- */

const ring = $("#ring");
const stage = $("#stage");
const detail = $("#detail");
const guide = { group: "Aves", list: [], index: 0, loaded: null, token: 0 };

function openGuide(taxonId) {
  if (taxonId) guide.group = "Aves";
  $$("#groupTabs [data-group]").forEach((t) => t.setAttribute("aria-selected", String(t.dataset.group === guide.group)));
  const key = `${guide.group}|${place.lat},${place.lng}`;
  if (guide.loaded === key && guide.list.length) {
    if (taxonId) select(Math.max(0, guide.list.findIndex((s) => s.id === taxonId)));
    else layout();
    return;
  }
  loadGroup(key, taxonId);
}

async function loadGroup(key, focusId) {
  const token = ++guide.token;
  guide.list = [];
  guide.index = 0;
  $("#prevBtn").hidden = $("#nextBtn").hidden = true;
  ring.innerHTML = [0, 1, 2].map(() => '<div class="bb-card skeleton" aria-hidden="true"></div>').join("");
  $$(".bb-card", ring).forEach((c, i) => { c.style.transform = cardTransform(i - 1); c.style.zIndex = String(10 - Math.abs(i - 1)); });
  $("#stageCount").textContent = "";
  detail.innerHTML = `<div class="bb-skel" style="height:56px"></div><div class="bb-skel" style="height:120px"></div><div class="bb-skel" style="height:46px;width:60%"></div><p class="bb-small" role="status">Loading ${GROUPS[guide.group].toLowerCase()}s recorded near you…</p>`;
  try {
    const { species } = await inat.speciesNear({ ...place, radius: SPECIES_RADIUS_KM, iconic: guide.group });
    const lead = guide.group === "Aves" ? [FEATURED_ID] : [];
    const list = await inat.enrich(species, lead);
    if (token !== guide.token) return;
    guide.list = list;
    guide.loaded = key;
    if (!list.length) {
      ring.innerHTML = "";
      detail.innerHTML = `<div class="bb-msg"><b>No recordings here yet</b><p class="bb-text">Nobody has shared open recordings of this group within ${SPECIES_RADIUS_KM} km. Try another group or location.</p></div>`;
      return;
    }
    buildCards();
    select(focusId ? Math.max(0, list.findIndex((s) => s.id === focusId)) : 0);
  } catch {
    if (token !== guide.token) return;
    ring.innerHTML = "";
    detail.innerHTML = `<div class="bb-msg" role="alert"><b>Couldn't reach iNaturalist</b><p class="bb-text">Check your connection and try again. The rest of Bluebird keeps working offline.</p><button type="button" class="bb-secondary" id="guideRetry">Try again</button></div>`;
    $("#guideRetry").addEventListener("click", () => loadGroup(key, focusId));
  }
}

function buildCards() {
  ring.innerHTML = guide.list.map((s, i) => `
    <button type="button" class="bb-card" data-i="${i}" tabindex="-1" aria-label="Show ${esc(s.name)}">
      ${s.photo ? `<img src="${esc(s.photo.medium)}" alt="" loading="${i < 4 ? "eager" : "lazy"}" decoding="async">` : `<span class="noimg">No openly licensed photo yet</span>`}
      <span class="cap">${esc(s.name)}<i>${esc(s.sci)}</i></span>
    </button>`).join("");
}

function cardTransform(d) {
  const w = stage.clientWidth || 400;
  const ad = Math.abs(d);
  const x = d * w * (w < 420 ? 0.34 : 0.3);
  const z = -ad * 170;
  const ry = Math.max(-60, Math.min(60, -d * 34));
  return `translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`;
}

function layout() {
  $$(".bb-card", ring).forEach((card) => {
    const d = Number(card.dataset.i) - guide.index;
    const ad = Math.abs(d);
    card.style.transform = cardTransform(d);
    card.style.zIndex = String(100 - ad);
    card.style.opacity = ad > 3 ? "0" : String(1 - ad * 0.16);
    card.style.filter = ad ? `saturate(.75) brightness(${1 - ad * 0.07})` : "none";
    card.style.pointerEvents = ad > 3 ? "none" : "auto";
    card.setAttribute("aria-current", d === 0 ? "true" : "false");
  });
  $("#stageCount").textContent = guide.list.length ? `${guide.index + 1} / ${guide.list.length}` : "";
  $("#prevBtn").hidden = $("#nextBtn").hidden = !guide.list.length;
  $("#prevBtn").disabled = guide.index === 0;
  $("#nextBtn").disabled = guide.index >= guide.list.length - 1;
}

function select(i) {
  if (!guide.list.length) return;
  const next = Math.max(0, Math.min(guide.list.length - 1, i));
  if (next !== guide.index && recFor) stopRecording();
  guide.index = next;
  layout();
  renderDetail();
}

function renderDetail() {
  const s = guide.list[guide.index];
  if (!s) return;
  const verb = s.group === "Aves" ? "song" : "call";
  const facts = [
    s.nearbyRecordings != null ? ["Recordings nearby", fmt.format(s.nearbyRecordings)] : null,
    ["Observations on iNaturalist", fmt.format(s.observations)],
    ["Group", GROUPS[s.group] || s.group || "—"],
    s.status ? ["Conservation", s.status.name + (s.status.authority ? ` (${s.status.authority})` : "")] : null,
  ].filter(Boolean);
  detail.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:2px">
      ${s.id === FEATURED_ID ? '<span class="bb-chip" style="align-self:flex-start;background:#f2ad84">Featured</span>' : ""}
      <h3>${esc(s.name)}</h3><span class="sci">${esc(s.sci)}</span>
    </div>
    <div class="bb-facts">${facts.map(([k, v]) => `<div class="bb-fact"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
    ${s.summary ? `<p class="bb-text bb-summary">${esc(s.summary)}</p>` : ""}
    <div style="display:flex;flex-wrap:wrap;gap:10px">
      <button type="button" class="bb-primary" id="playBtn" aria-pressed="false"><span class="bb-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span id="playLabel">Play ${verb}</span></button>
      <button type="button" class="bb-secondary" id="saveBtn">Save to journal</button>
    </div>
    <div class="bb-progress" aria-hidden="true"><span id="playProgress"></span></div>
    <div class="bb-credits">
      ${s.photo ? `<p class="bb-small">Photo: ${esc(s.photo.attribution)} · <a href="${esc(inat.licenseUrl(s.photo.license))}" target="_blank" rel="noopener license">${esc(inat.licenseLabel(s.photo.license))}</a></p>` : ""}
      <p class="bb-small" id="recCredit">Recording: an open-licensed iNaturalist recording loads when you press play.</p>
      <p class="bb-small"><a href="https://www.inaturalist.org/taxa/${s.id}" target="_blank" rel="noopener">See ${esc(s.name)} on iNaturalist</a>${s.wikipedia ? ` · <a href="${esc(s.wikipedia)}" target="_blank" rel="noopener">Wikipedia</a>` : ""}</p>
    </div>`;
  $("#saveBtn").addEventListener("click", () => saveSighting(s));
  $("#playBtn").addEventListener("click", async () => {
    if (recFor !== s.id) $("#playLabel").textContent = "Loading recording…";
    try {
      const res = await toggleRecording(s.id);
      const r = res.rec;
      if (res.state === "playing" && guide.list[guide.index] === s) $("#recCredit").innerHTML = `Recording: ${esc(r.attribution)} · <a href="${esc(inat.licenseUrl(r.license))}" target="_blank" rel="noopener license">${esc(inat.licenseLabel(r.license))}</a> · <a href="${esc(r.observation)}" target="_blank" rel="noopener">observation</a>`;
      if (res.state === "none") $("#recCredit").textContent = "Recording: no open-licensed recording in a playable format yet.";
    } catch {
      $("#recCredit").textContent = "Recording: couldn't play it. Check your connection and try again.";
    }
    syncPlay();
  });
  syncPlay();
}

function syncPlay() {
  const btn = $("#playBtn");
  if (!btn) return;
  const s = guide.list[guide.index];
  const verb = s && s.group === "Aves" ? "song" : "call";
  const playing = !!s && recFor === s.id && !rec.paused;
  btn.classList.toggle("is-playing", playing);
  btn.setAttribute("aria-pressed", String(playing));
  if (playing || recFor !== s?.id) $("#playLabel").textContent = playing ? `Stop ${verb}` : `Play ${verb}`;
  const bar = $("#playProgress");
  if (bar) bar.style.width = playing && rec.duration ? `${(rec.currentTime / rec.duration) * 100}%` : "0";
}
recListeners.add(syncPlay);

$("#prevBtn").addEventListener("click", () => select(guide.index - 1));
$("#nextBtn").addEventListener("click", () => select(guide.index + 1));
stage.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { e.preventDefault(); select(guide.index - 1); }
  if (e.key === "ArrowRight") { e.preventDefault(); select(guide.index + 1); }
});
let dragX = null;
let dragged = false;
stage.addEventListener("pointerdown", (e) => { dragX = e.clientX; dragged = false; });
stage.addEventListener("pointerup", (e) => {
  if (dragX === null) return;
  const dx = e.clientX - dragX;
  dragX = null;
  if (Math.abs(dx) > 40) { dragged = true; select(guide.index + (dx < 0 ? 1 : -1)); }
});
ring.addEventListener("click", (e) => {
  const card = e.target.closest(".bb-card[data-i]");
  if (!card || dragged) return;
  select(Number(card.dataset.i));
});
$$("#groupTabs [data-group]").forEach((tab) => tab.addEventListener("click", () => {
  if (guide.group === tab.dataset.group && guide.list.length) return;
  stopRecording();
  guide.group = tab.dataset.group;
  openGuide(null);
}));
window.addEventListener("resize", () => { if (current === "guide") layout(); });

/* ---------- Sound ID: espectrograma do microfone + comparação ---------- */

let mic = null;
let compareNote = "";

function showListen(step) {
  $("#listenStart").hidden = step !== "start";
  $("#listenLive").hidden = step !== "live";
  $("#listenCompare").hidden = step !== "compare";
}

async function startMic() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showCompare("Your browser can't use the microphone here. You can still compare by ear with recordings made near you.");
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.2;
    ctx.createMediaStreamSource(stream).connect(analyser);
    mic = { stream, ctx, analyser, raf: 0, timer: 0, t0: performance.now() };
    stopRecording();
    stopSong();
    showListen("live");
    drawSpectrogram();
    mic.timer = setTimeout(finishListening, LISTEN_MS);
  } catch {
    showCompare("Microphone access was blocked or isn't available. You can still compare by ear with recordings made near you.");
  }
}

function drawSpectrogram() {
  const canvas = $("#spectro");
  const g = canvas.getContext("2d");
  const { analyser, ctx } = mic;
  const bins = new Uint8Array(analyser.frequencyBinCount);
  const hzPerBin = ctx.sampleRate / analyser.fftSize;
  const lo = Math.floor(800 / hzPerBin);
  const hi = Math.min(bins.length - 1, Math.ceil(10000 / hzPerBin));
  const H = canvas.height;
  const W = canvas.width;
  g.fillStyle = "#10294a";
  g.fillRect(0, 0, W, H);
  const step = () => {
    if (!mic) return;
    analyser.getByteFrequencyData(bins);
    g.drawImage(canvas, -3, 0);
    for (let y = 0; y < H; y++) {
      const v = bins[Math.round(lo + (1 - y / H) * (hi - lo))] / 255;
      const r = Math.round(16 + v * (242 - 16));
      const gg = Math.round(41 + v * (173 - 41));
      const b = Math.round(74 + v * (132 - 74) + (v < 0.5 ? v * 200 : 0));
      g.fillStyle = `rgb(${r},${gg},${Math.min(255, b)})`;
      g.fillRect(W - 3, y, 3, 1);
    }
    const left = Math.max(0, Math.ceil((LISTEN_MS - (performance.now() - mic.t0)) / 1000));
    $("#listenStatus").textContent = `Listening… ${left}s. Birdsong shows up as bright streaks between 1 and 10 kHz.`;
    mic.raf = requestAnimationFrame(step);
  };
  step();
}

function stopMic() {
  if (!mic) return;
  cancelAnimationFrame(mic.raf);
  clearTimeout(mic.timer);
  mic.stream.getTracks().forEach((t) => t.stop());
  mic.ctx.close().catch(() => {});
  mic = null;
}

function finishListening() {
  stopMic();
  showCompare("Who was singing? Play the recordings made near you and pick the closest match.");
}

async function showCompare(note) {
  compareNote = note;
  showListen("compare");
  $("#compareIntro").textContent = note;
  const list = $("#compareList");
  list.innerHTML = '<li class="bb-skel"></li><li class="bb-skel"></li><li class="bb-skel"></li>';
  try {
    const { species } = await inat.speciesNear({ ...place, radius: SPECIES_RADIUS_KM, iconic: "Aves" });
    const top = (await inat.enrich(species, [FEATURED_ID])).filter((x) => species.some((y) => y.id === x.id)).slice(0, 6);
    if (!top.length) { list.innerHTML = '<li class="bb-msg"><p class="bb-text">No open bird recordings within 20 km yet. Try another location.</p></li>'; return; }
    list.innerHTML = top.map((s) => `
      <li class="bb-row">
        <span class="bb-thumb">${s.photo ? `<img src="${esc(s.photo.square)}" alt="" width="44" height="44" loading="lazy">` : ""}</span>
        <span class="bb-row-tx"><button type="button" data-guide="${s.id}"><b>${esc(s.name)}</b></button><span>${s.nearbyRecordings != null ? `${fmt.format(s.nearbyRecordings)} recordings nearby` : ""}</span></span>
        <button type="button" class="bb-round" data-play="${s.id}" aria-label="Play ${esc(s.name)} recording" aria-pressed="false"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg></button>
        <button type="button" class="bb-mini" data-pick="${s.id}">That's it</button>
      </li>`).join("");
    list.onclick = async (e) => {
      const play = e.target.closest("[data-play]");
      const pick = e.target.closest("[data-pick]");
      const go = e.target.closest("[data-guide]");
      if (play) {
        try {
          const res = await toggleRecording(Number(play.dataset.play));
          if (res.state === "none") toast("No open-licensed recording for this one yet");
        } catch { toast("Couldn't play that recording"); }
      }
      if (pick) {
        const s = top.find((x) => x.id === Number(pick.dataset.pick));
        if (s) { saveSighting(s); stopRecording(); }
      }
      if (go) open("guide", { taxon: go.dataset.guide });
    };
    syncCompare();
  } catch {
    list.innerHTML = '<li class="bb-msg" role="alert"><p class="bb-text">Couldn\'t reach iNaturalist. Check your connection and try again.</p><button type="button" class="bb-secondary" id="compareRetry">Try again</button></li>';
    $("#compareRetry").addEventListener("click", () => showCompare(note));
  }
}

function syncCompare() {
  $$("#compareList [data-play]").forEach((b) => {
    const playing = recFor === Number(b.dataset.play) && !rec.paused;
    b.classList.toggle("is-playing", playing);
    b.setAttribute("aria-pressed", String(playing));
  });
}
recListeners.add(syncCompare);

$("#micBtn").addEventListener("click", startMic);
$("#skipMic").addEventListener("click", () => showCompare("Compare by ear: play the recordings made near you and pick the closest match."));
$("#stopMic").addEventListener("click", finishListening);

/* ---------- Journal ---------- */

let journalTab = "mine";
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function ago(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return "";
  const s = Math.round((t - Date.now()) / 1000);
  const abs = Math.abs(s);
  if (abs < 3600) return rtf.format(Math.round(s / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(s / 3600), "hour");
  return rtf.format(Math.round(s / 86400), "day");
}

function km(a, b) {
  const R = 6371;
  const rad = (x) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function showJournal(tab) {
  journalTab = tab;
  $$("[data-jtab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.jtab === tab)));
  $("#journalMine").hidden = tab !== "mine";
  $("#journalNearby").hidden = tab !== "nearby";
  if (tab === "mine") renderMine();
  else renderNearby();
}

function renderMine() {
  const list = readJournal();
  const box = $("#journalMine");
  if (!list.length) {
    box.innerHTML = '<div class="bb-msg"><b>No sightings yet</b><p class="bb-text">Identify a bird with Sound ID or save one from the field guide. Your journal stays in this browser.</p><button type="button" class="bb-secondary" data-open="guide">Open field guide</button></div>';
    return;
  }
  const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  box.innerHTML = `<ul class="bb-list">${list.map((s) => `
    <li class="bb-row">
      <span class="bb-thumb">${s.photo ? `<img src="${esc(s.photo)}" alt="" width="44" height="44" loading="lazy">` : ""}</span>
      <span class="bb-row-tx"><button type="button" data-guide="${s.id}"><b>${esc(s.name)}</b></button><span>${esc(date.format(new Date(s.savedAt)))} · ${esc(s.where)}</span></span>
      <button type="button" class="bb-round" data-remove="${s.id}" aria-label="Remove ${esc(s.name)} from journal"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg></button>
    </li>`).join("")}</ul>`;
}

$("#journalMine").addEventListener("click", (e) => {
  const rm = e.target.closest("[data-remove]");
  const go = e.target.closest("[data-guide]");
  if (rm) { writeJournal(readJournal().filter((x) => x.id !== Number(rm.dataset.remove))); renderMine(); }
  if (go) open("guide", { taxon: go.dataset.guide });
});

async function renderNearby() {
  const list = $("#nearbyList");
  list.innerHTML = '<li class="bb-skel"></li><li class="bb-skel"></li><li class="bb-skel"></li><li class="bb-skel"></li>';
  try {
    const obs = await inat.recentNear({ ...place, radius: NEARBY_RADIUS_KM });
    if (journalTab !== "nearby") return;
    if (!obs.length) { list.innerHTML = '<li class="bb-msg"><p class="bb-text">No recent bird observations with open photos within 10 km.</p></li>'; return; }
    list.innerHTML = obs.map((o) => {
      const dist = o.coords ? `${km(place, o.coords).toFixed(1)} km away` : "";
      const meta = [dist, ago(o.when), o.user ? `by @${o.user}` : ""].filter(Boolean).join(" · ");
      return `<li class="bb-row">
        <span class="bb-thumb">${o.photo ? `<img src="${esc(o.photo.square)}" alt="" width="44" height="44" loading="lazy" title="${esc(o.photo.attribution)}">` : ""}</span>
        <span class="bb-row-tx"><a href="${esc(o.url)}" target="_blank" rel="noopener"><b>${esc(o.name)}</b></a><span>${esc(meta)}</span>${o.photo ? `<span class="bb-small">Photo ${esc(o.photo.attribution)}</span>` : ""}</span>
      </li>`;
    }).join("");
  } catch {
    list.innerHTML = '<li class="bb-msg" role="alert"><p class="bb-text">Couldn\'t reach iNaturalist. Check your connection and try again.</p><button type="button" class="bb-secondary" id="nearbyRetry">Try again</button></li>';
    $("#nearbyRetry").addEventListener("click", renderNearby);
  }
}

$$("[data-jtab]").forEach((b) => b.addEventListener("click", () => showJournal(b.dataset.jtab)));
renderPlace();
resetPlaceButtons();
bootHero();
