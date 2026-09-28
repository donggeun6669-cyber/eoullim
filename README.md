# Eoullim 어울림

국내 외국인 유학생·교환학생을 위한 캠퍼스 생활 도우미 — 성균관대 HUSS AI BRIDGE 「AI 융합 커뮤니티」 2gether 팀 프로토타입.
Campus-life helper for international and exchange students at SKKU.

링크(QR)로 여는 모바일 웹앱입니다. 설치가 필요 없습니다.

## 기능

| 신청서의 기능 | 앱 화면 |
|---|---|
| 기본 — 기존 지원 프로그램 소개·연결 | **Guide › Programs** — SG MAPLE, HI-Club, S-LINK, 학부대학 글로벌 버디, OISS, 국제처, 성균어학원, 학생상담센터 (공식 페이지 링크) |
| 메인 — 유학생 선후배·교환학생 커뮤니티 | **Home / Find / Chat** — 멘토·멘티 매칭, 도움 요청 → 자동 연결 → 채팅(번역) → 도움 확인(+50 P) · **Community** — 모먼트, Q&A, 모임 |
| 메인 — 한국 친구 소개 | **Find › Friends** — 관심사·언어가 겹치는 한국 학생 추천, 인사하기 |
| AI (필요시 LLM) | **Guide › Help Bot** — 성균관대 공식 안내 15개 주제에서 답을 찾아 **출처 링크와 함께** 답함. 질문 언어(한/영)에 맞춰 답하고, 안내에 없으면 추측하지 않고 멘토·Q&A로 넘김 |

그 밖에: 영어/한국어 전환, 학교 선택(성균관대만 활성), 포인트·리워드(팀 제안), 프로젝트 소개 화면(`#/about`).

## 데이터에 대해

- **공식 안내(`src/data/kb.js`, `src/data/programs.js`)** — 2026-09-28 성균관대 공식 페이지(oiss.skku.edu, skku.edu/eng, koreansli.skku.edu, hakbu.skku.edu)에서 모았고, 모든 답에 출처를 붙였다.
  - 은행·휴대폰 안내는 2020년 가을 교환학생 핸드북 기준이라 앱에 "옛 안내서" 표시가 뜬다.
  - 셔틀버스는 노선만 확인됨. 요금·시간표는 공식 페이지로 안내한다.
- **사람·채팅·게시글·포인트는 예시 데이터**다. 브라우저 `localStorage`에만 저장되고 서버로 가지 않는다. 포인트 화면 맨 아래 「데모 데이터 초기화」로 되돌린다.
- **유료 LLM API를 쓰지 않는다.** 헬프봇은 키워드 검색으로 공식 안내를 찾는다 — 비용 0원, 지어낸 답 없음.

## 실행

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/
```

배포는 Vercel (GitHub `main`에 푸시하면 자동 배포). 저장소가 private이라 GitHub Pages 워크플로(`.github/workflows/deploy.yml`)는 수동 실행으로만 남겨 두었다 — 무료 플랜에서는 동작하지 않는다.

## 디자인

김다미(Wint Yi Kyaw)의 Claude 프로토타입 「Eoullim Mobile Prototype」(2026-09-28)을 바탕으로 했다 —
색(#5B4DFF · #0F1B2E), 글꼴(Bricolage Grotesque + Noto Sans KR), 하단 5탭, 멘토 카드, 포인트 구조.

## 팀

2gether — 정동근(팀장, 영어영문학과) · 김다미 Wint Yi Kyaw(국어국문학과)
