/**
 * ✅ 軽量・安全版（画像が消えない）
 * - 背景は「2レイヤーのクロスフェード」方式（bgA/bgB）
 * - Story背景は Hero + 01 + 02 + 03 のみ使用（04/05は背景に使わない）
 * - セクション切替はIntersectionObserverで安定
 * - テキスト表示は少し早め（threshold/rootMargin調整）
 * - ギャラリーはデザイン1のcoverflow再現
 * - ✅ Gallery画像は assets/images/gallery/ に分離（プリロード対象に追加）
 */

const BG = [
  "./assets/images/hero/hero.jpg",    // 0
  "./assets/images/story/01.jpg",     // 1
  "./assets/images/story/02.jpg",     // 2
  "./assets/images/story/03.jpg",     // 3
  "./assets/images/背景/背景4.png",      // 4 (Gallery background)
  "./assets/images/背景/背景5.png",      // 5 (Details background)
  "./assets/images/背景/背景6.png",      // 6 (Access background)
  "./assets/images/背景/背景7.png",      // 7 (FAQ background)
];

const GALLERY = [
  "./assets/images/gallery/01.jpg",
  "./assets/images/gallery/02.jpg",
  "./assets/images/gallery/03.jpg",
  "./assets/images/gallery/04.jpg",
  "./assets/images/gallery/05.jpg",
  "./assets/images/gallery/06.jpg",
];

const ASSETS = [
  ...BG,
  ...GALLERY,
  "./assets/textures/paper.png",
];

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const loader = $("#loader");
const loaderFill = $("#loaderFill");
const loaderPct = $("#loaderPct");
const loaderStatus = $("#loaderStatus");
const letterSeal = $("#letterSeal");
const letterScene = $("#letterScene");

const bgA = $("#bgA");
const bgB = $("#bgB");

const menuBtn = $("#menuBtn");
const navOverlay = $("#navOverlay");
const navClose = $("#navClose");
const viewToggle = document.querySelector("[data-view-toggle]");

let showingA = true;
let currentKey = null;
let assetsReady = false;
let letterOpened = false;

function lerp(a, b, t){ return a + (b - a) * t; }

/* ================= Loader（自然にバーが動く） ================= */
function setLoaderStatus(text){
  if(loaderStatus) loaderStatus.textContent = text;
}

function finishLoader(){
  if(!loader) return;
  loader.classList.add("is-done");
  document.body.classList.remove("is-loading");
  requestAnimationFrame(() => {
    setTimeout(syncBackgroundToViewport, 120);
  });
  setTimeout(() => loader.remove(), 2400);
}

function openLetter(){
  if(!loader || letterOpened) return;
  letterOpened = true;
  loader.classList.add("is-open");
  letterSeal && letterSeal.classList.add("is-breaking");
  if(assetsReady || prefersReduced){
    setTimeout(finishLoader, 2600);
  }
}

function setupLetterLoader(){
  if(!loader) return;
  if(letterSeal){
    letterSeal.addEventListener("click", openLetter);
  }
  if(letterScene){
    letterScene.addEventListener("click", (e) => {
      if(e.target === letterSeal) return;
      openLetter();
    });
  }
  if(prefersReduced){
    loader.classList.add("is-open");
    letterOpened = true;
  }
}

async function preloadAssets() {
  let loaded = 0;
  let visualPct = 0;
  const hasProgress = loaderPct && loaderFill;
  setLoaderStatus("読み込み中...");

  const smoothTimer = hasProgress ? setInterval(() => {
    const target = (loaded / ASSETS.length) * 100;
    visualPct = lerp(visualPct, target, 0.14);
    const pct = Math.floor(visualPct);
    loaderPct.textContent = String(pct);
    loaderFill.style.width = `${pct}%`;
  }, 16) : null;

  const loadOne = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });

  for (const src of ASSETS) {
    await loadOne(src);
    loaded++;
  }

  if(hasProgress){
    for (let i = 0; i < 18; i++) {
      visualPct = lerp(visualPct, 100, 0.22);
      const pct = Math.floor(visualPct);
      loaderPct.textContent = String(pct);
      loaderFill.style.width = `${pct}%`;
      await new Promise((r) => setTimeout(r, 16));
    }
  }

  if(smoothTimer) clearInterval(smoothTimer);

  assetsReady = true;
  if(loader) loader.classList.add("is-ready");
  setLoaderStatus("封蝋をクリックして開封");
  if(letterOpened || prefersReduced){
    setTimeout(finishLoader, 2600);
  }
}

/* ================= 背景クロスフェード（消えない） ================= */
function bgStyleFor(key){
  if(key === "plain"){
    return `radial-gradient(1100px 650px at 28% -12%, rgba(143,172,94,.14), transparent 62%),
            radial-gradient(900px 520px at 88% 8%, rgba(233,211,137,.12), transparent 58%),
            radial-gradient(700px 420px at 70% 72%, rgba(232,113,87,.06), transparent 62%),
            linear-gradient(180deg, #fbfaf6, #f3f2ea)`;
  }

  const idx = Number(key);
  if(Number.isFinite(idx) && BG[idx]){
    return `url("${BG[idx]}")`;
  }

  return `linear-gradient(180deg, #fbfaf6, #f3f2ea)`;
}

function setBackground(key){
  if(currentKey === key) return;
  currentKey = key;

  const incoming = showingA ? bgB : bgA;
  const outgoing = showingA ? bgA : bgB;

  incoming.style.backgroundImage = bgStyleFor(key);

  incoming.classList.add("is-on");
  outgoing.classList.remove("is-on");

  showingA = !showingA;
}

function syncBackgroundToViewport(){
  const sections = $$(".sp");
  if(!sections.length) return;

  const vh = window.innerHeight || 1;
  const center = vh / 2;
  let best = null;
  let bestDist = Infinity;

  sections.forEach((sec) => {
    const r = sec.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    const dist = Math.abs(mid - center);
    if(dist < bestDist){
      bestDist = dist;
      best = sec;
    }
  });

  if(best){
    currentKey = null;
    setBackground(best.dataset.bg || "plain");
  }
}

/* ================= Reveal（少し早め） ================= */
function setupReveal(){
  const items = $$(".reveal");
  if(!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if(e.isIntersecting){
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -18% 0px" // ✅ 体感：少しだけ早く
  });

  items.forEach(el => io.observe(el));
}

/* ================= Active section → BG切替（チカチカ対策版） ================= */
function setupBgSwitch(){
  const sections = $$(".sp");
  if(!sections.length) return;

  // 初期
  setBackground(sections[0]?.dataset.bg || "0");

  let active = sections[0];

  // ✅ 画面中央の「細い帯」に入ったセクションを採用する
  // rootMargin を上下マイナスにすると、判定エリアが中央付近の帯になる
  const io = new IntersectionObserver((entries) => {
    const hits = entries.filter(e => e.isIntersecting);
    if(!hits.length) return;

    const vh = window.innerHeight || 1;
    const center = vh / 2;

    // ✅ 中央に最も近いセクションを採用（境界でも揺れにくい）
    let best = hits[0];
    let bestDist = Infinity;

    for(const e of hits){
      const r = e.boundingClientRect;
      const mid = r.top + r.height / 2;
      const dist = Math.abs(mid - center);
      if(dist < bestDist){
        bestDist = dist;
        best = e;
      }
    }

    const sec = best.target;
    if(sec === active) return;

    active = sec;
    setBackground(sec.dataset.bg || "plain");
  }, {
    threshold: 0,
    rootMargin: "-45% 0px -45% 0px"
  });

  sections.forEach(sec => io.observe(sec));
}


/* ================= Nav ================= */
function setupNav(){
  if(!menuBtn || !navOverlay || !navClose) return;

  const open = () => {
    navOverlay.classList.add("is-open");
    navOverlay.setAttribute("aria-hidden", "false");
    menuBtn.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
  };

  const close = () => {
    navOverlay.classList.remove("is-open");
    navOverlay.setAttribute("aria-hidden", "true");
    menuBtn.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
  };

  menuBtn.addEventListener("click", open);
  navClose.addEventListener("click", close);

  navOverlay.addEventListener("click", (e) => {
    if(e.target === navOverlay) close();
  });

  $$("#navOverlay a").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      close();
      const hash = a.getAttribute("href");
      const target = hash ? $(hash) : null;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* ================= View toggle ================= */
const VIEW_KEY = "invitationViewMode";
const VIEW_MODES = ["auto", "desktop", "mobile"];

function applyViewMode(mode){
  const safe = VIEW_MODES.includes(mode) ? mode : "auto";
  if(safe === "auto"){
    document.documentElement.removeAttribute("data-view");
  }else{
    document.documentElement.setAttribute("data-view", safe);
  }

  if(viewToggle){
    const buttons = Array.from(viewToggle.querySelectorAll("button[data-view]"));
    buttons.forEach((btn) => {
      const active = btn.dataset.view === safe;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  try{
    localStorage.setItem(VIEW_KEY, safe);
  }catch(e){
    // ignore storage errors
  }
}

function setupViewToggle(){
  if(!viewToggle) return;
  const buttons = Array.from(viewToggle.querySelectorAll("button[data-view]"));
  if(!buttons.length) return;

  let saved = "auto";
  try{
    saved = localStorage.getItem(VIEW_KEY) || "auto";
  }catch(e){
    saved = "auto";
  }
  applyViewMode(saved);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyViewMode(btn.dataset.view));
  });
}
/* ================= Coverflow（デザイン1再現） ================= */
function setupCoverflow(){
  const root = document.querySelector("[data-coverflow]");
  if(!root) return;

  const cards = Array.from(root.querySelectorAll("[data-cf-card]"));
  const prevBtn = root.querySelector("[data-cf-prev]");
  const nextBtn = root.querySelector("[data-cf-next]");
  if(cards.length < 3) return;

  cards.forEach((card) => {
    const img = card.querySelector("img");
    if(!img) return;

    const setBg = () => {
      const src = img.currentSrc || img.src;
      if(src){
        card.style.setProperty("--cf-img", `url("${src}")`);
      }
    };

    if(img.complete && img.naturalWidth > 0){
      setBg();
    }else{
      img.addEventListener("load", setBg, { once: true });
    }
  });

  let idx = 0;
  let timer = null;

  const paint = () => {
    cards.forEach((c, i) => {
      c.classList.remove("is-active","is-prev","is-next","is-far");
      if(i === idx) c.classList.add("is-active");
      else if(i === (idx - 1 + cards.length) % cards.length) c.classList.add("is-prev");
      else if(i === (idx + 1) % cards.length) c.classList.add("is-next");
      else c.classList.add("is-far");
    });
  };

  const go = (dir) => {
    idx = (idx + dir + cards.length) % cards.length;
    paint();
    restart();
  };

  const restart = () => {
    if(timer) clearInterval(timer);
    if(prefersReduced) return;
    timer = setInterval(() => go(1), 3600);
  };

  prevBtn && prevBtn.addEventListener("click", () => go(-1));
  nextBtn && nextBtn.addEventListener("click", () => go(1));

  let startX = null;
  root.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  root.addEventListener("pointerup", (e) => {
    if(startX == null) return;
    const dx = e.clientX - startX;
    startX = null;
    if(Math.abs(dx) < 40) return;
    go(dx > 0 ? -1 : 1);
  });

  paint();
  restart();
}

/* ================= broken img fallback（プロフィール） ================= */
function setupImgFallback(){
  const imgs = $$('img[data-fallback]');
  imgs.forEach((img) => {
    img.addEventListener("error", () => {
      img.style.display = "none";
      const wrap = img.closest(".profilePhoto, .messagePhoto");
      if(wrap) wrap.classList.add("is-empty");
    }, { once:true });
  });
}

/* ================= Boot ================= */
(async function boot(){
  // ✅ 初期背景（Hero）を必ずセット
  bgA.style.backgroundImage = `url("${BG[0]}")`;

  setupNav();
  setupViewToggle();
  setupReveal();
  setupBgSwitch();
  setupCoverflow();
  setupImgFallback();
  setupLetterLoader();

  // grain は重い端末もあるので、減速環境はOFFにできるように
  if(prefersReduced){
    const grain = $("#grain");
    grain && (grain.style.display = "none");
  }

  await preloadAssets();
})();

