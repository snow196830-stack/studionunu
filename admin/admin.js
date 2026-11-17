/* =========================================================
   STUDIO NUNU — 관리자 페이지 (admin.js)
   - data/content.json 을 읽어 폼으로 그리고,
     GitHub Contents API 로 커밋해 GitHub Pages 에 반영한다.
   - 공개 코드에는 토큰·비밀번호를 넣지 않는다.
     토큰은 원장님이 최초 1회 입력 → 이 브라우저(localStorage)에만 저장.
     (선택) PIN 잠금: PBKDF2 + AES-GCM 으로 암호화해 저장.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 설정 ---------- */
  var qs = new URLSearchParams(location.search);
  var OWNER = "snow196830-stack";
  var REPO = "studionunu";
  var FILE_PATH = "data/content.json";
  var BRANCH = "main";
  var API = (qs.get("api") || "https://api.github.com").replace(/\/$/, "");
  var LIVE = qs.get("live") || "https://snow196830-stack.github.io/studionunu/data/content.json";

  var KEY_TOKEN = "nunu-admin-token";
  var KEY_TOKEN_PIN = "nunu-admin-token-pin";
  var KEY_CONTENT_V = "nunu-content-v";

  var LANGS = ["kr", "jp", "en"];
  var LANG_NAME = { kr: "한국어", jp: "日本語", en: "English" };

  var state = {
    content: null,
    pristine: null,
    lang: "kr",
    token: null,
    sha: null,
    dirty: false,
    saving: false,
    loadFailed: false
  };

  /* ---------- 작은 도구 ---------- */
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, text) {
    var n = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") n.className = attrs[k];
        else if (k === "hidden") n.hidden = !!attrs[k];
        else n.setAttribute(k, attrs[k]);
      });
    }
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function nowISO() { return new Date().toISOString(); }
  function fmtDate(iso) {
    if (!iso) return "기록 없음";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "." + p(d.getMonth() + 1) + "." + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  /* ---------- content 모델 접근 ---------- */
  function pickText(obj, lang) {
    if (obj === null || obj === undefined) return "";
    if (typeof obj === "string" || typeof obj === "number") return String(obj);
    if (obj[lang] !== undefined && obj[lang] !== null) return String(obj[lang]);
    if (obj.jp !== undefined && obj.jp !== null) return String(obj.jp);
    return "";
  }
  function rawText(obj, lang) {
    if (obj === null || obj === undefined) return "";
    if (typeof obj === "string" || typeof obj === "number") return String(obj);
    return obj[lang] === undefined || obj[lang] === null ? "" : String(obj[lang]);
  }
  function getPath(path) {
    var parts = path.split("."), cur = state.content;
    for (var i = 0; i < parts.length; i++) {
      if (cur === null || cur === undefined) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }
  function parentOf(path) {
    var parts = path.split("."), cur = state.content;
    for (var i = 0; i < parts.length - 1; i++) {
      if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
      cur = cur[parts[i]];
    }
    return { obj: cur, key: parts[parts.length - 1] };
  }
  function ensureText(path) {
    var p = parentOf(path), cur = p.obj[p.key];
    if (typeof cur !== "object" || cur === null) {
      p.obj[p.key] = { jp: cur === undefined || cur === null ? "" : String(cur), kr: "", en: "" };
    } else {
      LANGS.forEach(function (l) { if (cur[l] === undefined || cur[l] === null) cur[l] = ""; });
    }
    return p.obj[p.key];
  }
  function setText(path, lang, val) { ensureText(path)[lang] = val; }
  function setString(path, val) { var p = parentOf(path); p.obj[p.key] = val; }

  /* ---------- 공통 UI ---------- */
  function markDirty() {
    state.dirty = true;
    $("saveStatus").className = "savebar__status is-dirty";
    $("saveStatus").textContent = "저장되지 않은 변경사항이 있습니다";
  }
  function setStatus(msg, kind, ratio) {
    var s = $("saveStatus");
    s.className = "savebar__status" + (kind ? " is-" + kind : "");
    s.textContent = msg;
  }
  function setConn(ok, text) {
    var d = $("connDot");
    d.className = "dot" + (ok === true ? " is-ok" : ok === "warn" ? " is-warn" : ok === false ? " is-bad" : "");
    $("connText").textContent = text;
  }
  function setGateAlert(msg, kind) {
    var a = $("gateAlert");
    if (!msg) { a.hidden = true; return; }
    a.hidden = false;
    a.className = "alert" + (kind ? " is-" + kind : "");
    a.textContent = msg;
  }

  /* ---------- 텍스트 필드 ---------- */
  var TEXT_FIELDS = {
    basic: [
      { path: "notice.text", label: "상단 공지바 — 긴 문구", hint: "PC·태블릿에서 보입니다. 예: 서울 강남점 상시 예약 가능｜도쿄·오사카 출장 예약 접수 중" },
      { path: "notice.short", label: "상단 공지바 — 짧은 문구", hint: "휴대폰에서 보입니다. 예: 서울 강남 · 도쿄 · 오사카" },
      { path: "hero.eyebrow", label: "히어로 — 작은 영문 줄", hint: "첫 화면 제목 위의 영문입니다." },
      { path: "hero.title", label: "히어로 — 큰 제목", multiline: true, hint: "줄을 바꾸려면 <br> 을 넣으세요." },
      { path: "hero.lead", label: "히어로 — 소개 문단", multiline: true },
      { path: "hero.note", label: "히어로 — 제목 아래 한 줄 안내" },
      { path: "hero.badge", label: "사진 위 1:1 배지 문구", hint: "줄을 바꾸려면 <br> 을 넣으세요." }
    ],
    visit: [
      { path: "visit.address", label: "주소 (첫 줄)" },
      { path: "visit.addressNote", label: "주소 보조 설명", hint: "역·출구·도보 시간 등" },
      { path: "visit.hours", label: "영업시간", hint: "예: 매일 10:00–20:00 (일요일 휴무)" },
      { path: "visit.parking", label: "주차 안내", hint: "예: 건물 지하 1시간 무료, 이후 10분당 1,000원" },
      { path: "visit.priceNote", label: "가격 안내 문구", hint: "메뉴별 가격을 적지 않을 때 보이는 문구입니다." },
      { path: "visit.trip", label: "출장 시술 안내" }
    ],
    menuHead: [
      { path: "menu.title", label: "섹션 제목", hint: "예: 시그니처 / Signature" },
      { path: "menu.lead", label: "섹션 설명", multiline: true }
    ]
  };

  function textField(spec) {
    var wrap = el("div", { class: "field" });
    var id = "f-" + spec.path.replace(/\./g, "-");
    wrap.appendChild(el("label", { class: "field__label", for: id }, spec.label));
    var input = spec.multiline
      ? el("textarea", { class: "textarea", id: id, rows: "3" })
      : el("input", { class: "input", id: id, type: "text" });
    input.value = rawText(getPath(spec.path), state.lang);
    input.addEventListener("input", function () {
      setText(spec.path, state.lang, input.value);
      markDirty();
    });
    wrap.appendChild(input);
    if (spec.hint) wrap.appendChild(el("p", { class: "field__hint" }, spec.hint));
    return wrap;
  }

  function renderFields(containerId, specs) {
    var box = $(containerId);
    box.innerHTML = "";
    specs.forEach(function (s) { box.appendChild(textField(s)); });
  }

  /* ---------- 링크 필드 ---------- */
  function urlField(spec) {
    var wrap = el("div", { class: "field" });
    var id = "f-" + spec.path.replace(/\./g, "-");
    wrap.appendChild(el("label", { class: "field__label", for: id }, spec.label));
    var input = el("input", { class: "input", id: id, type: "url", spellcheck: "false", placeholder: "https://" });
    input.value = getPath(spec.path) || "";
    input.addEventListener("input", function () {
      setString(spec.path, input.value.trim());
      markDirty();
      input.style.borderColor = "";
    });
    input.addEventListener("blur", function () {
      var v = input.value.trim();
      var ok = /^https?:\/\/\S+$/i.test(v);
      input.style.borderColor = ok ? "" : "#c9634f";
    });
    wrap.appendChild(input);
    wrap.appendChild(el("p", { class: "field__hint" }, spec.hint || ""));
    return wrap;
  }

  /* ---------- 메뉴 ---------- */
  var IMAGE_CHOICES = [
    "assets/post-01.jpg", "assets/post-02.jpg", "assets/post-03.jpg", "assets/post-04.jpg",
    "assets/post-06.jpg", "assets/post-07.jpg", "assets/post-08.jpg", "assets/post-09.jpg",
    "assets/post-10.jpg", "assets/post-11.jpg", "assets/post-12.jpg",
    "assets/combo-brow.jpg", "assets/hero-lip.jpg", "assets/lip-art-makeup.jpg", "assets/profile.jpg"
  ];

  function moveItem(arr, i, dir) {
    var j = i + dir;
    if (j < 0 || j >= arr.length) return;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    markDirty();
    renderAll();
  }

  function itemTools(arr, i) {
    var tools = el("div", { class: "item__tools" });
    var up = el("button", { type: "button", class: "iconbtn", "aria-label": "위로" }, "↑");
    up.disabled = i === 0;
    up.addEventListener("click", function () { moveItem(arr, i, -1); });
    var down = el("button", { type: "button", class: "iconbtn", "aria-label": "아래로" }, "↓");
    down.disabled = i === arr.length - 1;
    down.addEventListener("click", function () { moveItem(arr, i, 1); });
    var del = el("button", { type: "button", class: "iconbtn iconbtn--danger", "aria-label": "삭제" }, "✕");
    del.addEventListener("click", function () {
      if (!confirm("이 항목을 목록에서 뺄까요? (저장 전에는 홈페이지에 반영되지 않습니다)")) return;
      arr.splice(i, 1);
      markDirty();
      renderAll();
    });
    tools.appendChild(up); tools.appendChild(down); tools.appendChild(del);
    return tools;
  }

  function thumbFor(src) {
    if (!src) return el("div", { class: "thumb thumb--empty" }, "이미지");
    var img = el("img", { class: "thumb", alt: "", loading: "lazy" });
    img.src = src.indexOf("http") === 0 ? src : "../" + src;
    img.addEventListener("error", function () {
      img.replaceWith(el("div", { class: "thumb thumb--empty" }, "없음"));
    });
    return img;
  }

  function menuItemEl(item, i, arr) {
    var card = el("div", { class: "item" });
    var head = el("div", { class: "item__head" });
    head.appendChild(el("span", { class: "item__no" }, "메뉴 " + (i + 1)));
    head.appendChild(el("span", { class: "item__name" }, pickText(item.name, state.lang) || "(이름 없음)"));
    head.appendChild(itemTools(arr, i));
    card.appendChild(head);

    var grid = el("div", { class: "item__grid" });

    /* 이미지 */
    var imgField = el("div", { class: "field" });
    imgField.appendChild(el("label", { class: "field__label" }, "사진 경로"));
    var row = el("div", { class: "field__row" });
    row.appendChild(thumbFor(item.image));
    var imgInput = el("input", { class: "input input--sm", type: "text", list: "imageChoices", spellcheck: "false" });
    imgInput.value = item.image || "";
    imgInput.placeholder = "assets/post-01.jpg";
    imgInput.addEventListener("input", function () {
      item.image = imgInput.value.trim();
      markDirty();
      var next = thumbFor(item.image);
      row.replaceChild(next, row.firstChild);
    });
    row.appendChild(imgInput);
    imgField.appendChild(row);
    imgField.appendChild(el("p", { class: "field__hint" }, "저장소 assets/ 안의 파일명 또는 https:// 이미지 주소"));
    grid.appendChild(imgField);

    /* 영문 라벨 */
    var labField = el("div", { class: "field" });
    labField.appendChild(el("label", { class: "field__label" }, "영문 라벨 (카드 위 작은 글씨)"));
    var labInput = el("input", { class: "input", type: "text", spellcheck: "false" });
    labInput.value = item.label || "";
    labInput.placeholder = "Lip";
    labInput.addEventListener("input", function () { item.label = labInput.value.trim(); markDirty(); });
    labField.appendChild(labInput);
    labField.appendChild(el("p", { class: "field__hint" }, "예: Lip · Brow · Eye-line · Hairline"));
    grid.appendChild(labField);

    card.appendChild(grid);

    /* 언어별 이름·설명·가격 */
    var grid2 = el("div", { class: "item__grid" });
    ensureItemText(item, "name"); ensureItemText(item, "desc"); ensureItemText(item, "price");

    var nameField = el("div", { class: "field" });
    nameField.appendChild(el("label", { class: "field__label" }, "이름 (" + LANG_NAME[state.lang] + ")"));
    var nameInput = el("input", { class: "input", type: "text" });
    nameInput.value = item.name[state.lang] || "";
    nameInput.addEventListener("input", function () {
      item.name[state.lang] = nameInput.value;
      markDirty();
      head.querySelector(".item__name").textContent = pickText(item.name, state.lang) || "(이름 없음)";
    });
    nameField.appendChild(nameInput);
    grid2.appendChild(nameField);

    var priceField = el("div", { class: "field" });
    priceField.appendChild(el("label", { class: "field__label" }, "가격 (" + LANG_NAME[state.lang] + ")"));
    var priceInput = el("input", { class: "input", type: "text" });
    priceInput.value = item.price[state.lang] || "";
    priceInput.placeholder = state.lang === "jp" ? "例: ¥30,000〜" : state.lang === "en" ? "e.g. from JPY 30,000" : "예: 30만 원부터";
    priceInput.addEventListener("input", function () { item.price[state.lang] = priceInput.value; markDirty(); });
    priceField.appendChild(priceInput);
    priceField.appendChild(el("p", { class: "field__hint" }, "비우면 홈페이지에 가격 줄이 나오지 않습니다."));
    grid2.appendChild(priceField);
    card.appendChild(grid2);

    var descField = el("div", { class: "field" });
    descField.appendChild(el("label", { class: "field__label" }, "설명 (" + LANG_NAME[state.lang] + ")"));
    var descInput = el("textarea", { class: "textarea", rows: "3" });
    descInput.value = item.desc[state.lang] || "";
    descInput.addEventListener("input", function () { item.desc[state.lang] = descInput.value; markDirty(); });
    descField.appendChild(descInput);
    card.appendChild(descField);

    return card;
  }

  function ensureItemText(item, key) {
    if (typeof item[key] !== "object" || item[key] === null) {
      item[key] = { jp: item[key] == null ? "" : String(item[key]), kr: "", en: "" };
    }
    LANGS.forEach(function (l) { if (item[key][l] === undefined || item[key][l] === null) item[key][l] = ""; });
  }

  function renderMenu() {
    var list = $("menuList");
    list.innerHTML = "";
    var items = state.content.menu.items;
    if (!items.length) {
      list.appendChild(el("p", { class: "tagline" }, "메뉴가 없습니다. 아래 ‘+ 메뉴 추가’로 만드세요."));
    }
    items.forEach(function (item, i) { list.appendChild(menuItemEl(item, i, items)); });

    /* ReturnPink 블록 */
    var rpBox = $("returnPinkCard");
    rpBox.innerHTML = "";
    var rp = state.content.menu.returnPink;
    if (!rp || typeof rp !== "object") return;
    ensureItemText(rp, "name"); ensureItemText(rp, "desc"); ensureItemText(rp, "price");

    var card = el("div", { class: "item" });
    var head = el("div", { class: "item__head" });
    head.appendChild(el("span", { class: "item__no" }, "리턴핑크 블록"));
    head.appendChild(el("span", { class: "item__name" }, pickText(rp.name, state.lang) || "ReturnPink"));
    card.appendChild(head);
    card.appendChild(el("p", { class: "field__hint" }, "메뉴 카드 아래 넓은 블록입니다. 비우면 홈페이지에서 사라지지 않고 기본 문구가 남습니다."));

    var nameField = el("div", { class: "field" });
    nameField.appendChild(el("label", { class: "field__label" }, "이름 (" + LANG_NAME[state.lang] + ")"));
    var nameInput = el("input", { class: "input", type: "text" });
    nameInput.value = rp.name[state.lang] || "";
    nameInput.addEventListener("input", function () {
      rp.name[state.lang] = nameInput.value;
      markDirty();
      head.querySelector(".item__name").textContent = pickText(rp.name, state.lang) || "ReturnPink";
    });
    nameField.appendChild(nameInput);
    card.appendChild(nameField);

    var priceField = el("div", { class: "field" });
    priceField.appendChild(el("label", { class: "field__label" }, "가격 (" + LANG_NAME[state.lang] + ")"));
    var priceInput = el("input", { class: "input", type: "text" });
    priceInput.value = rp.price[state.lang] || "";
    priceInput.addEventListener("input", function () { rp.price[state.lang] = priceInput.value; markDirty(); });
    priceField.appendChild(priceInput);
    card.appendChild(priceField);

    var descField = el("div", { class: "field" });
    descField.appendChild(el("label", { class: "field__label" }, "설명 (" + LANG_NAME[state.lang] + ")"));
    var descInput = el("textarea", { class: "textarea", rows: "3" });
    descInput.value = rp.desc[state.lang] || "";
    descInput.addEventListener("input", function () { rp.desc[state.lang] = descInput.value; markDirty(); });
    descField.appendChild(descInput);
    card.appendChild(descField);

    rpBox.appendChild(card);
  }

  /* ---------- 릴스 ---------- */
  function reelItemEl(reel, i, arr) {
    var card = el("div", { class: "item" });
    var head = el("div", { class: "item__head" });
    head.appendChild(el("span", { class: "item__no" }, "릴스 " + (i + 1)));
    head.appendChild(el("span", { class: "item__name" }, pickText(reel.title, state.lang) || "(제목 없음)"));
    head.appendChild(itemTools(arr, i));
    card.appendChild(head);

    var titleField = el("div", { class: "field" });
    titleField.appendChild(el("label", { class: "field__label" }, "제목 (" + LANG_NAME[state.lang] + ")"));
    var titleInput = el("input", { class: "input", type: "text" });
    titleInput.value = rawText(reel.title, state.lang);
    titleInput.addEventListener("input", function () {
      ensureItemText(reel, "title");
      reel.title[state.lang] = titleInput.value;
      markDirty();
      head.querySelector(".item__name").textContent = pickText(reel.title, state.lang) || "(제목 없음)";
    });
    titleField.appendChild(titleInput);
    card.appendChild(titleField);

    var descField = el("div", { class: "field" });
    descField.appendChild(el("label", { class: "field__label" }, "설명 (" + LANG_NAME[state.lang] + ")"));
    var descInput = el("textarea", { class: "textarea", rows: "2" });
    descInput.value = rawText(reel.desc, state.lang);
    descInput.addEventListener("input", function () {
      ensureItemText(reel, "desc");
      reel.desc[state.lang] = descInput.value;
      markDirty();
    });
    descField.appendChild(descInput);
    card.appendChild(descField);

    var urlFieldBox = el("div", { class: "field" });
    urlFieldBox.appendChild(el("label", { class: "field__label" }, "릴스 주소"));
    var urlInput = el("input", { class: "input", type: "url", spellcheck: "false" });
    urlInput.value = reel.url || "";
    urlInput.placeholder = "https://www.instagram.com/reel/…/";
    urlInput.addEventListener("input", function () { reel.url = urlInput.value.trim(); markDirty(); });
    urlFieldBox.appendChild(urlInput);
    card.appendChild(urlFieldBox);

    var adv = el("details", { class: "item__sub" });
    adv.appendChild(el("summary", null, "고급 — 영상·썸네일 파일 경로"));
    var advGrid = el("div", { class: "item__grid item__grid--2" });

    var vidField = el("div", { class: "field" });
    vidField.appendChild(el("label", { class: "field__label" }, "영상 경로"));
    var vidInput = el("input", { class: "input input--sm", type: "text", spellcheck: "false", placeholder: "assets/reel-xxxx.mp4" });
    vidInput.value = reel.video || "";
    vidInput.addEventListener("input", function () { reel.video = vidInput.value.trim(); markDirty(); });
    vidField.appendChild(vidInput);
    advGrid.appendChild(vidField);

    var posField = el("div", { class: "field" });
    posField.appendChild(el("label", { class: "field__label" }, "썸네일 경로"));
    var posInput = el("input", { class: "input input--sm", type: "text", spellcheck: "false", placeholder: "assets/reel-xxxx.jpg" });
    posInput.value = reel.poster || "";
    posInput.addEventListener("input", function () { reel.poster = posInput.value.trim(); markDirty(); });
    posField.appendChild(posInput);
    advGrid.appendChild(posField);

    adv.appendChild(advGrid);
    adv.appendChild(el("p", { class: "field__hint" }, "영상을 비우면 썸네일만 보이는 카드가 됩니다. 둘 다 비우면 브랜드 자리 표시가 나옵니다."));
    card.appendChild(adv);

    return card;
  }

  function renderReels() {
    var list = $("reelList");
    list.innerHTML = "";
    var reels = state.content.reels;
    if (!reels.length) {
      list.appendChild(el("p", { class: "tagline" }, "릴스가 없습니다. 아래 ‘+ 릴스 추가’로 만드세요."));
      return;
    }
    reels.forEach(function (r, i) {
      ensureItemText(r, "title"); ensureItemText(r, "desc");
      list.appendChild(reelItemEl(r, i, reels));
    });
  }

  /* ---------- 전체 렌더 ---------- */
  function renderAll() {
    renderFields("fieldsBasic", TEXT_FIELDS.basic);
    renderFields("fieldsVisit", TEXT_FIELDS.visit);
    renderFields("fieldsMenuHead", TEXT_FIELDS.menuHead);
    renderChannels();
    renderMenu();
    renderReels();
    updateMeta();
  }

  function renderChannels() {
    var box = $("fieldsChannels");
    box.innerHTML = "";
    box.appendChild(urlField({ path: "channels.line", label: "LINE 예약 주소", hint: "예: https://line.me/R/ti/p/@362hsrxc" }));
    box.appendChild(urlField({ path: "channels.kakao", label: "카카오톡 채널 주소", hint: "예: https://pf.kakao.com/_DPDxib" }));
    box.appendChild(urlField({ path: "channels.instagram", label: "인스타그램 주소", hint: "예: https://www.instagram.com/studio_nunu___" }));
    box.appendChild(urlField({ path: "visit.mapUrl", label: "지도(카카오맵) 주소", hint: "‘오시는 길’의 지도 버튼과 푸터 링크에 쓰입니다." }));
  }

  function updateMeta() {
    var c = state.content;
    var items = (c.menu && Array.isArray(c.menu.items)) ? c.menu.items.length : 0;
    var reels = Array.isArray(c.reels) ? c.reels.length : 0;
    $("metaInfo").textContent = "메뉴 " + items + "개 · 릴스 " + reels + "개 · 마지막 저장 " + fmtDate(c.updatedAt);
  }

  /* ---------- 데이터 정규화 ---------- */
  function normalize(c) {
    c = (c && typeof c === "object") ? c : {};
    ["notice", "hero", "visit", "channels", "menu"].forEach(function (k) {
      if (typeof c[k] !== "object" || c[k] === null) c[k] = {};
    });
    ["notice.text", "notice.short", "hero.eyebrow", "hero.title", "hero.lead", "hero.note", "hero.badge",
      "visit.address", "visit.addressNote", "visit.hours", "visit.parking", "visit.priceNote", "visit.trip",
      "menu.title", "menu.lead"].forEach(function (p) {
      var parts = p.split("."), cur = c;
      for (var i = 0; i < parts.length - 1; i++) {
        if (typeof cur[parts[i]] !== "object" || cur[parts[i]] === null) cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      var last = parts[parts.length - 1];
      if (typeof cur[last] !== "object" || cur[last] === null) {
        cur[last] = { jp: cur[last] == null ? "" : String(cur[last]), kr: "", en: "" };
      }
      LANGS.forEach(function (l) { if (cur[last][l] === undefined || cur[last][l] === null) cur[last][l] = ""; });
    });
    ["line", "kakao", "instagram"].forEach(function (k) {
      if (typeof c.channels[k] !== "string") c.channels[k] = "";
    });
    if (typeof c.visit.mapUrl !== "string") c.visit.mapUrl = "";
    if (!Array.isArray(c.menu.items)) c.menu.items = [];
    c.menu.items.forEach(function (it) {
      if (typeof it !== "object" || it === null) return;
      it.id = it.id || ("menu-" + Math.random().toString(36).slice(2, 7));
      if (typeof it.label !== "string") it.label = "";
      if (typeof it.image !== "string") it.image = "";
      ["name", "desc", "price"].forEach(function (k) {
        if (typeof it[k] !== "object" || it[k] === null) it[k] = { jp: it[k] == null ? "" : String(it[k]), kr: "", en: "" };
        LANGS.forEach(function (l) { if (it[k][l] === undefined || it[k][l] === null) it[k][l] = ""; });
      });
    });
    if (typeof c.menu.returnPink !== "object" || c.menu.returnPink === null) {
      c.menu.returnPink = { label: "ReturnPink", name: { jp: "", kr: "", en: "" }, desc: { jp: "", kr: "", en: "" }, price: { jp: "", kr: "", en: "" } };
    }
    if (!Array.isArray(c.reels)) c.reels = [];
    c.reels.forEach(function (r) {
      if (typeof r !== "object" || r === null) return;
      r.id = r.id || ("reel-" + Math.random().toString(36).slice(2, 7));
      ["url", "video", "poster"].forEach(function (k) { if (typeof r[k] !== "string") r[k] = ""; });
      ["title", "desc"].forEach(function (k) {
        if (typeof r[k] !== "object" || r[k] === null) r[k] = { jp: r[k] == null ? "" : String(r[k]), kr: "", en: "" };
        LANGS.forEach(function (l) { if (r[k][l] === undefined || r[k][l] === null) r[k][l] = ""; });
      });
    });
    if (typeof c.updatedAt !== "string") c.updatedAt = "";
    if (typeof c.version !== "number") c.version = 1;
    return c;
  }

  /* ---------- GitHub ---------- */
  function hdrs(token) {
    var h = { "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (token) h.Authorization = "Bearer " + token;
    return h;
  }
  function ghMessage(status) {
    if (status === 401) return "토큰이 유효하지 않습니다. 새 토큰으로 다시 연결해 주세요.";
    if (status === 403) return "권한이 없거나 요청 한도를 넘었습니다. 토큰의 ‘Contents: Read and write’ 권한을 확인해 주세요.";
    if (status === 404) return "저장소나 파일을 찾을 수 없습니다. 토큰의 저장소 접근 범위(snow196830-stack/studionunu)를 확인해 주세요.";
    if (status === 409) return "다른 곳에서 먼저 저장되었습니다. 다시 시도해 주세요.";
    if (status === 422) return "GitHub가 이 내용을 받아들이지 않았습니다(422). 잠시 후 다시 시도해 주세요.";
    return "GitHub 오류 (" + status + ")";
  }
  async function ghJson(url, opts) {
    var res = await fetch(url, opts);
    if (!res.ok) {
      var detail = "";
      try { var j = await res.json(); detail = j && j.message ? " — " + j.message : ""; } catch (e) {}
      var err = new Error(ghMessage(res.status) + detail);
      err.status = res.status;
      throw err;
    }
    return res.json();
  }
  async function verifyToken(token) {
    var d = await ghJson(API + "/repos/" + OWNER + "/" + REPO, { headers: hdrs(token), cache: "no-store" });
    var perm = d.permissions || {};
    if (!(perm.push || perm.admin || perm.maintain)) {
      throw new Error("이 토큰으로는 저장할 수 없습니다. Permissions → Contents: Read and write 로 다시 만들어 주세요.");
    }
    return d;
  }

  function b64encodeUtf8(str) {
    var bytes = new TextEncoder().encode(str);
    var out = "";
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      out += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(out);
  }
  function b64decodeUtf8(b64) {
    var bin = atob(String(b64).replace(/\s/g, ""));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  /* ---------- PIN 잠금 (WebCrypto) ---------- */
  function subtleOk() { return !!(window.crypto && window.crypto.subtle && window.isSecureContext); }
  function toB64(bytes) { return btoa(String.fromCharCode.apply(null, bytes)); }
  function fromB64(s) { var bin = atob(s); var a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
  async function deriveKey(pin, salt) {
    var base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: salt, iterations: 200000, hash: "SHA-256" },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]
    );
  }
  async function encryptToken(token, pin) {
    var salt = crypto.getRandomValues(new Uint8Array(16));
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var key = await deriveKey(pin, salt);
    var ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, key, new TextEncoder().encode(token));
    return { v: 1, salt: toB64(salt), iv: toB64(iv), ct: toB64(new Uint8Array(ct)) };
  }
  async function decryptToken(blob, pin) {
    var key = await deriveKey(pin, fromB64(blob.salt));
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromB64(blob.iv) }, key, fromB64(blob.ct));
    return new TextDecoder().decode(pt);
  }

  /* ---------- 로그인 게이트 ---------- */
  function showGate() {
    $("gate").hidden = false;
    $("pinGate").hidden = true;
    $("editor").hidden = true;
    $("savebar").hidden = true;
    $("lockBtn").hidden = true;
    setConn(null, "토큰 연결 전");
  }
  function showPinGate() {
    $("gate").hidden = true;
    $("pinGate").hidden = false;
    $("editor").hidden = true;
    $("savebar").hidden = true;
    $("lockBtn").hidden = true;
    setConn("warn", "PIN 잠금");
  }
  function enterEditor() {
    $("gate").hidden = true;
    $("pinGate").hidden = true;
    $("editor").hidden = false;
    $("savebar").hidden = false;
    $("lockBtn").hidden = !state.token;
    if (state.token) {
      setConn(true, "GitHub 연결됨 · 저장 가능");
      $("saveBtn").textContent = "저장 및 홈페이지 반영";
    } else {
      setConn("warn", "토큰 없이 편집 중 · 저장 불가");
      $("saveBtn").textContent = "토큰 연결하고 저장";
    }
    setStatus(state.dirty ? "저장되지 않은 변경사항이 있습니다" : "변경사항 없음", state.dirty ? "dirty" : "");
  }

  async function onConnect(ev) {
    ev.preventDefault();
    var token = $("tokenInput").value.trim();
    if (!token) { setGateAlert("토큰을 붙여넣어 주세요."); return; }
    if (!state.content || state.loadFailed) {
      setGateAlert("content.json 을 먼저 불러와야 합니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.", "warn");
      return;
    }
    setGateAlert("토큰을 확인하는 중…", "warn");
    var btn = $("gateSubmit");
    btn.disabled = true;
    try {
      var repo = await verifyToken(token);
      state.token = token;

      /* 저장 */
      var remember = $("rememberToken").checked;
      var usePin = $("usePin").checked;
      if (remember && usePin) {
        if (!subtleOk()) throw new Error("이 브라우저에서는 PIN 잠금을 쓸 수 없습니다. 일반 저장을 이용해 주세요.");
        var pin = $("pinInput").value.trim();
        if (pin.length < 4) throw new Error("PIN은 4자리 이상으로 정해 주세요.");
        localStorage.setItem(KEY_TOKEN_PIN, JSON.stringify(await encryptToken(token, pin)));
        localStorage.removeItem(KEY_TOKEN);
      } else if (remember) {
        localStorage.setItem(KEY_TOKEN, token);
        localStorage.removeItem(KEY_TOKEN_PIN);
      } else {
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_TOKEN_PIN);
      }

      setGateAlert("");
      enterEditor();
      setStatus(remember ? "연결되었습니다. 이제 문구를 고치고 저장하세요." : "연결되었습니다. (이 브라우저에는 저장하지 않음)", "ok");
      if (repo.full_name) $("connText").textContent = "GitHub 연결됨 · " + repo.full_name;
    } catch (err) {
      state.token = null;
      setGateAlert(err.message || String(err), "");
    } finally {
      btn.disabled = false;
    }
  }

  async function onPinUnlock(ev) {
    ev.preventDefault();
    var pin = $("pinUnlock").value.trim();
    var box = $("pinAlert");
    box.hidden = true;
    var raw = localStorage.getItem(KEY_TOKEN_PIN);
    if (!raw) { showGate(); return; }
    try {
      var token = await decryptToken(JSON.parse(raw), pin);
      await verifyToken(token);
      state.token = token;
      enterEditor();
      setStatus("PIN 잠금이 풀렸습니다.", "ok");
    } catch (e) {
      box.hidden = false;
      box.className = "alert";
      box.textContent = "PIN이 맞지 않거나 토큰이 만료되었습니다. 다시 시도해 주세요.";
    }
  }

  function logout() {
    if (!confirm("이 브라우저에서 토큰을 지울까요? 다시 저장하려면 토큰을 새로 넣어야 합니다.")) return;
    try {
      localStorage.removeItem(KEY_TOKEN);
      localStorage.removeItem(KEY_TOKEN_PIN);
    } catch (e) {}
    state.token = null;
    $("tokenInput").value = "";
    showGate();
    setGateAlert("토큰을 지웠습니다.", "ok");
  }

  /* ---------- 저장 ---------- */
  function validate() {
    var p = [];
    var ch = state.content.channels;
    [["line", "LINE"], ["kakao", "카카오톡"], ["instagram", "인스타그램"]].forEach(function (pair) {
      var v = (ch[pair[0]] || "").trim();
      if (!v) p.push(pair[1] + " 주소가 비어 있습니다.");
      else if (!/^https?:\/\/\S+$/i.test(v)) p.push(pair[1] + " 주소가 http(s):// 로 시작하지 않습니다.");
    });
    var mapUrl = (state.content.visit.mapUrl || "").trim();
    if (mapUrl && !/^https?:\/\/\S+$/i.test(mapUrl)) p.push("지도 주소가 http(s):// 로 시작하지 않습니다.");
    var items = state.content.menu.items;
    if (!items.length) p.push("시술 메뉴가 하나도 없습니다.");
    items.forEach(function (it, i) {
      if (!pickText(it.name, "jp").trim() && !pickText(it.name, "kr").trim()) p.push("메뉴 " + (i + 1) + "의 이름이 비어 있습니다.");
    });
    state.content.reels.forEach(function (r, i) {
      if (!/^https?:\/\/\S+$/i.test((r.url || "").trim())) p.push("릴스 " + (i + 1) + "의 주소를 확인해 주세요.");
    });
    return p;
  }

  async function fetchRemoteJson() {
    return ghJson(API + "/repos/" + OWNER + "/" + REPO + "/contents/" + FILE_PATH + "?ref=" + encodeURIComponent(BRANCH),
      { headers: hdrs(state.token), cache: "no-store" });
  }

  async function save() {
    if (state.saving) return;
    if (!state.token) {
      $("gate").hidden = false;
      $("editor").hidden = true;
      $("savebar").hidden = true;
      $("gate").scrollIntoView({ behavior: "smooth", block: "start" });
      setGateAlert("저장하려면 먼저 토큰을 연결해 주세요.", "warn");
      return;
    }
    var problems = validate();
    if (problems.length) {
      setStatus("확인해 주세요: " + problems[0] + (problems.length > 1 ? " 외 " + (problems.length - 1) + "건" : ""), "bad");
      return;
    }

    state.saving = true;
    var btn = $("saveBtn");
    btn.disabled = true;
    var oldLabel = btn.textContent;
    btn.textContent = "저장 중…";
    setStatus("GitHub에 저장하는 중…", "");

    var updatedAt = nowISO();
    state.content.updatedAt = updatedAt;
    var json = JSON.stringify(state.content, null, 2) + "\n";

    try {
      var sha = null;
      for (var attempt = 0; attempt < 2 && !sha; attempt++) {
        try {
          var remote = await fetchRemoteJson();
          sha = remote.sha;
        } catch (e) {
          if (e.status === 404) { sha = undefined; break; } /* 파일이 아직 없으면 새로 만든다 */
          throw e;
        }
      }

      var body = {
        message: "홈페이지 문구·메뉴 수정 (관리자 페이지 " + new Date().toISOString().slice(0, 10) + ")",
        content: b64encodeUtf8(json),
        branch: BRANCH
      };
      if (sha) body.sha = sha;

      var res = await fetch(API + "/repos/" + OWNER + "/" + REPO + "/contents/" + FILE_PATH, {
        method: "PUT",
        headers: Object.assign(hdrs(state.token), { "Content-Type": "application/json" }),
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        var j = null;
        try { j = await res.json(); } catch (e) {}
        throw new Error(ghMessage(res.status) + (j && j.message ? " — " + j.message : ""));
      }
      var out = await res.json();
      state.sha = out && out.content ? out.content.sha : null;
      state.pristine = clone(state.content);
      state.dirty = false;
      try { localStorage.setItem(KEY_CONTENT_V, String(Date.now())); } catch (e) {}

      setStatus("GitHub 저장 완료 · 홈페이지에 반영되는 중입니다 (보통 30~60초)…", "");
      var secs = await waitLive(updatedAt);
      if (secs) {
        setStatus("홈페이지에 반영되었습니다 (" + secs + "초). 홈페이지를 새로고침해 확인해 보세요.", "ok");
      } else {
        setStatus("GitHub 저장은 끝났습니다. 홈페이지 반영은 아직 확인되지 않았습니다 — 1~2분 뒤 새로고침해 보세요.", "warn");
      }
    } catch (err) {
      state.content.updatedAt = (state.pristine && state.pristine.updatedAt) || "";
      setStatus(err.message || "저장에 실패했습니다.", "bad");
    } finally {
      state.saving = false;
      btn.disabled = false;
      btn.textContent = oldLabel;
    }
  }

  async function waitLive(updatedAt) {
    for (var i = 1; i <= 30; i++) {
      await sleep(6000);
      try {
        var r = await fetch(LIVE + "?t=" + Date.now(), { cache: "no-store" });
        if (r.ok) {
          var d = await r.json();
          if (d && d.updatedAt === updatedAt) return i * 6;
        }
      } catch (e) {}
      if (i % 3 === 0) setStatus("홈페이지 반영 확인 중… (" + (i * 6) + "초)", "");
    }
    return 0;
  }

  /* ---------- 백업 · 복원 ---------- */
  function download() {
    var json = JSON.stringify(state.content, null, 2) + "\n";
    var blob = new Blob([json], { type: "application/json" });
    var a = el("a", { href: URL.createObjectURL(blob), download: "content.json" });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function upload(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        state.content = normalize(data);
        state.dirty = true;
        renderAll();
        setStatus("파일을 불러왔습니다. 내용을 확인한 뒤 ‘저장 및 홈페이지 반영’을 누르세요.", "warn");
      } catch (e) {
        setStatus("JSON 파일을 읽지 못했습니다: " + e.message, "bad");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  /* ---------- 처음 ---------- */
  async function loadContent() {
    var url = "../" + FILE_PATH;
    try {
      var res = await fetch(url + "?t=" + Date.now(), { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return normalize(await res.json());
    } catch (e) {
      /* 배포 전 로컬 폴더 등에서 실패하면 빈 구조로 시작하지 않고 오류를 알린다 */
      throw new Error("content.json 을 불러오지 못했습니다. (" + e.message + ") 페이지를 새로고침해 주세요.");
    }
  }

  function bind() {
    $("gateForm").addEventListener("submit", onConnect);
    $("pinForm").addEventListener("submit", onPinUnlock);
    $("gateSkip").addEventListener("click", function () {
      state.token = null;
      enterEditor();
      setStatus("토큰 없이 편집 중입니다. 저장하려면 토큰을 연결해 주세요.", "warn");
    });
    $("pinReset").addEventListener("click", function () {
      localStorage.removeItem(KEY_TOKEN_PIN);
      showGate();
    });
    $("lockBtn").addEventListener("click", logout);
    $("usePin").addEventListener("change", function () {
      $("pinInput").disabled = !this.checked;
      if (this.checked) $("pinInput").focus();
    });
    $("rememberToken").addEventListener("change", function () {
      if (!this.checked) { $("usePin").checked = false; $("pinInput").disabled = true; }
    });

    document.querySelectorAll(".langbtn").forEach(function (b) {
      b.addEventListener("click", function () {
        state.lang = b.getAttribute("data-lang");
        document.querySelectorAll(".langbtn").forEach(function (x) {
          x.setAttribute("aria-pressed", x === b ? "true" : "false");
        });
        renderAll();
      });
    });

    $("addMenu").addEventListener("click", function () {
      state.content.menu.items.push({
        id: "menu-" + Math.random().toString(36).slice(2, 7),
        label: "",
        image: "assets/post-01.jpg",
        alt: { jp: "", kr: "", en: "" },
        name: { jp: "", kr: "", en: "" },
        desc: { jp: "", kr: "", en: "" },
        price: { jp: "", kr: "", en: "" }
      });
      markDirty();
      renderAll();
      var list = $("menuList");
      list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    $("addReel").addEventListener("click", function () {
      state.content.reels.push({
        id: "reel-" + Math.random().toString(36).slice(2, 7),
        url: "", video: "", poster: "",
        title: { jp: "", kr: "", en: "" },
        desc: { jp: "", kr: "", en: "" }
      });
      markDirty();
      renderAll();
      var list = $("reelList");
      list.lastElementChild.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    $("saveBtn").addEventListener("click", save);
    $("revertBtn").addEventListener("click", function () {
      if (!state.pristine) return;
      if (!confirm("저장하지 않은 변경사항을 모두 버리고 마지막으로 불러온 상태로 돌아갈까요?")) return;
      state.content = clone(state.pristine);
      state.dirty = false;
      renderAll();
      setStatus("되돌렸습니다.", "");
    });
    $("downloadBtn").addEventListener("click", download);
    $("uploadInput").addEventListener("change", function () {
      var f = this.files && this.files[0];
      if (f) upload(f);
      this.value = "";
    });
    $("reloadBtn").addEventListener("click", async function () {
      if (state.dirty && !confirm("저장하지 않은 변경사항이 사라집니다. 계속할까요?")) return;
      try {
        var c = await loadContent();
        state.content = c;
        state.pristine = clone(c);
        state.dirty = false;
        renderAll();
        setStatus("GitHub의 최신 내용을 다시 불러왔습니다.", "ok");
      } catch (e) {
        setStatus(e.message, "bad");
      }
    });

    window.addEventListener("beforeunload", function (e) {
      if (!state.dirty) return;
      e.preventDefault();
      e.returnValue = "";
    });
  }

  async function init() {
    bind();

    /* 이미지 후보 목록 */
    var dl = el("datalist", { id: "imageChoices" });
    IMAGE_CHOICES.forEach(function (p) { dl.appendChild(el("option", { value: p })); });
    document.body.appendChild(dl);

    try {
      state.content = await loadContent();
      state.pristine = clone(state.content);
    } catch (e) {
      state.loadFailed = true;
      document.body.insertAdjacentHTML("afterbegin",
        '<div class="alert" style="margin:16px">' + e.message + "</div>");
      showGate();
      $("gateSkip").hidden = true;
      return;
    }
    renderAll();

    var plain = null, pinRaw = null;
    try {
      plain = localStorage.getItem(KEY_TOKEN);
      pinRaw = localStorage.getItem(KEY_TOKEN_PIN);
    } catch (e) {}

    if (plain) {
      state.token = plain;
      enterEditor();
      verifyToken(plain)
        .then(function (repo) { setConn(true, "GitHub 연결됨 · " + (repo.full_name || REPO)); })
        .catch(function () {
          state.token = null;
          setConn(false, "토큰이 만료되었습니다 — 다시 연결해 주세요");
          showGate();
          setGateAlert("저장된 토큰이 만료되었거나 권한이 없습니다. 새 토큰을 넣어 주세요.", "");
        });
    } else if (pinRaw) {
      showPinGate();
      setTimeout(function () { $("pinUnlock").focus(); }, 80);
    } else {
      showGate();
    }
  }

  init();
})();
