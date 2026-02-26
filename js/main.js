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
  "./assets/images/背景/背景5.png",      // 5 (Schedule background)
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
const viewToggleBtn = viewToggle ? viewToggle.querySelector("[data-view-toggle-btn]") : null;
const viewToggleMenu = viewToggle ? viewToggle.querySelector("[data-view-toggle-menu]") : null;
const langToggle = document.querySelector("[data-lang-toggle]");

let showingA = true;
let currentKey = null;
let assetsReady = false;
let letterOpened = false;
let scaleRaf = null;

const LANG_KEY = "invitationLang";
const LANGS = ["ja", "en"];
let currentLang = "ja";

const I18N = {
  ja: {
    "meta.title": "Wedding Invitation | Fuga & Yume",
    "meta.description": "田中楓芽 & 柚芽 結婚式のご案内（Web招待状）",
    "meta.ogTitle": "Wedding Invitation | Fuga & Yume",
    "meta.ogDescription": "2026.05.16 Sat / NOTRE DOME YOKOHAMA MINATOMIRAI",
    "loader.title": "Wedding Invitation",
    "loader.subtitle": "結婚式のご案内",
    "loader.previewAlt": "Wedding Invitation",
    "loader.loading": "読み込み中...",
    "loader.openHint": "封蝋をクリックして開封",
    "loader.seal": "封蝋を割る",
    "brand.alt": "Fuga & Yume",
    "nav.topLabel": "トップへ",
    "nav.menu": "Menu",
    "nav.open": "メニューを開く",
    "nav.close": "Close",
    "nav.closeAria": "メニューを閉じる",
    "nav.panel": "ページ内リンク",
    "nav.top": "Top",
    "nav.message": "Message",
    "nav.ourstory": "Our Story",
    "nav.gallery": "Gallery",
    "nav.schedule": "Schedule",
    "nav.access": "Access",
    "nav.rsvp": "RSVP",
    "nav.faq": "FAQ",
    "view.label": "View",
    "view.aria": "表示切替",
    "view.menu": "表示切替",
    "view.auto": "Auto",
    "view.web": "Web",
    "view.sp": "Sp",
    "hero.poem1": "結婚式へのご招待状をお届けします",
    "hero.poem2": "皆さまとお会いできる日を楽しみにしています",
    "hero.rsvp": "RSVP",
    "hero.hint": "下へスクロールしてご覧ください",
    "message.title": "Message",
    "message.lead": "謹啓より結婚式のご案内を申し上げます",
    "message.kinkei": "謹啓",
    "message.p1": "皆さまにはますますご清祥のこととお慶び申し上げます",
    "message.p2": "私たちはこのたび結婚式を挙げる運びとなりました",
    "message.p3": "日頃お世話になっている皆さまに見守られながらささやかながら心ばかりの席を設けましたので<br>ご多用中とは存じますがぜひご臨席賜りますようお願い申し上げます",
    "message.p4": "当日は美味しいお食事とお飲み物をご用意して和やかな時間をお過ごしいただけましたら幸いです",
    "message.sign": "敬具",
    "message.groom": "<b>新郎</b>　田中 楓芽（Tanaka Fuga）",
    "message.bride": "<b>新婦</b>　柚芽（Yume）",
    "ourstory.title": "Our Story",
    "ourstory.aria": "Our Story",
    "ourstory.topSmall": "OUR STORY",
    "ourstory.topSub": "ARE GETTING MARRIED!",
    "ourstory.descDating": "ふたりの物語がゆっくり始まった日",
    "ourstory.descProposal": "「これからも一緒に」— そう決めた大切な日",
    "ourstory.dateMarriage": "2025.07.07 <span class=\"lsJP\">(令和7年7月7日)</span>",
    "ourstory.descMarriage": "新しい家族として同じ未来へ",
    "ourstory.descWedding": "皆さまと一緒に迎える特別な一日",
    "rsvp.title": "RSVP",
    "rsvp.lead": "ご出席のご回答は2026年3月22日までにお願いいたします",
    "rsvp.formTitle": "回答フォーム",
    "rsvp.formLead": "ボタンからフォームを開いてご回答ください",
    "rsvp.formButton": "フォームを開く",
    "rsvp.embedTitle": "フォームをここで入力",
    "rsvp.iframeTitle": "RSVP Google Form",
    "rsvp.note": "※期限までにご回答いただけますと幸いです",
    "gallery.title": "Gallery",
    "gallery.prev": "Prev",
    "gallery.next": "Next",
    "gallery.prevAria": "前の写真",
    "gallery.nextAria": "次の写真",
    "schedule.title": "Schedule",
    "schedule.lead": "当日の流れをご案内します",
    "schedule.timelineTitle": "Timeline",
    "schedule.item1.time": "12:30 - 13:00",
    "schedule.item1.title": "受付",
    "schedule.item1.desc": "ラウンジで受付後、お待ちください",
    "schedule.item2.time": "13:30",
    "schedule.item2.title": "挙式",
    "schedule.item2.desc": "チャペルにて挙式を行います",
    "schedule.item3.time": "14:30",
    "schedule.item3.title": "披露宴",
    "schedule.item3.desc": "披露宴会場へご案内します",
    "schedule.item4.time": "16:50頃",
    "schedule.item4.title": "お開き（予定）",
    "schedule.item4.desc": "お開き後は自由解散となります",
    "schedule.note": "尚ご多用中恐縮に存じますが挙式にもご列席賜りたく<br class=\"sp-only\">当日13時までにお越しくださいますようお願い申し上げます",
    "countdown.label": "Countdown",
    "countdown.note": "当日まであと",
    "countdown.date": "2026.05.16 Sat",
    "countdown.days": "日",
    "countdown.hours": "時間",
    "countdown.mins": "分",
    "countdown.secs": "秒",
    "access.title": "Access",
    "access.lead": "会場：<br class=\"sp-only\">NOTRE DOME YOKOHAMA MINATOMIRAI",
    "access.venueTitle": "Venue",
    "access.address1": "〒231-0003<br>神奈川県横浜市中区北仲通6丁目101番",
    "access.address2": "FREE CALL：0120-54-3311<br>CALL：045-228-7756",
    "access.mapsButton": "Google Maps",
    "access.directionsButton": "経路を開く",
    "access.transportTitle": "Public Transport",
    "access.transportItem1": "みなとみらい線「馬車道」駅 2B出口より徒歩3分",
    "access.transportItem2": "JR「桜木町」駅 南改札東口より徒歩7分／市営地下鉄「桜木町」駅 北1口より徒歩9分",
    "access.contactNote": "当日のご連絡は新郎新婦までお願いいたします",
    "access.mapTitle": "Map",
    "access.mapIframeTitle": "NOTRE DOME YOKOHAMA MINATOMIRAI map",
    "faq.title": "FAQ",
    "faq.lead": "よくいただく質問をまとめました",
    "faq.q1": "子ども連れでも大丈夫？",
    "faq.a1": "お子様連れでのご参加も可能です",
    "faq.q2": "写真撮影やSNS投稿は？",
    "faq.a2": "写真撮影・SNS投稿は大歓迎です",
    "faq.q3": "二次会はある？",
    "faq.a3": "二次会については後日更新予定です",
    "footer.backToTop": "Back to Top",
  },
  en: {
    "meta.title": "Wedding Invitation | Fuga & Yume",
    "meta.description": "Fuga Tanaka & Yume - Wedding invitation (web)",
    "meta.ogTitle": "Wedding Invitation | Fuga & Yume",
    "meta.ogDescription": "2026.05.16 Sat / NOTRE DOME YOKOHAMA MINATOMIRAI",
    "loader.title": "Wedding Invitation",
    "loader.subtitle": "Wedding Invitation",
    "loader.previewAlt": "Wedding Invitation",
    "loader.loading": "Loading...",
    "loader.openHint": "Click the seal to open",
    "loader.seal": "Break the wax seal",
    "brand.alt": "Fuga & Yume",
    "nav.topLabel": "Back to top",
    "nav.menu": "Menu",
    "nav.open": "Open menu",
    "nav.close": "Close",
    "nav.closeAria": "Close menu",
    "nav.panel": "On-page links",
    "nav.top": "Top",
    "nav.message": "Message",
    "nav.ourstory": "Our Story",
    "nav.gallery": "Gallery",
    "nav.schedule": "Schedule",
    "nav.access": "Access",
    "nav.rsvp": "RSVP",
    "nav.faq": "FAQ",
    "view.label": "View",
    "view.aria": "View mode",
    "view.menu": "View mode",
    "view.auto": "Auto",
    "view.web": "Web",
    "view.sp": "Sp",
    "hero.poem1": "We are pleased to invite you to our wedding.",
    "hero.poem2": "We look forward to celebrating with you.",
    "hero.rsvp": "RSVP",
    "hero.hint": "Scroll down to continue.",
    "message.title": "Message",
    "message.lead": "We are honored to invite you to our wedding.",
    "message.kinkei": "Dear Guests",
    "message.p1": "We hope you are in good health and spirits.",
    "message.p2": "We are delighted to announce that we will be getting married.",
    "message.p3": "We have arranged a small celebration surrounded by those who have supported us,<br>and would be honored if you could join us despite your busy schedule.",
    "message.p4": "We hope you will enjoy good food and drinks and spend a warm, relaxed time with us.",
    "message.sign": "Sincerely",
    "message.groom": "<b>Groom</b> 田中 楓芽 (Tanaka Fuga)",
    "message.bride": "<b>Bride</b> 柚芽 (Yume)",
    "ourstory.title": "Our Story",
    "ourstory.aria": "Our Story",
    "ourstory.topSmall": "OUR STORY",
    "ourstory.topSub": "ARE GETTING MARRIED!",
    "ourstory.descDating": "The day our story quietly began.",
    "ourstory.descProposal": "The day we promised to walk together from here on.",
    "ourstory.dateMarriage": "2025.07.07 <span class=\"lsJP\">(Reiwa 7/7/7)</span>",
    "ourstory.descMarriage": "Starting a new future as a family.",
    "ourstory.descWedding": "A special day to celebrate with all of you.",
    "rsvp.title": "RSVP",
    "rsvp.lead": "Please RSVP by March 22, 2026.",
    "rsvp.formTitle": "RSVP Form",
    "rsvp.formLead": "Open the form and submit your response.",
    "rsvp.formButton": "Open Form",
    "rsvp.embedTitle": "Fill out the form here",
    "rsvp.iframeTitle": "RSVP Google Form",
    "rsvp.note": "We would appreciate your response by the deadline.",
    "gallery.title": "Gallery",
    "gallery.prev": "Prev",
    "gallery.next": "Next",
    "gallery.prevAria": "Previous photo",
    "gallery.nextAria": "Next photo",
    "schedule.title": "Schedule",
    "schedule.lead": "Here's the schedule for the day.",
    "schedule.timelineTitle": "Timeline",
    "schedule.item1.time": "12:30 - 13:00",
    "schedule.item1.title": "Check-in",
    "schedule.item1.desc": "Please check in at the lounge and wait.",
    "schedule.item2.time": "13:30",
    "schedule.item2.title": "Ceremony",
    "schedule.item2.desc": "The ceremony will be held in the chapel.",
    "schedule.item3.time": "14:30",
    "schedule.item3.title": "Reception",
    "schedule.item3.desc": "We will guide you to the reception hall.",
    "schedule.item4.time": "16:50 (approx.)",
    "schedule.item4.title": "Closing (estimated)",
    "schedule.item4.desc": "Please feel free to depart after closing.",
    "schedule.note": "We respectfully ask that you attend the ceremony as well;<br class=\"sp-only\">please arrive by 13:00 on the day.",
    "countdown.label": "Countdown",
    "countdown.note": "Days to go",
    "countdown.date": "2026.05.16 Sat",
    "countdown.days": "Days",
    "countdown.hours": "Hours",
    "countdown.mins": "Mins",
    "countdown.secs": "Secs",
    "access.title": "Access",
    "access.lead": "Venue:<br class=\"sp-only\">NOTRE DOME YOKOHAMA MINATOMIRAI",
    "access.venueTitle": "Venue",
    "access.address1": "231-0003<br>6-101 Kitanakadori, Naka-ku, Yokohama, Kanagawa",
    "access.address2": "FREE CALL: 0120-54-3311<br>CALL: 045-228-7756",
    "access.mapsButton": "Google Maps",
    "access.directionsButton": "Open directions",
    "access.transportTitle": "Public Transport",
    "access.transportItem1": "3-minute walk from Bashamichi Station (Minatomirai Line), Exit 2B.",
    "access.transportItem2": "7-minute walk from JR Sakuragicho Station (South Gate East Exit) / 9-minute walk from Sakuragicho Station (Municipal Subway), Exit North 1.",
    "access.contactNote": "For same-day inquiries, please contact the bride or groom directly.",
    "access.mapTitle": "Map",
    "access.mapIframeTitle": "NOTRE DOME YOKOHAMA MINATOMIRAI map",
    "faq.title": "FAQ",
    "faq.lead": "Answers to common questions.",
    "faq.q1": "Is it okay to bring children?",
    "faq.a1": "Children are welcome.",
    "faq.q2": "Photos and social media posts?",
    "faq.a2": "Photos and social media posts are welcome.",
    "faq.q3": "Will there be an after-party?",
    "faq.a3": "We will update about the after-party later.",
    "footer.backToTop": "Back to Top",
  },
};

function t(key){
  const table = I18N[currentLang] || {};
  if(Object.prototype.hasOwnProperty.call(table, key)) return table[key];
  const fallback = I18N.ja || {};
  if(Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
  return key;
}

function applyLang(nextLang, { save = true } = {}){
  const lang = LANGS.includes(nextLang) ? nextLang : "ja";
  currentLang = lang;
  document.documentElement.setAttribute("lang", lang);

  const title = t("meta.title");
  if(title) document.title = title;

  const metaDesc = document.querySelector('meta[name="description"]');
  if(metaDesc) metaDesc.setAttribute("content", t("meta.description"));

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if(ogTitle) ogTitle.setAttribute("content", t("meta.ogTitle"));

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if(ogDesc) ogDesc.setAttribute("content", t("meta.ogDescription"));

  $$("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    if(!key) return;
    el.textContent = t(key);
  });

  $$("[data-i18n-html]").forEach((el) => {
    const key = el.dataset.i18nHtml;
    if(!key) return;
    el.innerHTML = t(key);
  });

  $$("[data-i18n-attr]").forEach((el) => {
    const spec = el.dataset.i18nAttr;
    if(!spec) return;
    spec.split(",").forEach((pair) => {
      const [attr, key] = pair.split(":").map((part) => part.trim());
      if(!attr || !key) return;
      el.setAttribute(attr, t(key));
    });
  });

  if(langToggle){
    const buttons = Array.from(langToggle.querySelectorAll("button[data-lang]"));
    buttons.forEach((btn) => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  if(loaderStatus){
    const nextStatus = assetsReady ? t("loader.openHint") : t("loader.loading");
    setLoaderStatus(nextStatus);
  }

  if(save){
    try{
      localStorage.setItem(LANG_KEY, lang);
    }catch(e){
      // ignore storage errors
    }
  }
}

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
  setLoaderStatus(t("loader.loading"));

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
  setLoaderStatus(t("loader.openHint"));
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
const MOBILE_BASE_WIDTH = 390;
const MOBILE_BASE_SCALE = 0.8;
const MOBILE_MIN_SCALE = 0.6;
const MOBILE_TINY_WIDTH = 360;
const MOBILE_TINY_SCALE = 0.92;

function updateMobileScale(){
  const view = document.documentElement.getAttribute("data-view");
  const isMobileView = view === "mobile" || (!view && window.matchMedia("(max-width: 700px)").matches);

  if(!isMobileView){
    document.documentElement.classList.remove("is-mobile-scale");
    document.documentElement.style.setProperty("--mobile-scale", "1");
    return;
  }

  const width = window.innerWidth || MOBILE_BASE_WIDTH;
  const rawScale = width / MOBILE_BASE_WIDTH;
  const extraScale = width <= MOBILE_TINY_WIDTH ? MOBILE_TINY_SCALE : 1;
  const scale = rawScale * MOBILE_BASE_SCALE * extraScale;
  const clamped = Math.min(1, Math.max(MOBILE_MIN_SCALE, scale));

  document.documentElement.classList.add("is-mobile-scale");
  document.documentElement.style.setProperty("--mobile-scale", clamped.toFixed(4));
}

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

  updateMobileScale();
}

function setupViewToggle(){
  if(!viewToggle) return;
  const buttons = Array.from(viewToggle.querySelectorAll("button[data-view]"));
  if(!buttons.length) return;

  const setOpen = (next) => {
    viewToggle.classList.toggle("is-open", next);
    if(viewToggleBtn){
      viewToggleBtn.setAttribute("aria-expanded", next ? "true" : "false");
    }
  };

  let saved = "auto";
  try{
    saved = localStorage.getItem(VIEW_KEY) || "auto";
  }catch(e){
    saved = "auto";
  }
  applyViewMode(saved);

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyViewMode(btn.dataset.view);
      setOpen(false);
    });
  });

  if(viewToggleBtn && viewToggleMenu){
    viewToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setOpen(!viewToggle.classList.contains("is-open"));
    });

    document.addEventListener("click", (e) => {
      if(viewToggle.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape") setOpen(false);
    });
  }
}

/* ================= Language toggle ================= */
function setupLangToggle(){
  const buttons = langToggle ? Array.from(langToggle.querySelectorAll("button[data-lang]")) : [];

  let saved = "ja";
  try{
    saved = localStorage.getItem(LANG_KEY) || "";
  }catch(e){
    saved = "";
  }

  if(!LANGS.includes(saved)){
    const browserLang = (navigator.language || "").toLowerCase();
    saved = browserLang.startsWith("en") ? "en" : "ja";
  }

  applyLang(saved, { save: false });

  if(!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      applyLang(btn.dataset.lang);
    });
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

/* ================= Countdown ================= */
function setupCountdown(){
  const roots = $$(".countdownCard[data-countdown]");
  if(!roots.length) return;

  roots.forEach((root) => {
    const targetRaw = root.getAttribute("data-target");
    if(!targetRaw) return;

    const target = new Date(targetRaw);
    if(Number.isNaN(target.getTime())) return;

    const parts = {
      days: root.querySelector("[data-countdown-value='days']"),
      hours: root.querySelector("[data-countdown-value='hours']"),
      mins: root.querySelector("[data-countdown-value='mins']"),
      secs: root.querySelector("[data-countdown-value='secs']"),
    };

    const last = {};

    const format = (key, value) => {
      if(key === "days") return String(value);
      return String(value).padStart(2, "0");
    };

    const tick = () => {
      const now = new Date();
      let diff = target.getTime() - now.getTime();
      if(diff < 0) diff = 0;

      const total = Math.floor(diff / 1000);
      const days = Math.floor(total / 86400);
      const hours = Math.floor((total % 86400) / 3600);
      const mins = Math.floor((total % 3600) / 60);
      const secs = total % 60;

      const values = { days, hours, mins, secs };
      Object.keys(values).forEach((key) => {
        const el = parts[key];
        if(!el) return;
        const next = format(key, values[key]);
        if(last[key] === next) return;
        last[key] = next;
        el.textContent = next;
        if(!prefersReduced){
          el.classList.remove("is-tick");
          void el.offsetWidth;
          el.classList.add("is-tick");
        }
      });

      if(diff === 0){
        root.classList.add("is-done");
      }
    };

    tick();
    setInterval(tick, 1000);
  });
}

/* ================= Boot ================= */
(async function boot(){
  // ✅ 初期背景（Hero）を必ずセット
  bgA.style.backgroundImage = `url("${BG[0]}")`;

  setupLangToggle();
  setupNav();
  setupViewToggle();
  updateMobileScale();
  window.addEventListener("resize", () => {
    if(scaleRaf) cancelAnimationFrame(scaleRaf);
    scaleRaf = requestAnimationFrame(updateMobileScale);
  });
  setupReveal();
  setupBgSwitch();
  setupCoverflow();
  setupImgFallback();
  setupCountdown();
  setupLetterLoader();

  // grain は重い端末もあるので、減速環境はOFFにできるように
  if(prefersReduced){
    const grain = $("#grain");
    grain && (grain.style.display = "none");
  }

  await preloadAssets();
})();
