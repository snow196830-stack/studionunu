/* =========================================================
   STUDIO NUNU — app.js
   - 3개 언어(JP 기본 / KR / EN) 전환
   - 예약 CTA 채널 자동 배정 (JP·EN → LINE, KR → 카카오톡)
   - 갤러리 필터, 헤더 스크롤, 모바일 내비, 스크롤 리빌
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. 채널 링크 ---------- */
  /* 기본값(폴백). data/content.json 이 로드되면 channels 값으로 덮어쓴다. */
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
      reel1t: "1:1 프라이빗 살롱",
      reel1d: "대표 NUNU가 모든 시술을 1:1로 직접 담당합니다.",
      reel2t: "오버립 · 코랄 오렌지",
      reel2d: "오버립과 코랄 컬러로 부드러운 입술을 완성했습니다.",
      reel3t: "콤보 브로우 · 결과",
      reel3d: "상담부터 시술까지 대표원장이 직접 담당합니다.",
      reel4t: "브라운 아이라인 · 시술 과정",
      reel4d: "부드럽고 고급스러운 브라운 컬러로 눈매를 정돈합니다.",
      reelCta: "릴스 보기",
      reelGroup: "인스타그램 릴스",
      reelPrev: "이전 릴스",
      reelNext: "다음 릴스",
      reelPause: "자동 넘김 멈춤",
      reelPlay: "자동 넘김 다시 시작",
      reelDotsLabel: "릴스 선택",
      reel1a: "1:1 프라이빗 살롱 릴스를 인스타그램에서 보기",
      reel2a: "오버립 릴스를 인스타그램에서 보기",
      reel3a: "콤보 브로우 릴스를 인스타그램에서 보기",
      reel4a: "브라운 아이라인 릴스를 인스타그램에서 보기",
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
      vAddr: "서울특별시 강남구 역삼동 804",
      vAddrNote: "지하철 2호선 선릉역 5번 출구에서 도보 1분",
      vHoursLabel: "영업시간",
      vHours: "예약 시 안내드립니다",
      vParkingLabel: "주차",
      vParking: "예약 시 안내드립니다",
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
      reel1t: "The private 1:1 atelier",
      reel1d: "Lead artist NUNU treats every guest personally, from first consultation to finish.",
      reel2t: "Over-lip · coral orange",
      reel2d: "An over-lip finished in a soft coral orange.",
      reel3t: "Combo brow · result",
      reel3d: "From consultation to treatment, the lead artist works on you personally.",
      reel4t: "Brown eye-line · in treatment",
      reel4d: "A soft, elegant brown that defines the eyes.",
      reelCta: "Watch the reel",
      reelGroup: "Instagram reels",
      reelPrev: "Previous reel",
      reelNext: "Next reel",
      reelPause: "Pause autoplay",
      reelPlay: "Resume autoplay",
      reelDotsLabel: "Choose a reel",
      reel1a: "Watch the private 1:1 atelier reel on Instagram",
      reel2a: "Watch the over-lip reel on Instagram",
      reel3a: "Watch the combo brow reel on Instagram",
      reel4a: "Watch the brown eye-line reel on Instagram",
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
      vAddr: "804 Yeoksam-dong, Gangnam-gu, Seoul",
      vAddrNote: "1 min walk from Exit 5, Seolleung Station (Line 2)",
      vHoursLabel: "Hours",
      vHours: "Confirmed at booking",
      vParkingLabel: "Parking",
      vParking: "Confirmed at booking",
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
  var ariaNodes = Array.prototype.slice.call(document.querySelectorAll("[data-i18n-aria]"));
  var htmlMemo = new Map();
  var altMemo = new Map();
  var ariaMemo = new Map();
  var langHooks = [];

  nodes.forEach(function (el) { htmlMemo.set(el, el.innerHTML); });
  altNodes.forEach(function (el) { altMemo.set(el, el.getAttribute("alt") || ""); });
  ariaNodes.forEach(function (el) { ariaMemo.set(el, el.getAttribute("aria-label") || ""); });
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

    /* aria-label */
    ariaNodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n-aria");
      var val = textFor(lang, key);
      el.setAttribute("aria-label", val === null ? (ariaMemo.get(el) || "") : val);
    });
    langHooks.forEach(function (fn) { try { fn(); } catch (e) {} });

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

    /* data/content.json 값이 있으면 마지막에 덮어쓴다(원장님이 고친 문구가 우선) */
    applyContentText(lang);
    applyLinks();
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
  var revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          revealObserver.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
  }
  function initReveal(scope) {
    var list = Array.prototype.slice.call((scope || document).querySelectorAll(".reveal"));
    if (revealObserver) list.forEach(function (el) { revealObserver.observe(el); });
    else list.forEach(function (el) { el.classList.add("is-in"); });
  }
  initReveal();

  /* ---------- 7. 릴스 캐러셀 (자동 슬라이드) ---------- */
  function initReels() {
    var root = document.getElementById("reels");
    if (!root) return;
    var viewport = document.getElementById("reelViewport");
    var track = document.getElementById("reelTrack");
    if (!viewport || !track || !track.children.length) return;

    var slides = Array.prototype.slice.call(track.children);
    var videos = Array.prototype.slice.call(track.querySelectorAll("video"));
    var prevBtn = document.getElementById("reelPrev");
    var nextBtn = document.getElementById("reelNext");
    var toggleBtn = document.getElementById("reelToggle");
    var dotsWrap = document.getElementById("reelDots");
    var reduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    var interval = parseInt(root.getAttribute("data-autoplay"), 10) || 5500;

    var index = 0;
    var maxIndex = Math.max(0, slides.length - 1);
    var userPaused = !!(reduce && reduce.matches);
    var hovering = false;
    var inView = false;
    var holdTimer = null;
    var timer = null;
    var frame = null;

    /* 인디케이터 */
    var dots = slides.map(function (s, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "reels__dot";
      b.setAttribute("aria-label", i + 1 + " / " + slides.length);
      b.setAttribute("aria-current", i === 0 ? "true" : "false");
      b.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(b);
      return b;
    });

    function step() {
      if (slides.length < 2) return 0;
      return slides[1].offsetLeft - slides[0].offsetLeft;
    }

    function positions() {
      var s = step();
      if (!s) return;
      var per = Math.max(1, Math.round(viewport.clientWidth / s));
      maxIndex = Math.max(0, slides.length - per);
    }

    function goTo(i, instant) {
      if (!maxIndex) maxIndex = slides.length - 1;
      index = Math.max(0, Math.min(maxIndex, i));
      var left = slides[index].offsetLeft - slides[0].offsetLeft;
      var smooth = !instant && !(reduce && reduce.matches);
      try {
        viewport.scrollTo({ left: left, behavior: smooth ? "smooth" : "auto" });
      } catch (e) {
        viewport.scrollLeft = left;
      }
      paint();
    }

    function paint() {
      dots.forEach(function (d, i) {
        d.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    /* 지금 보이는 슬라이드만 재생 */
    function isVisible(slide) {
      var start = slide.offsetLeft - slides[0].offsetLeft;
      var left = viewport.scrollLeft;
      var right = left + viewport.clientWidth;
      return start + slide.offsetWidth > left + 36 && start < right - 36;
    }

    function safePlay(v) {
      if (!v.paused) return;
      var p = v.play();
      if (p && p.catch) p.catch(function () {});
    }

    function playVisible() {
      var run = inView && !userPaused && !document.hidden;
      videos.forEach(function (v) {
        var slide = v.closest ? v.closest(".reels__slide") : null;
        if (run && slide && isVisible(slide)) safePlay(v);
        else if (!v.paused) v.pause();
      });
    }

    function tick() {
      if (userPaused || hovering || !inView || document.hidden) return;
      goTo(index + 1 > maxIndex ? 0 : index + 1);
    }

    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(tick, interval);
    }

    function setToggle() {
      if (!toggleBtn) return;
      toggleBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
      var key = userPaused ? "reelPlay" : "reelPause";
      var dict = I18N[current];
      var jp = toggleBtn.getAttribute(userPaused ? "data-jp-play" : "data-jp-pause") || "";
      var label = current !== "jp" && dict && dict[key] ? dict[key] : jp;
      if (label) toggleBtn.setAttribute("aria-label", label);
    }

    /* --- 이벤트 --- */
    if (prevBtn) prevBtn.addEventListener("click", function () { goTo(index - 1 < 0 ? maxIndex : index - 1); restart(); });
    if (nextBtn) nextBtn.addEventListener("click", function () { goTo(index + 1 > maxIndex ? 0 : index + 1); restart(); });
    if (toggleBtn) toggleBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      setToggle();
      playVisible();
      restart();
    });

    function hoverOn() { hovering = true; }
    function hoverOff() { hovering = false; }
    root.addEventListener("pointerenter", hoverOn);
    root.addEventListener("pointerleave", hoverOff);
    root.addEventListener("focusin", hoverOn);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) hoverOff();
    });

    /* 터치: 스와이프 중에는 멈추고, 손을 뗀 뒤 잠시 뒤 재개 */
    function holdOn() {
      hovering = true;
      if (holdTimer) clearTimeout(holdTimer);
    }
    function holdOff() {
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = setTimeout(hoverOff, 6000);
    }
    root.addEventListener("touchstart", holdOn, { passive: true });
    root.addEventListener("touchend", holdOff, { passive: true });

    /* 스크롤 위치 → 인덱스 · 재생 */
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = null;
        var s = step();
        if (s) {
          var i = Math.round(viewport.scrollLeft / s);
          index = Math.max(0, Math.min(maxIndex, i));
          paint();
        }
        playVisible();
      });
    }
    viewport.addEventListener("scroll", onScroll, { passive: true });

    viewport.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1 < 0 ? maxIndex : index - 1); restart(); }
      else if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1 > maxIndex ? 0 : index + 1); restart(); }
    });

    document.addEventListener("visibilitychange", playVisible);

    if ("IntersectionObserver" in window) {
      var secObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          inView = en.isIntersecting;
          playVisible();
        });
      }, { threshold: 0.12 });
      secObs.observe(root);
    } else {
      inView = true;
    }

    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        positions();
        goTo(index, true);
        playVisible();
      }, 180);
    });

    if (reduce && reduce.addEventListener) {
      reduce.addEventListener("change", function (e) {
        userPaused = e.matches;
        setToggle();
        playVisible();
      });
    }

    langHooks.push(setToggle);

    /* --- 시작 --- */
    positions();
    paint();
    setToggle();
    restart();
    videos.forEach(function (v) { v.muted = true; });
    playVisible();
    setTimeout(playVisible, 600);
  }

  /* =========================================================
     8. data/content.json — 원장님이 /admin/ 에서 고치는 부분
        공지바 · 히어로 문구 · 시술 메뉴/가격 · 영업시간·주소·주차
        · 예약 채널 링크 · 인스타 릴스 목록
     - 로드 실패(오프라인·파일 없음·JSON 오류) 시 아래 기본값(HTML 원문)
       그대로 동작한다. 화면이 깨지지 않도록 모든 처리는 CONTENT 존재 여부를 본다.
     ========================================================= */
  var CONTENT = null;
  var CONTENT_KEY = "nunu-content-v";
  var IG_PATH = "M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 5.3a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm0 7.4a2.9 2.9 0 1 1 0-5.8 2.9 2.9 0 0 1 0 5.8Zm5.7-7.6a1.05 1.05 0 1 1-2.1 0 1.05 1.05 0 0 1 2.1 0Z";
  var CARD_CTA_JP = "LINEで相談する";
  var REEL_CTA = { jp: "リールを見る", kr: "릴스 보기", en: "Watch the reel" };

  /* {jp,kr,en} 객체에서 언어 값 추출. 값이 없으면 일본어, 그것도 없으면 빈 문자열 */
  function pick(obj, lang) {
    if (obj === null || obj === undefined) return "";
    if (typeof obj === "string" || typeof obj === "number") return String(obj);
    if (obj[lang] !== undefined && obj[lang] !== null) return String(obj[lang]);
    if (obj.jp !== undefined && obj.jp !== null) return String(obj.jp);
    return "";
  }

  function getPath(path) {
    var parts = String(path).split(".");
    var cur = CONTENT;
    for (var i = 0; i < parts.length; i++) {
      if (cur === null || cur === undefined) return null;
      cur = cur[parts[i]];
    }
    return cur;
  }

  /* 정적 문구: index.html 의 [data-content] 요소를 content.json 값으로 교체 */
  function applyContentText(lang) {
    if (!CONTENT) return;
    document.querySelectorAll("[data-content]").forEach(function (el) {
      var path = el.getAttribute("data-content");
      if (path.indexOf("menu.returnPink.price") === 0) return; /* 아래에서 hidden 처리와 함께 다룸 */
      var val = pick(getPath(path), lang);
      if (val !== "") el.innerHTML = val;
    });
    paintMenus(lang);
    paintReels(lang);
  }

  /* 예약 채널 · 카카오맵 링크 */
  function applyLinks() {
    if (!CONTENT) return;
    var ch = CONTENT.channels || {};
    var mapUrl = (CONTENT.visit && CONTENT.visit.mapUrl) || "";
    document.querySelectorAll("[data-link]").forEach(function (a) {
      var k = a.getAttribute("data-link");
      var url = k === "map" ? mapUrl : ch[k];
      if (url && a.getAttribute("href") !== url) a.setAttribute("href", url);
    });
  }

  /* ---------- 8-1. 시술 메뉴 카드 ---------- */
  function buildMenus() {
    var wrap = document.getElementById("menuCards");
    if (!wrap || !CONTENT.menu || !Array.isArray(CONTENT.menu.items)) return;
    if (!CONTENT.menu.items.length) return; /* 빈 배열이면 기본 카드 유지 */

    wrap.innerHTML = "";
    CONTENT.menu.items.forEach(function (item, i) {
      var card = document.createElement("article");
      card.className = "card reveal";
      card.setAttribute("data-menu-item", String(i || 0));

      var media = document.createElement("div");
      media.className = "card__media";
      var img = document.createElement("img");
      img.src = item.image || "assets/post-01.jpg";
      img.alt = "";
      img.loading = "lazy";
      media.appendChild(img);

      var body = document.createElement("div");
      body.className = "card__body";
      var en = document.createElement("p");
      en.className = "card__en";
      en.textContent = item.label || "";
      var name = document.createElement("h3");
      name.className = "card__jp";
      var price = document.createElement("p");
      price.className = "card__price";
      price.hidden = true;
      var desc = document.createElement("p");
      desc.className = "card__desc";
      var cta = document.createElement("a");
      cta.className = "card__link";
      cta.setAttribute("data-cta", "primary");
      cta.setAttribute("data-label", "cardCta");
      cta.setAttribute("target", "_blank");
      cta.setAttribute("rel", "noopener");
      cta.href = URLS.line;

      body.appendChild(en);
      body.appendChild(name);
      body.appendChild(price);
      body.appendChild(desc);
      body.appendChild(cta);
      card.appendChild(media);
      card.appendChild(body);
      wrap.appendChild(card);
    });
  }

  function paintMenus(lang) {
    if (!CONTENT || !CONTENT.menu) return;
    var wrap = document.getElementById("menuCards");
    if (wrap) {
      Array.prototype.forEach.call(wrap.querySelectorAll("[data-menu-item]"), function (card, i) {
        var item = CONTENT.menu.items[i];
        if (!item) return;
        var en = card.querySelector(".card__en");
        if (en) en.textContent = item.label || "";
        var name = card.querySelector(".card__jp");
        if (name) name.innerHTML = pick(item.name, lang);
        var desc = card.querySelector(".card__desc");
        if (desc) desc.innerHTML = pick(item.desc, lang);
        var priceEl = card.querySelector(".card__price");
        var price = pick(item.price, lang).trim();
        if (priceEl) { priceEl.innerHTML = price; priceEl.hidden = !price; }
        var img = card.querySelector(".card__media img");
        if (img) {
          if (item.image && img.getAttribute("src") !== item.image) img.setAttribute("src", item.image);
          img.setAttribute("alt", pick(item.alt, lang) || pick(item.name, lang));
        }
        var cta = card.querySelector(".card__link");
        if (cta) cta.textContent = lang === "jp" ? CARD_CTA_JP : ((I18N[lang] && I18N[lang].cardCta) || CARD_CTA_JP);
      });
    }

    var rp = CONTENT.menu.returnPink;
    var rpPrice = document.getElementById("rpPrice");
    if (rpPrice) {
      var p = rp ? pick(rp.price, lang).trim() : "";
      rpPrice.innerHTML = p;
      rpPrice.hidden = !p;
    }
  }

  /* ---------- 8-2. 릴스 캐러셀 ---------- */
  function buildReels() {
    var track = document.getElementById("reelTrack");
    if (!track || !Array.isArray(CONTENT.reels) || !CONTENT.reels.length) return;

    track.innerHTML = "";
    CONTENT.reels.forEach(function (r, i) {
      var li = document.createElement("li");
      li.className = "reels__slide";
      li.setAttribute("role", "listitem");

      var a = document.createElement("a");
      a.className = "reel";
      a.href = r.url || "#";
      a.target = "_blank";
      a.rel = "noopener";

      var media = document.createElement("span");
      media.className = "reel__media";
      if (r.video) {
        var v = document.createElement("video");
        v.className = "reel__video";
        v.src = r.video;
        if (r.poster) v.poster = r.poster;
        v.width = 720; v.height = 1280;
        v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true;
        v.preload = "metadata";
        v.setAttribute("muted", ""); v.setAttribute("playsinline", ""); v.setAttribute("aria-hidden", "true");
        v.tabIndex = -1;
        media.appendChild(v);
      } else if (r.poster) {
        var im = document.createElement("img");
        im.className = "reel__poster";
        im.src = r.poster;
        im.alt = "";
        im.loading = "lazy";
        media.appendChild(im);
      } else {
        var ph = document.createElement("span");
        ph.className = "reel__placeholder";
        ph.textContent = "STUDIO NUNU";
        media.appendChild(ph);
      }

      var no = document.createElement("span");
      no.className = "reel__no";
      no.textContent = "REEL " + (i + 1 < 10 ? "0" : "") + (i + 1);
      media.appendChild(no);

      var ig = document.createElement("span");
      ig.className = "reel__ig";
      ig.setAttribute("aria-hidden", "true");
      ig.innerHTML = '<svg viewBox="0 0 24 24"><path d="' + IG_PATH + '"/></svg>';
      media.appendChild(ig);

      var meta = document.createElement("span");
      meta.className = "reel__meta";
      var t = document.createElement("span");
      t.className = "reel__t";
      var d = document.createElement("span");
      d.className = "reel__d";
      var c = document.createElement("span");
      c.className = "reel__cta";
      meta.appendChild(t); meta.appendChild(d); meta.appendChild(c);

      a.appendChild(media);
      a.appendChild(meta);
      li.appendChild(a);
      track.appendChild(li);
    });
  }

  function paintReels(lang) {
    if (!CONTENT || !Array.isArray(CONTENT.reels)) return;
    var track = document.getElementById("reelTrack");
    if (!track) return;
    Array.prototype.forEach.call(track.children, function (li, i) {
      var r = CONTENT.reels[i];
      if (!r) return;
      var t = r.title ? pick(r.title, lang) : "";
      var d = r.desc ? pick(r.desc, lang) : "";
      var elT = li.querySelector(".reel__t");
      var elD = li.querySelector(".reel__d");
      var elC = li.querySelector(".reel__cta");
      if (elT) elT.innerHTML = t;
      if (elD) elD.innerHTML = d;
      if (elC) elC.textContent = REEL_CTA[lang] || REEL_CTA.jp;
      var a = li.querySelector("a.reel");
      if (a) {
        a.setAttribute("aria-label", (t || "Instagram") + " — " + (REEL_CTA[lang] || REEL_CTA.jp));
        if (r.url) a.setAttribute("href", r.url);
      }
    });
  }

  /* ---------- 8-3. 로드 ---------- */
  function loadContent() {
    if (window.location.protocol === "file:") return Promise.resolve(null); /* 로컬 파일 직접 열기: 기본값 사용 */
    var bust = "";
    try {
      var v = localStorage.getItem(CONTENT_KEY);
      if (v) bust = "?v=" + encodeURIComponent(v);
    } catch (e) {}
    return fetch("data/content.json" + bust, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || typeof data !== "object") throw new Error("invalid json");
        CONTENT = data;
        if (data.channels) {
          if (data.channels.line) URLS.line = data.channels.line;
          if (data.channels.kakao) URLS.kakao = data.channels.kakao;
          if (data.channels.instagram) URLS.instagram = data.channels.instagram;
        }
        buildMenus();
        buildReels();
        return CONTENT;
      })
      .catch(function () {
        CONTENT = null; /* 폴백: index.html·app.js 내장 기본값 */
        return null;
      });
  }

  /* ---------- 9. 시작 ---------- */
  applyLanguage(initialLang());
  loadContent().then(function () {
    if (CONTENT) applyLanguage(current); /* 로드된 문구·메뉴를 현재 언어로 다시 그림 */
    initReveal(document.getElementById("signature") || document);
    initReels();
  });
})();
