/* =========================================================
   STUDIO NUNU — app.js
   - 3개 언어(JP 기본 / KR / EN) 전환
   - 예약 CTA 채널 자동 배정 (JP·EN → LINE, KR → 카카오톡)
   - 갤러리 필터, 헤더 스크롤, 모바일 내비, 스크롤 리빌
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. 채널 링크 ---------- */
  var URLS = {
    line: "https://line.me/R/ti/p/@362hsrxc",
    kakao: "https://pf.kakao.com/_DPDxib",
    instagram: "https://www.instagram.com/studio_nunu___"
  };

  /* 언어별 주 예약 채널: 일본 고객은 LINE, 한국 고객은 카카오톡, 영어권은 LINE */
  var CHANNELS = {
    jp: { primary: "line", secondary: "kakao" },
    kr: { primary: "kakao", secondary: "line" },
    en: { primary: "line", secondary: "kakao" }
  };

  var META = {
    jp: {
      title: "STUDIO NUNU｜韓国江南・東京・大阪 1:1アートメイク専門店",
      desc: "代表院長が一貫して担当する、完全個室1:1のアートメイク専門店 STUDIO NUNU。リップ・眉・アイライン・ヘアライン。ソウル江南（宣陵駅5番出口から徒歩1分）／東京・大阪出張。ご予約・ご相談はLINEにて。",
      lang: "ja"
    },
    kr: {
      title: "STUDIO NUNU｜서울 강남·도쿄·오사카 1:1 아트메이크업 전문점",
      desc: "대표원장이 처음부터 끝까지 담당하는 완전 개인실 1:1 아트메이크업 전문점 STUDIO NUNU. 입술·눈썹·아이라인·헤어라인. 서울 강남(선릉역 5번 출구 도보 1분)·도쿄·오사카 출장. 예약과 상담은 카카오톡 채널에서.",
      lang: "ko"
    },
    en: {
      title: "STUDIO NUNU｜1:1 Art Makeup Atelier · Seoul Gangnam, Tokyo, Osaka",
      desc: "STUDIO NUNU is a private, one-to-one art makeup atelier where the lead artist stays with you from consultation to aftercare. Lips, brows, eye-line, hairline. Seoul Gangnam (1 min from Seolleung Stn. Exit 5), Tokyo and Osaka. Book on LINE.",
      lang: "en"
    }
  };

  /* ---------- 2. 번역 사전 (일본어는 index.html 원문을 그대로 사용) ---------- */
  var I18N = {
    kr: {
      skip: "본문으로 건너뛰기",
      utilNote: "서울 강남점 상시 예약 가능｜도쿄·오사카 출장 예약 접수 중",
      utilNoteShort: "서울 강남 · 도쿄 · 오사카",
      logoSub: "1:1 아트메이크업 아틀리에 · SEOUL",
      headerCta: "카카오 예약",
      navSignature: "시그니처",
      navAbout: "브랜드",
      navShowcase: "쇼케이스",
      navGallery: "비포&애프터",
      navReviews: "리뷰",
      navVisit: "오시는 길",
      navReserve: "예약",
      heroEyebrow: "SEOUL GANGNAM · TOKYO · OSAKA",
      heroTitle: "「한국에서 일본인 리뷰가 <br>가장 많은 곳」",
      heroLead: "대표원장이 처음부터 끝까지 담당하는 완전 개인실 1:1 아트메이크업 전문점입니다. 입술·눈썹·아이라인·헤어라인을 고객님의 골격과 분위기에 맞춰 디자인합니다.",
      heroPrimary: "카카오톡으로 예약하기",
      heroSecondary: "인스타그램에서 작품 보기",
      heroNote: "상담과 견적은 카카오톡 채널로 안내드립니다.",
      heroBadge: "완전 개인실<br>대표원장 담당",
      altHero: "립 아트메이크업 비포&애프터",
      stat1Num: "11.9만",
      stat1: "인스타그램 팔로워<small>@studio_nunu___</small>",
      stat2: "카카오톡 채널 친구",
      stat3: "월평균 일본인 고객<sup>※</sup>",
      stat4: "완전 개인실 · 대표원장 담당",
      statsFoot: "※스튜디오누누 인스타그램에서 안내 중인 실적입니다. 사진은 모두 저희 인스타그램 게시물에서 가져왔습니다.",
      sigTitle: "시그니처",
      sigLead: "피부 톤과 골격에 맞춰 자연스러운 결과를 추구합니다. 가격과 소요 시간은 카카오톡·LINE으로 안내드립니다.",
      card1Title: "립 아트메이크업",
      card1Desc: "혈색과 윤곽을 정돈해 화장기 없는 얼굴에도 정돈된 인상을 만듭니다. 오버립은 입술마다 가능한 범위가 달라 무리 없는 선에서 제안드립니다.",
      card2Title: "콤보 브로우 아트메이크업",
      card2Desc: "눈썹만 바뀌어도 얼굴 전체의 인상이 달라집니다. 자연스럽고 부드러운 눈썹을 얼굴형에 맞춰 디자인합니다. 자연눈썹·남자눈썹도 가능합니다.",
      card3Title: "아이라인 아트메이크업",
      card3Desc: "눈매의 윤곽을 정돈해 또렷한 인상을 만듭니다. 매일의 메이크업 시간도 줄여줍니다.",
      card4Title: "헤어라인 아트메이크업",
      card4Desc: "헤어라인이 비어 보이는 부분에 자연스러운 모근을 한 올씩 그려 넣습니다. 가르마와 옆머리도 함께 상담해 드립니다.",
      cardCta: "카카오톡으로 상담하기",
      rpTitle: "리턴핑크",
      rpDesc: "색이 빠지거나 색감 변화가 신경 쓰이는 아트메이크업을 위한 메뉴입니다. 다른 곳에서 시술받으신 분도 현재 상태를 확인한 뒤 안내드립니다. 자세한 내용은 상담 시 설명드립니다.",
      rpCta: "상태 상담하기",
      sigFine: "아트메이크업은 색 안착에 개인차가 있어 추가 시술을 안내하는 경우가 있습니다. 가격·소요 시간·주의사항은 상담 시 설명드립니다.",
      altAbout: "콤보 브로우 아트메이크업 비포&애프터",
      aboutTitle: "대표원장이, <br>처음부터 끝까지.",
      aboutLead: "상담, 디자인, 시술, 사후 케어까지. 담당이 바뀌지 않고 한 분의 시간을 온전히 맡아 드립니다.",
      p1Title: "대표원장 일관 담당",
      p1Desc: "디자인 상담부터 시술 후 케어까지 대표원장이 직접 담당합니다.",
      p2Title: "완전 개인실 1:1",
      p2Desc: "다른 고객과 마주치지 않는 완전 개인실에서 1:1로 시간을 보내실 수 있습니다.",
      p3Title: "일본인 고객 리뷰",
      p3Desc: "한국에서 일본인 고객 리뷰가 가장 많은 뷰티숍으로 SNS에서 안내하고 있습니다.",
      p4Title: "서울 강남 · 도쿄 · 오사카",
      p4Desc: "서울 강남점은 상시 예약이 가능합니다. 도쿄·오사카는 출장 일정에 맞춰 예약을 받습니다.",
      aboutQuote: "아이돌·인플루언서·배우가 찾는 뷰티 살롱",
      aboutQuoteSrc: "STUDIO NUNU 인스타그램에서",
      showTitle: "시술 과정을 영상으로.",
      showLead: "인스타그램 릴스에서 디자인 과정과 결과를 확인하실 수 있습니다.",
      reel1: "콤보 브로우 · 결과",
      reel2: "립 · 결과",
      reel3: "아이라인 · 시술 과정",
      showMore: "인스타그램에서 다른 영상 보기",
      galTitle: "비포&애프터",
      galLead: "게시된 사진은 모두 STUDIO NUNU 인스타그램에 올라온 것입니다. 개인차가 있으며 모든 분께 같은 결과를 보장하지는 않습니다.",
      fAll: "전체",
      fLip: "입술",
      fBrow: "눈썹",
      fStudio: "살롱",
      g1: "립 아트메이크업",
      g2: "콤보 브로우 아트메이크업",
      g3: "립 · 좌우 차이 교정",
      g4: "콤보 브로우 · 부드러운 눈썹",
      g5: "고객 포트레이트",
      g6: "립 · 시술 과정",
      g7: "립 · 컬러별",
      g8tag: "릴스",
      g8: "상담 현장",
      galFoot: "사진을 누르면 STUDIO NUNU 인스타그램 게시물이 열립니다.",
      revTitle: "일본인 고객 리뷰",
      revLead: "「한국에서 일본인 리뷰가 가장 많은 곳」. 실제 리뷰는 인스타그램 하이라이트에 모아 두었습니다.",
      revNum1: "인스타그램 팔로워",
      revNum2: "카카오톡 채널 친구",
      revSub: "인스타그램 하이라이트",
      revVerified: "인증 계정",
      revFine: "게시된 리뷰는 고객 개인의 감상이며, 효과를 보장하지 않습니다.",
      revCap: "인스타그램 게시물에서 (립·눈썹 세트 리뷰)",
      resTitle: "예약은 카카오톡으로",
      resLead: "메뉴와 날짜가 정해지지 않아도 괜찮습니다. 상담부터 편하게 문의해 주세요.",
      st1: "채널 추가",
      st1d: "아래 버튼으로 카카오톡 채널을 추가합니다.",
      st2: "희망 내용 전달",
      st2d: "메뉴, 희망 날짜와 시간, 고민을 보내주세요. 사진이 있으면 더 빠릅니다.",
      st3: "일정 확정",
      st3d: "가능한 일정을 안내드리고 예약을 확정합니다. 가격과 소요 시간도 이때 안내드립니다.",
      resPrimary: "카카오톡으로 예약하기",
      resKakao: "LINE으로 상담",
      resIg: "인스타그램 DM",
      resFine: "한국 고객은 카카오톡 채널, 일본 고객은 LINE이 가장 빠릅니다.",
      visitTitle: "오시는 길",
      vAddrLabel: "주소",
      vAddr: "서울특별시 강남구 역삼동 804<br><span class=\"muted\">지하철 2호선 선릉역 5번 출구에서 도보 1분</span>",
      vHoursLabel: "영업시간",
      vHours: "예약 시 안내드립니다",
      vPriceLabel: "가격",
      vPrice: "카카오톡·LINE 상담 시 안내드립니다",
      vTripLabel: "출장 시술",
      vTrip: "도쿄·오사카 (일정은 LINE으로 안내)",
      vMap: "카카오맵에서 보기",
      vCta: "카카오톡으로 예약하기",
      vNote: "방문은 예약 후 이용해 주세요.",
      mapNote: "선릉역 5번 출구에서 도보 1분",
      footDesc: "1:1 아트메이크업 전문점 · 대표원장 일관 담당 · 완전 개인실",
      footDesc2: "서울 강남 / 도쿄 / 오사카",
      footKakao: "카카오톡",
      footMap: "카카오맵",
      footDisclaimer: "게시된 사진과 리뷰는 개인의 감상이며 효과를 보장하지 않습니다. 가격·영업시간은 변경될 수 있습니다.",
      barPrimary: "카카오톡 예약",
      barIg: "인스타그램"
    },

    en: {
      skip: "Skip to content",
      utilNote: "Seoul Gangnam open for booking｜Tokyo & Osaka visits",
      utilNoteShort: "Seoul · Tokyo · Osaka",
      logoSub: "1:1 ART MAKEUP ATELIER · SEOUL",
      headerCta: "Book now",
      navSignature: "Signature",
      navAbout: "About",
      navShowcase: "Showcase",
      navGallery: "Before & After",
      navReviews: "Reviews",
      navVisit: "Visit",
      navReserve: "Booking",
      heroEyebrow: "SEOUL GANGNAM · TOKYO · OSAKA",
      heroTitle: "“The studio Japanese guests <br>review most in Korea.”",
      heroLead: "A private, one-to-one art makeup atelier where the lead artist stays with you from consultation to aftercare. Lips, brows, eye-line and hairline, designed for your own bone structure and mood.",
      heroPrimary: "Book on LINE",
      heroSecondary: "See the work on Instagram",
      heroNote: "Consultation and quotes are handled on LINE.",
      heroBadge: "Private room<br>Lead artist",
      altHero: "Lip art makeup before and after",
      stat1Num: "119K",
      stat1: "Instagram followers<small>@studio_nunu___</small>",
      stat2: "KakaoTalk channel friends",
      stat3: "Japanese guests per month<sup>※</sup>",
      stat4: "Private room, one artist",
      statsFoot: "※Figures as announced by STUDIO NUNU on Instagram. All photos are from the studio’s own Instagram posts.",
      sigTitle: "Signature",
      sigLead: "Finished to look natural on your own skin tone and bone structure. Prices and treatment time are confirmed on LINE.",
      card1Title: "Lip art makeup",
      card1Desc: "Brings back colour and definition, so the face looks finished even without makeup. How far the lip line can go differs from lip to lip, so we stay within what looks natural.",
      card2Title: "Combo brow art makeup",
      card2Desc: "Changing the brows changes the whole face. Soft, natural brows designed to your face shape. Natural and men’s brows welcome.",
      card3Title: "Eye-line art makeup",
      card3Desc: "Defines the eyes for a clearer look, and shortens your daily makeup routine.",
      card4Title: "Hairline art makeup",
      card4Desc: "Adds natural-looking strands one by one where the hairline looks thin. Partings and sideburns too.",
      cardCta: "Ask on LINE",
      rpTitle: "ReturnPink",
      rpDesc: "A menu for art makeup whose colour has faded or shifted. Guests treated elsewhere are welcome — we check the current state first, and explain the details at the consultation.",
      rpCta: "Ask about my case",
      sigFine: "Pigment settling varies from person to person, so a touch-up may be recommended. Price, duration and aftercare are explained at the consultation.",
      altAbout: "Combo brow art makeup before and after",
      aboutTitle: "One artist, <br>from start to finish.",
      aboutLead: "Consultation, design, treatment and aftercare. The same lead artist stays with you the whole way.",
      p1Title: "One lead artist throughout",
      p1Desc: "From the design consultation to aftercare, the lead artist treats you personally.",
      p2Title: "Private room, 1:1",
      p2Desc: "A fully private room, so you never meet another guest during your visit.",
      p3Title: "The Japanese reviews",
      p3Desc: "Announced on our social media as the beauty shop with the most Japanese reviews in Korea.",
      p4Title: "Seoul Gangnam · Tokyo · Osaka",
      p4Desc: "The Seoul Gangnam studio takes bookings year-round. Tokyo and Osaka are booked around visit schedules.",
      aboutQuote: "A beauty salon visited by idols, influencers and actors",
      aboutQuoteSrc: "From STUDIO NUNU on Instagram",
      showTitle: "The treatment, on film.",
      showLead: "Watch the design process and the results in our Instagram reels.",
      reel1: "Combo brow · result",
      reel2: "Lip · result",
      reel3: "Eye-line · treatment",
      showMore: "More videos on Instagram",
      galTitle: "Before & After",
      galLead: "Every photo here is from STUDIO NUNU’s own Instagram. Results vary from person to person and are not a guarantee of the same outcome.",
      fAll: "All",
      fLip: "Lips",
      fBrow: "Brows",
      fStudio: "Studio",
      g1: "Lip art makeup",
      g2: "Combo brow art makeup",
      g3: "Lip · asymmetry corrected",
      g4: "Combo brow · soft brows",
      g5: "Guest portrait",
      g6: "Lip · in treatment",
      g7: "Lip · by colour",
      g8tag: "REEL",
      g8: "In consultation",
      galFoot: "Tap a photo to open the original post on Instagram.",
      revTitle: "Reviews from Japanese guests",
      revLead: "“The studio with the most Japanese reviews in Korea.” The real reviews are collected in our Instagram highlights.",
      revNum1: "Instagram followers",
      revNum2: "KakaoTalk channel friends",
      revSub: "Instagram highlights",
      revVerified: "Verified account",
      revFine: "Reviews are individual impressions and do not guarantee results.",
      revCap: "From an Instagram post (lip and brow set review)",
      resTitle: "Book on LINE",
      resLead: "You don’t need a menu or a date yet. Start with a consultation.",
      st1: "Add us on LINE",
      st1d: "Add our official LINE account with the button below.",
      st2: "Send your request",
      st2d: "Tell us the menu, your preferred date and any concerns. A photo helps.",
      st3: "Confirm the date",
      st3d: "We confirm availability and your booking, and quote the price and duration at the same time.",
      resPrimary: "Book on LINE",
      resKakao: "Ask on KakaoTalk",
      resIg: "Instagram DM",
      resFine: "LINE is the fastest route for guests from abroad. Korean guests can use the KakaoTalk channel.",
      visitTitle: "Visit",
      vAddrLabel: "Address",
      vAddr: "804 Yeoksam-dong, Gangnam-gu, Seoul<br><span class=\"muted\">1 min walk from Exit 5, Seolleung Station (Line 2)</span>",
      vHoursLabel: "Hours",
      vHours: "Confirmed at booking",
      vPriceLabel: "Pricing",
      vPrice: "Shared on LINE or KakaoTalk",
      vTripLabel: "Visits",
      vTrip: "Tokyo · Osaka (schedule on LINE)",
      vMap: "Open in Kakao Map",
      vCta: "Book on LINE",
      vNote: "Please visit by appointment.",
      mapNote: "1 min from Exit 5, Seolleung Stn.",
      footDesc: "1:1 art makeup atelier · one lead artist · private room",
      footDesc2: "Seoul Gangnam / Tokyo / Osaka",
      footKakao: "KakaoTalk",
      footMap: "Kakao Map",
      footDisclaimer: "Photos and reviews are individual impressions and do not guarantee results. Prices and hours may change.",
      barPrimary: "Book on LINE",
      barIg: "Instagram"
    }
  };

  /* ---------- 3. 원문(일본어) 캡처 ---------- */
  var nodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n]"));
  var altNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-alt]"));
  var htmlMemo = new Map();
  var altMemo = new Map();

  nodes.forEach(function (el) { htmlMemo.set(el, el.innerHTML); });
  altNodes.forEach(function (el) { altMemo.set(el, el.getAttribute("alt") || ""); });

  var LANG_KEY = "nunu-lang";
  var current = "jp";

  function textFor(lang, key) {
    if (lang === "jp") return null;
    var dict = I18N[lang];
    return dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : null;
  }

  function applyLanguage(lang) {
    if (!I18N[lang] && lang !== "jp") lang = "jp";
    current = lang;

    /* 텍스트 */
    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var val = textFor(lang, key);
      el.innerHTML = val === null ? htmlMemo.get(el) : val;
    });

    /* 대체 텍스트 */
    altNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n-alt");
      var val = textFor(lang, key);
      el.setAttribute("alt", val === null ? altMemo.get(el) : val);
    });

    /* 문서 정보 */
    var meta = META[lang] || META.jp;
    document.title = meta.title;
    document.documentElement.setAttribute("lang", meta.lang);
    setMeta("name", "description", meta.desc);
    setMeta("property", "og:title", meta.title);
    setMeta("property", "og:description", meta.desc);

    /* 예약 채널 */
    var ch = CHANNELS[lang] || CHANNELS.jp;
    document.querySelectorAll("[data-cta]").forEach(function (a) {
      var slot = a.getAttribute("data-cta");
      var channel;
      if (slot === "primary") channel = ch.primary;
      else if (slot === "secondary") channel = ch.secondary;
      else channel = URLS[slot] ? slot : "instagram";
      var url = URLS[channel] || URLS.instagram;
      if (a.getAttribute("href") !== url) a.setAttribute("href", url);
      a.setAttribute("data-channel", channel);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });

    /* 언어 버튼 상태 */
    document.querySelectorAll(".lang-btn").forEach(function (b) {
      b.setAttribute("aria-pressed", b.getAttribute("data-lang") === lang ? "true" : "false");
    });

    /* 저장 */
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
  }

  function setMeta(attr, name, value) {
    var el = document.querySelector('meta[' + attr + '="' + name + '"]');
    if (el) el.setAttribute("content", value);
  }

  /* ---------- 4. 초기 언어 ---------- */
  function initialLang() {
    var q = new URLSearchParams(window.location.search).get("lang");
    if (q) {
      q = q.toLowerCase();
      if (q === "ko" || q === "kr") return "kr";
      if (q === "en") return "en";
      if (q === "ja" || q === "jp") return "jp";
    }
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved === "kr" || saved === "en" || saved === "jp") return saved;
    } catch (e) {}
    return "jp"; /* 기본값: 일본어 */
  }

  document.querySelectorAll(".lang-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      applyLanguage(b.getAttribute("data-lang"));
    });
  });

  /* ---------- 5. 헤더 / 모바일 내비 ---------- */
  var header = document.getElementById("siteHeader");
  var burger = document.getElementById("burger");
  var body = document.body;

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.querySelectorAll("#gnb a").forEach(function (a) {
    a.addEventListener("click", function () {
      body.classList.remove("nav-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && body.classList.contains("nav-open")) {
      body.classList.remove("nav-open");
      if (burger) burger.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- 6. 갤러리 필터 ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll(".filters .chip"));
  var items = Array.prototype.slice.call(document.querySelectorAll("#galGrid .gal__item"));

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-selected", on ? "true" : "false");
      });
      items.forEach(function (item) {
        var show = f === "all" || item.getAttribute("data-cat") === f;
        if (show) item.removeAttribute("hidden");
        else item.setAttribute("hidden", "");
      });
    });
  });

  /* ---------- 7. 스크롤 리빌 ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- 8. 시작 ---------- */
  applyLanguage(initialLang());
})();
