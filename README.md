# Eoullim 어울림 — v2

버디가 없는 외국인 유학생이 **포인트를 걸고 물어보면 누군가 답해 주는** 캠퍼스 커뮤니티 — 성균관대 HUSS AI BRIDGE 「AI 융합 커뮤니티」 2gether 팀.
A campus community where international students without a buddy put points on a question and the adopted answer gets them.

**데모: https://eoullim-skku.vercel.app** (소개: `#/about`) · 가입·로그인 없이 QR로 바로 쓴다.
v1(멘토 매칭 데모, 2026-09-28)은 태그 `v1-demo`에 남아 있다.

## 기능

| 화면 | 무엇 |
|---|---|
| **홈** | 프로필 카드(선택) · 내 포인트 · 바로 가기 · 답을 기다리는 질문 · 모집 중 |
| **해결** | 포인트 걸고 묻기 — 알려줄 사람 / 빌려줄 사람 / 해줄 사람. 채택하면 포인트가 답변자에게. 72시간 무답변 자동 환불, 7일 미채택은 관리자 결정 |
| **커뮤니티** | 같이 해요(모집·참여) · 자유 · 언어별 라운지(국적 대신 언어) · 인기. 기본 익명 |
| **포인트** | 100원 = 1P · 충전(데모, 실제 결제 없음) · 기록 · 현금화·송금 불가 |
| **공식 안내** | 성대 공식 안내 15개 주제 + 지원 프로그램 8개. 질문을 쓰는 동안 맞는 안내를 먼저 보여 준다 (무료, 출처 링크) |
| **관리자** | 초대 코드로만 켜진다. 한국식 질문 답변(배지) · 대신 채택 · 환불 · 가리기 · 수익 풀(매출 30%) · 데모용 시간 앞당기기 |

개인정보: 이름·학번·국적·연락처·위치를 받지 않는다. 기기마다 무작위 코드(= 복구 코드)를 만들고 서버는 그 해시만 저장한다. 글 속 전화번호·이메일·메신저 ID는 서버에서 `***`로 가린다. 프로필은 기기에만 저장되고 글에는 닉네임·아바타만 붙는다.

정의 문서: DEAN `03_PROJECTS/AI융합커뮤니티/PRD_v2.md`.

## 구조

| 경로 | 무엇 |
|---|---|
| `src/` | React + Vite 화면 (해시 주소) |
| `api/rpc.js` | Vercel 함수 하나. `POST /api/rpc` `{ action, ... }` + 헤더 `x-device-key` |
| `server/logic.js` | 포인트·채택·환불·신고 규칙 (모든 계산은 서버에서) |
| `server/store.js` | 비공개 Vercel Blob(서울 `icn1`)의 JSON 한 개. ETag 조건부 저장으로 동시에 써도 안 꼬인다 |
| `server/seed.js` | 첫 화면용 예시 글 (앱에 「예시」 표시, 시간 규칙 적용 안 함) |

저장 위치: 운영 `eoullim/db.json` · 미리보기 `eoullim/db-preview.json` · 로컬 `eoullim/db-dev.json` (`.env.local`의 `EOULLIM_DB`).

## 실행

```bash
npm install
npx vercel env pull .env.local   # BLOB_READ_WRITE_TOKEN
# .env.local에 ADMIN_CODE=… 와 EOULLIM_DB=eoullim/db-dev.json 추가
npm run dev                      # http://localhost:5173 (로컬에서도 /api/rpc가 돈다)
```

배포: `main`에 푸시하면 Vercel 프로젝트 `eoullim`이 자동 배포 → `eoullim-skku.vercel.app`. 환경 변수 `ADMIN_CODE`(관리자 초대 코드)와 `BLOB_READ_WRITE_TOKEN`이 Vercel에 있다.
유료 LLM API를 쓰지 않는다.

## 팀

2gether — 정동근(팀장, 영어영문학과) · 김다미 Wint Yi Kyaw(국어국문학과). 디자인 색·글꼴은 김다미 프로토타입(2026-09-28)을 따른다.
