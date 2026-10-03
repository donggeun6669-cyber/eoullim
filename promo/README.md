# 어울림 발표자료 · 홍보 영상 (2026-10-03, v3 + 한국 친구)

앱(`src/`)과 따로 있다. Vite 빌드·Vercel 배포에 들어가지 않는다. 만든 파일(`out/`)은 git에 올리지 않는다.
DEAN 사본: `03_PROJECTS/AI융합커뮤니티/발표자료/` (`어울림_발표.pptx`·`.pdf`, `어울림_홍보영상_50초_2026-10-03.mp4`).

| 하고 싶은 것 | 명령 (저장소 맨 위에서) |
|---|---|
| 앱 화면 다시 찍기 | 촬영용 DB로 앱 띄우기 `npm run dev -- --port 5175 --mode promo` (`.env.promo.local`에 `EOULLIM_DB=eoullim/db-promo.json`) → `node promo/tools/capture-screens.mjs` |
| 발표 PPT (3분 30초, 9장) | `python3 promo/tools/build-deck.py <폴더>` → `soffice --headless --convert-to pdf <폴더>/어울림_발표.pptx` (나눔고딕) |
| 발표 PPT 5분판 (영상 포함, 10장) | `python3 promo/tools/build-deck.py <폴더> --five` (영상 MP4가 먼저 있어야 함) → 대본 `.md`·`.html`도 같이 생김. HTML은 Chrome으로 PDF 인쇄 |
| 기능설명 PDF | `node promo/tools/build-guide.mjs <폴더>` → 내부용(멘토 초대 코드 포함) + 공유용 |
| 영상 미리보기 | `promo/index.html` 더블클릭 (소리는 조작부 버튼) · 특정 시점 `index.html?t=27.5` |
| 영상 MP4 (무음) | `node promo/tools/render-mp4.mjs` — 한 프레임씩 찍는다, 약 4분 |
| 소리 붙이기 | `python3 promo/tools/make-audio.py` → `out/어울림_홍보_50초_1080p_사운드.mp4` · 점검 `python3 promo/tools/check-audio.py` |
| 시점 캡처 | `node promo/tools/snapshots.mjs <폴더> 3 15 27 47` |

- 촬영 스크립트는 **운영·개발 DB를 건드리지 않는다** — 매번 `db-promo.json`만 지우고 예시 데이터로 새로 시작한다.
  기기 3대: 필리핀 유학생 Joy(필리핀 2조) · 한국 친구 서연(같은 조) · 한국인 멘토(`.env.local`의 초대 코드, 화면·로그에 안 남김).
- 숫자는 `server/logic.js`의 `RULES`와 같다 (수수료 15% · 2일 전 무료 취소 · 한국 친구 조당 2명 · 멘토 최대 3개 조 · 멘토 몫 30% · 15개 언어).

## 영상 (50초 · 1920×1080 · 내레이션 없음)

검고담임 광고 영상(2026-09-28)의 재생기·렌더러·소리 합성기를 가져와 장면만 새로 짰다. 배경음악도 같은 곡·같은 구간
(Pixabay Content License, `assets/audio/SOURCES.md`) — 곡이 열리는 14.4초에 우리 조 멤버가 폰 밖으로 펼쳐진다.

| 시간 | 장면 | 문구 |
|---|---|---|
| 0–6 | 문제 | 한국에 온 첫 학기, / 혼자 적응하고 있나요? |
| 6–14.4 | 시작 | 학교와 나라만 고르면 / 우리 조가 생겨요. |
| 14.4–22.5 | 우리 조 | 같은 나라 친구 3~4명 / + 한국인 멘토 1명. (+ 이번 주 미션) |
| 22.5–31 | 한국 친구·번역 | 관심 있는 한국 학생은 / 「한국 친구」로 함께. (Joy 원문 → 서연 화면의 한국어) |
| 31–41 | 이벤트 | 우리 조와 함께 가는 / 이벤트. (Undas → 결제 데모 → 참가 신청 완료) |
| 41–45 | 커뮤니티 | 가벼운 도움은 / 커뮤니티에서. (성대 공식 안내 먼저) |
| 45–50 | 마무리 | 어울림 로고 · 한국에서 함께할 우리 조를 만나요. · QR |

사실 표현: 폰 안은 전부 실제 앱 캡처이고 아래에 「실제 앱 화면 · 예시 데이터」, 결제 장면에는 「결제는 데모」를 단다.
폰 밖 카드(멤버·번역·이벤트·공식 안내)는 캡처 속 글자를 그대로 옮긴 광고용 연출이다.
