# STUDIO NUNU — 3개 국어 공식 홈페이지

- 라이브: https://snow196830-stack.github.io/studionunu/
- **관리자 페이지: https://snow196830-stack.github.io/studionunu/admin/** (원장님이 직접 문구·가격을 고치는 곳. 검색 노출 안 됨)

스튜디오누누(STUDIO NUNU)의 다국어 원페이지 사이트입니다.
일본어(기본) · 한국어 · 영어 3개 국어를 상단에서 즉시 전환할 수 있습니다.

```
studio-nunu/
├── index.html            # 마크업(일본어 원문이 기본값)
├── styles.css            # 디자인·반응형
├── app.js                # 언어 전환 / 예약 채널 자동 배정 / 갤러리 필터 / 릴스 캐러셀
├── data/
│   └── content.json      # ★ 원장님이 /admin/ 에서 고치는 문구·메뉴·가격·링크·릴스
├── admin/
│   ├── index.html        # 관리자 편집 페이지 (noindex)
│   ├── admin.css
│   └── admin.js          # 폼 → GitHub Contents API 커밋 → 라이브 반영 확인
├── assets/
│   ├── *.jpg             # 스튜디오누누 인스타그램 실제 이미지
│   ├── reel-*.mp4        # 인스타 릴스 원본 영상(720×1280, H.264, 합계 약 6MB)
│   ├── reel-*.jpg        # 릴스 썸네일(poster)
│   └── fonts/            # 셀프호스팅 서브셋 웹폰트(Noto Serif/Sans JP·KR)
└── preview/              # 검증 스크린샷
```

## 관리자 페이지 (`/admin/`) — 원장님 전달용

주소: **https://snow196830-stack.github.io/studionunu/admin/**

원장님이 코드 없이 홈페이지 문구를 고치는 페이지입니다. 공개 코드에는 토큰도 비밀번호도 들어 있지 않고,
원장님 브라우저에만 토큰이 저장됩니다.

### 처음 한 번 — 토큰 발급 3단계

1. https://github.com/settings/personal-access-tokens/new 를 엽니다(원장님 GitHub 로그인 상태).
2. 아래처럼 설정합니다.
   - **Token name**: `studionunu-admin`
   - **Expiration**: `1 year` (또는 원하는 기간)
   - **Repository access**: `Only select repositories` → `snow196830-stack/studionunu`
   - **Permissions → Repository permissions → Contents**: `Read and write`
3. **Generate token** 을 누르고, 한 번만 보이는 `github_pat_…` 값을 복사해 `/admin/` 화면에 붙여넣고 **연결하기**.

이후에는 문구를 고치고 **[저장 및 홈페이지 반영]** 만 누르면 됩니다(약 30~60초 뒤 라이브 반영).
토큰을 잊었거나 만료되면 위 3단계로 새로 만들면 됩니다.

### 고칠 수 있는 것

| 영역 | 내용 |
|---|---|
| 기본 · 공지 | 상단 공지바(PC·모바일 문구 따로), 히어로 제목·소개·배지 |
| 예약 링크 | LINE / 카카오톡 채널 / 인스타그램 / 카카오맵 주소 |
| 영업시간 · 주소 · 주차 | 오시는 길 영역 5줄 |
| 시술 메뉴 & 가격 | 메뉴 추가·삭제·순서, 이름·설명·가격(비우면 가격 줄 숨김), 리턴핑크 블록 |
| 인스타 릴스 | 제목·설명·릴스 주소·순서 (영상·썸네일은 고급 항목) |

- 언어 탭(한국어 / 日本語 / English)을 바꿔 가며 각 언어 문구를 채웁니다. 비워 둔 언어는 이전 문구가 남습니다.
- 토큰 없이도 **content.json 내려받기·올리기**로 백업·복원할 수 있습니다.
- PIN 잠금(선택): 토큰을 PBKDF2 + AES-GCM 으로 암호화해 저장하고, 열 때 PIN을 묻습니다.
- 새로 넣은 글자가 홈페이지 셀프호스팅 폰트에 없으면 시스템 폰트로 표시됩니다(깨지지 않음).
  폰트까지 맞추려면 아래 `build-studio-nunu-fonts.py` 를 다시 실행합니다.

## 홈페이지가 문구를 읽는 방식

`index.html` + `app.js` 안의 일본어·한국어·영어 기본 문구는 **폴백**입니다.
`data/content.json` 이 있으면 그 값이 화면에 적용되고, 없거나 읽지 못하면 기본 문구로 그대로 동작합니다(화면이 깨지지 않음).

- 정적 문구: `index.html` 의 `[data-content="hero.title"]` 같은 요소를 `app.js` 가 덮어씁니다.
- 시술 메뉴 카드·릴스 캐러셀: `content.json` 의 배열로 다시 그립니다(추가·삭제·순서 반영).
- 깨짐 방지: 카드·릴스 목록이 비어 있으면 기본 마크업을 유지합니다.


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

원장님은 **[관리자 페이지](https://snow196830-stack.github.io/studionunu/admin/)** 에서 고치는 것이 기본입니다.
개발자가 코드로 고칠 때는:

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
python3 ../tools/verify-studio-nunu.py     # 로컬 렌더·동작·링크·프리뷰
git push origin main                        # studio-nunu-deploy → GitHub Pages
python3 tools/verify-live.py                # 라이브 확인(content.json·/admin/ 포함)
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
