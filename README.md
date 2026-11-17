# STUDIO NUNU — 3개 국어 공식 홈페이지

- 라이브: https://snow196830-stack.github.io/studionunu/

스튜디오누누(STUDIO NUNU)의 다국어 원페이지 사이트입니다.
일본어(기본) · 한국어 · 영어 3개 국어를 상단에서 즉시 전환할 수 있습니다.

```
studio-nunu/
├── index.html            # 마크업(일본어 원문이 기본값)
├── styles.css            # 디자인·반응형
├── app.js                # 언어 전환 / 예약 채널 자동 배정 / 갤러리 필터 / 릴스 캐러셀
├── assets/
│   ├── *.jpg             # 스튜디오누누 인스타그램 실제 이미지
│   ├── reel-*.mp4        # 인스타 릴스 원본 영상(720×1280, H.264, 합계 약 6MB)
│   ├── reel-*.jpg        # 릴스 썸네일(poster)
│   └── fonts/            # 셀프호스팅 서브셋 웹폰트(Noto Serif/Sans JP·KR)
└── preview/              # 검증 스크린샷 4장
```

## 실행 / 배포

정적 파일만으로 동작합니다(서버 사이드 없음).

```bash
cd studio-nunu && python3 -m http.server 8000
# → http://localhost:8000/index.html
```

배포는 폴더 전체를 그대로 올리면 됩니다(GitHub Pages / Netlify / Vercel / 카페24 등).
배포 후 손볼 곳:

- `index.html`의 `og:image`·`og:url` 은 라이브 배포 주소(`https://snow196830-stack.github.io/studionunu/`) 기준 절대 URL로 설정되어 있습니다.
  도메인을 바꾸면 두 값을 새 주소로 바꿔 주세요.
- 정식 도메인·파비콘·`sitemap.xml` 은 도메인 확정 후 추가.

## 쇼케이스 릴스 캐러셀 (`#showcase`)

인스타그램 릴스 4편을 자동 슬라이드로 보여 주고, 카드를 누르면 해당 릴스 원문이 새 창으로 열립니다.

| 슬라이드 | 파일 | 원문 |
|---|---|---|
| REEL 01 | `reel-df1yagnprsl.*` | https://www.instagram.com/reel/Df1YAgnpRSL/ |
| REEL 02 | `reel-de5m5qjlwy.*` | https://www.instagram.com/reel/De5m5-qJlwy/ |
| REEL 03 | `reel-dfovce2pl9t.*` | https://www.instagram.com/reel/DfoVcE2pL9T/ |
| REEL 04 | `reel-dewginkpbhm.*` | https://www.instagram.com/reel/DewGINkpBhm/ |

- 동작: 5.5초 간격 자동 전환(`data-autoplay="5500"`), 마우스 오버·포커스·스와이프 중 정지, 좌우 버튼·인디케이터·일시정지 버튼 제공, 모바일은 터치 스와이프(스냅).
- 영상은 `<video autoplay muted loop playsinline poster>` 로 화면에 보이는 슬라이드만 재생합니다(`preload="metadata"`).
- 릴스를 추가·교체하려면: `assets/`에 `reel-<이름>.mp4`(720×1280, 2MB 이내 권장)와 `.jpg` 포스터를 넣고, `index.html`의 `#reelTrack`에 `<li class="reels__slide">` 하나를 복사해 `src`·`poster`·`href`와 `data-i18n` 키를 바꾼 뒤 `app.js`의 `I18N.kr` / `I18N.en`에 같은 키를 추가합니다. 인디케이터는 슬라이드 수에 맞춰 자동 생성됩니다.
- 영상은 `yt-dlp https://www.instagram.com/reel/<shortcode>/ -f 3` 로 받습니다(로그인 없이 되는 프로그레시브 mp4 = H.264).

## 언어 전환 규칙

| 모드 | 주 예약 버튼 | 보조 채널 |
|------|--------------|-----------|
| JP (기본) | LINE `https://line.me/R/ti/p/@362hsrxc` | 카카오톡 채널 |
| KR | 카카오톡 채널 `https://pf.kakao.com/_DPDxib` | LINE |
| EN | LINE `https://line.me/R/ti/p/@362hsrxc` | 카카오톡 채널 |

- 첫 접속은 항상 **일본어**(`<html lang="ja">`, 히어로 문구 일본어).
- 전환한 언어는 `localStorage`(`nunu-lang`)에 저장되어 재방문 시 유지됩니다.
  유지하지 않으려면 `app.js` 의 `initialLang()` 에서 `localStorage` 부분을 지우면 됩니다.
- `?lang=jp` · `?lang=kr` · `?lang=en` 링크로 특정 언어 페이지를 바로 열 수 있습니다
  (광고·QR·링크 배포 시 유용).

### 문구 수정 방법

일본어는 `index.html` 원문이 기준입니다(`data-i18n` 키가 붙은 요소).
한국어·영어는 `app.js` 상단 `I18N.kr` / `I18N.en` 사전에서 같은 키를 고치면 됩니다.
**문구를 바꾼 뒤에는 폰트 서브셋을 다시 만들어야** 새 글자가 빠지지 않습니다:

```bash
python3 ../tools/build-studio-nunu-fonts.py
```

## 예약 링크

모든 예약 CTA는 `data-cta="primary | secondary"` 로 표시되어 있고, `app.js` 의
`CHANNELS` 표에 따라 언어별로 `href` 가 자동 배정됩니다. 링크를 바꿀 때는
`app.js` 의 `URLS` 한 곳만 고치면 사이트 전체에 반영됩니다.

## 검증

```bash
python3 ../tools/verify-studio-nunu.py
```

- 데스크톱 1440×900 / 모바일 390×844 실제 크로미움 렌더
- JP 기본 노출, JP↔KR↔EN 전환, 언어별 CTA 채널(LINE·카카오톡) 일치
- 이미지 18장 로드, 콘솔·페이지·요청 실패 0건, 가로 오버플로 0건
- 갤러리 필터·모바일 내비 동작
- `preview/01~04.png` 재생성

## 정보의 출처와 한계

- 브랜드·슬로건·시술 항목·위치·팔로워 수(11.9만)·카카오 채널 친구 수(1,418)는
  전달받은 정보와 스튜디오누누 인스타그램(@studio_nunu___)에서 확인한 값입니다.
- 「1ヶ月平均300人以上の日本のお客様」「アイドル・インフルエンサー・俳優も訪れる」는
  스튜디오 측이 인스타그램 게시물에서 안내 중인 문구로, 그대로 인용하면서 출처를 표기했습니다.
- **확인되지 않아 비워 둔 항목**: 시술 금액, 영업시간, 시술 소요 시간, 주차·예약금 규정.
  현재는 모두 "LINE·카카오톡 상담 시 안내", "예약 시 안내"로 표기되어 있습니다.
  실제 값이 확정되면 `index.html`(일본어) + `app.js`(한국어·영어)의 해당 키를 채우면 됩니다.
  - 금액: `vPrice` · `card*Desc` · `sigLead`
  - 영업시간: `vHours`
- 사진 15장은 모두 스튜디오누누 공식 인스타그램 게시물에서 내려받은 실제 시술 사진입니다
  (외부 스톡 이미지 없음). 각 사진의 원본 게시물 링크는 갤러리 타일 클릭 시 연결됩니다.

### 사진 출처(인스타그램 게시물)

| 파일 | 원본 |
|------|------|
| `lip-art-makeup.jpg` | /p/DFFQ8niJvEN/ (リップアートメイク Before/After, 히어로) |
| `combo-brow.jpg` | /p/DfqzaZ1ps9h/ (コンボ眉 Before/After) |
| `post-01.jpg` | /p/DFFQ8niJvEN/ |
| `post-02.jpg` | /p/DXoITQGEbEH/ (일본 고객 리뷰) |
| `hero-lip.jpg` | /p/Dfy5U0QpqpB/ (립 고해상 원본, 갤러리 타일) |
| `post-03.jpg` | /p/DW7oqvricx4/ |
| `post-04.jpg` | /reel/Df1YAgnpRSL/ |
| `post-06.jpg` | /p/DfqzaZ1ps9h/ |
| `post-07.jpg` | /reel/DfoVcE2pL9T/ |
| `post-08.jpg` | /p/DfdjYJSplro/ |
| `post-09.jpg` | /p/De_sJADJdW5/ |
| `post-10.jpg` | /reel/De5m5-qJlwy/ |
| `post-11.jpg` | /p/De1UcsppQov/ |
| `post-12.jpg` | /reel/DewGINkpBhm/ |
| `profile.jpg` | 프로필 사진(150×150, 예비용) |

## 라이선스

폰트: Noto Serif JP / Noto Serif KR / Noto Sans JP / Noto Sans KR (SIL Open Font License 1.1).
사진: STUDIO NUNU 소유. 다른 사이트에서 사용할 때는 스튜디오의 허락이 필요합니다.
