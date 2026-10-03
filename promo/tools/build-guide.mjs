// 어울림 v3 기능 설명 PDF (A4) — 내부용(멘토 초대 코드 포함) + 공유용(코드 없음) 두 개를 만든다.
//
//   node promo/tools/build-guide.mjs <출력 폴더>
//
// 화면은 promo/assets/screens (capture-screens.mjs). 숫자는 server/logic.js RULES 와 같다.
// 초대 코드는 .env.local 의 ADMIN_CODE 를 읽어 내부용에만 넣는다(로그에 찍지 않는다).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const PW = process.env.PLAYWRIGHT_PATH
  || '/Users/r_o_und_12/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(ROOT, 'out'));
const TMP = join(ROOT, 'out/guide');
mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });
const ADMIN_CODE = (readFileSync(join(ROOT, '../.env.local'), 'utf8').match(/^ADMIN_CODE=(.*)$/m) || [])[1]?.replace(/^"|"$/g, '');

// 화면 이미지는 PDF 용량을 줄이려고 폭 540px로 줄여 쓴다
const SHOTS = ['a01_welcome', 'a04_home', 'a03_group', 'b04_home_kr', 'b03_group_chat_kr', 'a05_events', 'a07_pay', 'a09_community', 'a10_ask', 'a11_points', 'c01_mentor'];
const img = {};
for (const s of SHOTS) {
  const f = join(TMP, `${s}.jpg`);
  execFileSync('magick', [join(ROOT, 'assets/screens', `${s}.png`), '-resize', '540x', '-quality', '86', f]);
  img[s] = pathToFileURL(f).href;
}
const ph = (s, cap) => `<figure class="ph"><img src="${img[s]}" alt=""><figcaption>${cap}</figcaption></figure>`;

function html(share) {
  const code = share
    ? '<p class="warn">멘토 초대 코드는 팀장(정동근)에게 따로 받으세요. 공유용 문서에는 적지 않았습니다.</p>'
    : `<p class="warn">멘토 초대 코드: <b class="mono">${ADMIN_CODE}</b> — 운영·미리보기 모두 같은 코드(Vercel <span class="mono">ADMIN_CODE</span>). 대소문자 상관없음. <b>이 판은 밖에 보내지 마세요</b> — 밖으로는 공유용 PDF.</p>`;
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>어울림 v3 기능 설명</title><style>
@page { size: A4; margin: 15mm 14mm 15mm 14mm; }
* { box-sizing: border-box; }
body { margin: 0; font-family: 'NanumGothic', 'Apple SD Gothic Neo', sans-serif; color: #0F1B2E; font-size: 9.6pt; line-height: 1.55; word-break: keep-all; }
.top { color: #5D6577; font-size: 8.5pt; }
h1 { font-size: 22pt; margin: 4px 0 6px; letter-spacing: -0.02em; }
.lead { font-size: 11pt; color: #33405A; margin: 0 0 12px; }
h2 { font-size: 13pt; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #5B4DFF; break-after: avoid; }
h3 { font-size: 10.5pt; margin: 10px 0 4px; break-after: avoid; }
table { width: 100%; border-collapse: collapse; margin: 4px 0 8px; break-inside: auto; }
tr { break-inside: avoid; }
th, td { text-align: left; vertical-align: top; padding: 5px 8px; border-bottom: 1px solid #E4E6EB; }
th { width: 24%; background: #F5F6F8; font-weight: 700; }
thead th { background: #EEECFF; width: auto; }
.mono { font-family: Menlo, monospace; font-size: 9pt; background: #F5F6F8; padding: 0 4px; border-radius: 3px; }
.warn { background: #FCEDED; color: #8E1F1F; padding: 8px 10px; border-radius: 8px; }
.note { background: #EEECFF; padding: 8px 10px; border-radius: 8px; color: #2B1FB8; }
.row { display: flex; gap: 14px; align-items: flex-start; }
.row > .col { flex: 1; min-width: 0; }
.shots { display: flex; gap: 10px; justify-content: flex-end; flex: none; }
.ph { margin: 0; width: 128px; text-align: center; break-inside: avoid; }
.ph img { width: 128px; border-radius: 14px; border: 3px solid #0F1B2E; display: block; }
.ph figcaption { font-size: 7.5pt; color: #5D6577; margin-top: 3px; }
ol, ul { margin: 4px 0 8px; padding-left: 18px; }
li { margin: 2px 0; }
.todo { color: #8E1F1F; }
.pb { break-before: page; }
.qr { width: 70px; float: right; margin-left: 10px; }
</style></head><body>
<div class="top">AI 융합커뮤니티 · 팀 2gether · 2026-10-03${share ? ' · 공유용' : ' · 내부용 (팀장)'}</div>
<h1>어울림 v3 기능 설명</h1>
<p class="lead">한국에 온 외국인 유학생에게 <b>같은 나라 친구 3~4명 + 한국인 멘토 1명의 「우리 조」</b>를 만들어 주는 캠퍼스 앱.
관심 있는 한국 학생은 <b>「한국 친구」</b>로 들어온다. 그룹은 무료, 수익은 <b>이벤트 참가비 수수료(메인)</b>와 <b>포인트(보조)</b>.</p>
<div class="row"><div class="col">
<table>
<tr><th>주소</th><td><span class="mono">https://eoullim-skku.vercel.app</span> (QR: <span class="mono">Eoullim_QR.png</span> 그대로) · 소개 <span class="mono">#/about</span></td></tr>
<tr><th>가입</th><td>없음. 「시작하기 — 무료」 → 외국인 유학생 / 한국 학생 → 학교 · 나라 · 앱 언어 · 닉네임</td></tr>
<tr><th>서버</th><td>Vercel 함수 + Vercel 저장소(Blob). <span class="mono">main</span>에 올리면 자동 배포</td></tr>
<tr><th>언어</th><td>15개. 영어·한국어는 직접 쓴 글, 나머지 메뉴는 기계 번역. 글·채팅·이벤트는 내 언어로 자동 번역 + 「원문 보기」</td></tr>
<tr><th>정의 문서</th><td>DEAN <span class="mono">03_PROJECTS/AI융합커뮤니티/DECISIONS.md</span> 2026-10-01 두 항목 (v3 · 한국 친구). <span class="mono">PRD_v2.md</span>는 v2 기준</td></tr>
</table>
</div>${ph('a01_welcome', '시작 화면')}</div>

<h2>1. 화면 구성 — 아래 탭 5개</h2>
<div class="row"><div class="col">
<table><thead><tr><th>탭</th><th>무엇이 있나</th></tr></thead>
<tr><th>홈</th><td>내 그룹 카드(최근 메시지 · 이번 주 미션) · 다가오는 이벤트 · 도움을 기다려요. 한국 학생이면 「내가 관심 있는 나라」 카드</td></tr>
<tr><th>내 그룹</th><td>그룹방 — 멤버 · 멘토 · 한국 친구 · 빈자리, 이번 주 미션, 우리 조가 가는 이벤트, 채팅</td></tr>
<tr><th>커뮤니티</th><td>도움·질문 / 같이 해요 / 자유 / 언어별 / 인기 — 게시판 하나. 위에 「성대 공식 안내」</td></tr>
<tr><th>이벤트</th><td>한국 체험 · 나라별 명절 · 그룹 대항. 「우리 나라 행사」가 먼저. 내 신청</td></tr>
<tr><th>포인트</th><td>잔액 · 충전(데모) · 규칙 · 이벤트 결제 내역</td></tr>
</table>
<p><b>소속 바</b> — 모든 화면 맨 위에 「🏫 성균관대학교 › 커뮤니티 게시판 · 🇵🇭 필리핀 2조」처럼 학교 · 지금 있는 곳 · 우리 조가 보인다.
그 밖에: 설정(홈 오른쪽 위 톱니) — 언어 · 실시간 번역 켜고 끄기 · 복구 코드 · 한국인 멘토 · 데모 화면 전환 / 프로필 / 프로젝트 소개.</p>
</div>${ph('a04_home', '홈')}</div>

<h2>2. 우리 조 — 핵심 기능 (무료)</h2>
<div class="row"><div class="col">
<h3>들어가는 법 (외국인 유학생)</h3>
<ol><li>학교 → 어느 나라에서 왔는지 → 앱 언어 → 닉네임(선택, 실명 말고)</li>
<li>「○○ 조 만나기」 → <b>같은 학교 · 같은 나라</b> 그룹에 자동 배정. 4명이 차면 다음 조</li>
<li>3명이 모이면 「그룹이 시작됐어요」. 나라는 그룹 배정에만 쓰고 글에는 안 보인다</li></ol>
<table>
<tr><th>인원</th><td>학생 최대 4명 (3명이면 시작) + 한국 친구 최대 2명 + 한국인 멘토 1명. 멘토 1명은 최대 3개 조</td></tr>
<tr><th>이번 주 미션</th><td>매주 월요일(한국 시간) 바뀌는 6개 순환 — 학식 같이 먹고 사진 · 나라 노래 추천 · 한국에서 처음 놀랐던 일 · 멘토와 30분 동네 걷기 · 내 나라 말 한 단어 · 처음 먹는 한국 간식. 누군가 「우리 조 완료」를 누르면 끝</td></tr>
<tr><th>채팅</th><td>어떤 언어로 써도 된다. 각자 자기 언어로 자동 번역 + 「원문 보기」. 그룹방을 열어 두면 3초마다 새로 불러온다</td></tr>
<tr><th>나가기</th><td>그룹방 맨 아래 「그룹 나가기」. 학생이 0명이 된 조는 한국 친구·멘토 배정에서 빠지고, 그 나라 학생이 새로 오면 다시 쓴다</td></tr>
</table>
</div>${ph('a03_group', '그룹방')}</div>

<h2>3. 한국 친구 — 관심 있는 한국 학생 (무료)</h2>
<div class="row"><div class="col">
<p>2026-10-01 오프라인 멘토링 질문(「특정 나라에 관심 있는 한국인과 그 나라 학생을 잇는 기능이 있나」)에 답해 넣은 기능.</p>
<ol><li>시작하기 → <b>한국 학생</b> → 학교 → 관심 있는 나라 <b>최대 3개</b>(나라마다 빈자리 수가 보인다) → 함께할 수 있는 것(언어 교환 등) → 닉네임</li>
<li>「한국 친구로 함께하기」 → 고른 순서대로, 빈자리가 있는 그 나라 조에 들어간다 (<b>조당 2명</b>, 학생이 많은 조부터)</li>
<li>빈자리가 없으면 관심 나라만 저장하고, 그 나라 이벤트·라운지를 추천한다</li></ol>
<table>
<tr><th>한국 친구 ≠ 멘토</th><td>한국 친구는 누구나·무료. 멘토는 초대 코드로 켜고, 조를 책임지고, 이벤트를 열고, 수익 몫을 받는다</td></tr>
<tr><th>보이는 곳</th><td>그룹방(「🇰🇷 한국 친구」 표시) · 홈 「한국 학생 · 내가 관심 있는 나라」 카드 · 소속 바 「필리핀 2조 · 한국 친구」 · 나라별 이벤트에 「관심 있는 한국 학생 n명」</td></tr>
</table>
</div><div class="shots">${ph('b04_home_kr', '한국 학생 홈')}${ph('b03_group_chat_kr', '번역된 채팅')}</div></div>

<h2>4. 이벤트 — 메인 수익</h2>
<div class="row"><div class="col">
<table>
<tr><th>종류</th><td>🇰🇷 한국 체험(사주 카페 · 신당동 괴담 투어 · 한복 경복궁 · 한글날 캘리그라피) · 🌏 나라별 명절(필리핀 Undas · 베트남 여성의 날 · 우즈베키스탄 헌법의 날) · 🏆 그룹 대항(체육대회)</td></tr>
<tr><th>여는 사람</th><td>한국인 멘토와 어울림 운영팀만 (아무나 돈을 걷는 위험 차단). 참가는 누구나</td></tr>
<tr><th>참가비</th><td>0~200,000원, 100원 단위. <b>어울림 수수료 15%</b>, 나머지 85%는 진행 예산. 결제 화면에 수수료 금액이 보인다 (예: ₩12,000 → ₩1,800)</td></tr>
<tr><th>인원</th><td>정원 2~100명 · 최소 인원. 화면에 「우리 조 n명」 「관심 있는 한국 학생 n명」 · 함께 가는 조</td></tr>
<tr><th>취소·환불</th><td>행사 <b>2일 전까지 무료 취소</b>. 2일 전까지 최소 인원이 안 모이면 <b>자동 취소 · 전액 환불</b>. 멘토가 이벤트를 취소하면 전원 환불</td></tr>
<tr><th>결제</th><td><b>데모</b> — 실제로 결제되지 않는다. 실제 서비스에서는 결제대행사가 카드를 처리 (어울림은 카드 번호를 안 봄)</td></tr>
</table>
</div><div class="shots">${ph('a05_events', '이벤트')}${ph('a07_pay', '결제 (데모)')}</div></div>

<h2>5. 커뮤니티 · 포인트 — 보조 수익</h2>
<div class="row"><div class="col">
<table>
<tr><th>도움·질문</th><td>알려줄 사람(질문) · 빌려줄 사람(물건) · 해줄 사람(작은 부탁). <b>제목을 쓰는 동안 성대 공식 안내</b>에서 맞는 주제를 찾아 출처와 함께 보여 준다 → 「해결됐어요」면 올리지 않고 끝</td></tr>
<tr><th>같이 해요</th><td>오늘·이번 주 모임 모집 — 날짜 · 장소(대략) · 인원, 차면 마감</td></tr>
<tr><th>자유 · 언어별 · 인기</th><td>잡담·후기 / 언어별 라운지 / 공감+댓글 많은 글. 기본 익명, 공감 · 댓글 · 신고</td></tr>
<tr><th>포인트</th><td><b>선택</b>. 질문에 0~1,000P (100원 = 1P, 시작 30P, 충전 10·30·50·100P는 데모). 채택된 답이 전부 가져감. 72시간 무답변 → 자동 전액 환불. 7일 미채택 → 멘토가 대신 채택하거나 환불. 현금화 · 직접 송금 없음</td></tr>
<tr><th>자동으로 막는 것</th><td>글·채팅 속 전화번호 · 이메일 · 메신저 ID → 서버가 <span class="mono">***</span>로 가림. 대리 출석 · 과제 대행 · 돈 빌리기 같은 요청 → 올리기 전에 거절. 신고 3건이면 자동으로 가림</td></tr>
</table>
</div><div class="shots">${ph('a09_community', '커뮤니티')}${ph('a10_ask', '공식 안내 먼저')}</div></div>

<h2>6. 한국인 멘토</h2>
<div class="row"><div class="col">
<h3>켜는 법</h3>
<p>설정 → 「한국인 멘토」 → 초대 코드 입력 → 확인. 그 기기가 멘토 모드가 된다. 끄기도 설정에서.</p>
${code}
<h3>멘토가 하는 것 (멘토 화면: 그룹 · 이벤트 · 질문 · 신고)</h3>
<ul><li><b>그룹 맡기</b> — 「멘토를 기다리는 그룹」에서 「멘토 맡기」 (최대 3개). 그룹 채팅에 「🇰🇷 멘토」 배지</li>
<li><b>이벤트 열기</b> — 종류 · 나라 · 날짜 · 장소 · 참가비 · 정원 · 최소 인원. 수수료가 미리 계산돼 보인다</li>
<li><b>질문</b> — 7일 미채택 결정(대신 채택 · 환불), 한국식 질문 먼저 답하기, 아직 답 없는 질문</li>
<li><b>신고</b> — 가려진 글 확인, 가리기 / 다시 보이기</li>
<li><b>수익 구조(데모)</b> — 이벤트 참가비 · 수수료 15% · 포인트 판매 · 멘토 풀(어울림 수익의 30%)과 내 몫. 실적(그룹 · 이벤트 · 답변 · 관리)대로 나눈다</li>
<li><b>발표용 시간 앞당기기</b> — 질문 아래 「⏩ +72h」 「⏩ +7d」로 환불 · 멘토 결정을 바로 보여 준다</li></ul>
</div>${ph('c01_mentor', '멘토 화면')}</div>

<h2>7. 번역 · 개인정보</h2>
<table>
<tr><th>번역</th><td><b>무료 서비스만</b> — 휴대폰이 Google 무료 번역에 직접 요청 → 실패하면 서버(Google → MyMemory, 글·채팅만). 예시 글의 한국어·영어 번역은 코드에 저장돼 있어 서비스가 막혀도 보인다. 설정에서 끌 수 있다</td></tr>
<tr><th>기기 구분</th><td>처음 시작할 때 기기에 무작위 코드(<span class="mono">XXXX-XXXX-XXXX</span>)가 생긴다. 서버는 되돌릴 수 없게 바꾼 값(해시)만 저장</td></tr>
<tr><th>복구 코드</th><td>설정 → 「내 복구 코드」. 새 폰에서 「복구 코드로 되찾기」. 잃어버리면 못 찾는다</td></tr>
<tr><th>받지 않는 것</th><td>이름 · 학번 · 이메일 · 전화번호 · 학과 · 위치 · 사진. <b>나라는 받지만 그룹 배정에만</b> 쓰고 글에는 안 보인다</td></tr>
<tr><th>프로필</th><td>닉네임 · 아바타 · 쓰는 언어 · 관심사. 전부 선택, 이 기기에만 저장. 글에는 닉네임 · 아바타만</td></tr>
</table>

<h2>8. 데모 시연 순서 (약 1분 30초 · 휴대폰 1대)</h2>
<p class="note">준비: 발표 전에 운영 사이트에서 예시 그룹 상태를 확인한다 (2026-10-01 기준 필리핀 2조 학생 2명 — 새로 들어가면 3번째 멤버가 되어 「그룹이 시작됐어요」가 뜬다). 데모가 막히면 <b>홍보 영상(50초)</b>으로 대신한다.</p>
<ol>
<li>QR → 「시작하기 — 무료」 → 외국인 유학생 → 성균관대 → <b>필리핀</b> → 닉네임 → 「필리핀 조 만나기」. "가입 없이, 고르기만 하면 우리 조가 생깁니다."</li>
<li>그룹방: 멤버 · 멘토 · 이번 주 미션. 채팅에 영어로 한 줄 → "어떤 언어로 써도 각자 자기 언어로 읽습니다."</li>
<li>이벤트 탭 → 「우리 나라 행사 · 필리핀」 Undas → 「₩12,000 결제하고 참가」 → 결제하기(데모) → 참가 신청 완료 · 함께 가는 조. "그룹은 무료, 수익은 이벤트 수수료 15%."</li>
<li>설정 → 「데모: 다른 사람 화면으로 보기」 → 한국 학생으로 시작 → 필리핀 고르기 → 「한국 친구로 함께하기」 → 같은 나라 조의 한국 친구가 된다 (빈자리가 없으면 관심만 저장되고 홈으로)</li>
<li>(시간 남으면) 커뮤니티 → 물어보기 → 제목에 <span class="mono">health insurance</span> → 「성대 공식 안내」 카드. 설정에서 다시 「다른 사람 화면」으로 원래 기기로 돌아온다</li>
</ol>
<p>운영 서버라 발표장 사람들도 QR로 들어와 글을 쓸 수 있다. 이상한 글은 멘토 폰에서 「가리기」.</p>

<h2>9. 예상 질문과 답</h2>
<table>
<tr><th>기존 버디 프로그램과 뭐가 달라요?</th><td>버디는 잘 작동한다 — 교환학생은 SG MAPLE로 적응한다. 어울림은 그 사각지대(글로벌 버디 대상이 아닌 학위과정 2학년 이상 · 편입생 · 대학원생)와 1:1이 부담스러운 학생을 위한 것. 1:1이 아니라 같은 나라 친구들 + 멘토의 <b>그룹</b>이 한 학기 내내 간다</td></tr>
<tr><th>그룹이 무료면 돈은 어떻게 벌어요?</th><td>이벤트 참가비의 15%(메인) + 포인트 판매(보조). 사람들이 원래 돈을 내는 활동이라 결제 저항이 작다. <span class="todo">[15%는 이벤트 플랫폼 수준으로 잡은 가정 — 조사한 수치 아님]</span></td></tr>
<tr><th>멘토는 왜 해요?</th><td>어울림 수익의 30%를 실적대로 받는다 — 한국 학생에게는 캠퍼스 일자리. 한국 친구는 무료로, 관심 있는 나라 친구를 사귀러 온다</td></tr>
<tr><th>국적을 받는데 개인정보는?</th><td>그룹을 만드는 데만 쓰고 글에는 안 보인다. 이름 · 학번 · 연락처는 받지 않는다. 계정 없이 기기 코드로만</td></tr>
<tr><th>번역은 돈이 안 들어요?</th><td>지금은 무료 서비스만 쓴다. 한 곳에서 많이 부르면 막힐 수 있어(2026-10-01 이 맥에서 확인), 실서비스면 정식 번역 API가 필요하다 <span class="todo">[유료 — 결정 전]</span></td></tr>
<tr><th>결제는 법적으로 괜찮아요?</th><td>지금은 데모. 실제로는 결제대행사가 카드를 처리한다. 포인트는 현금화 · 송금을 막아 앱 안에서만. 출시 전 전자금융 · 전자상거래 규정 확인 필요 <span class="todo">[확인 전]</span></td></tr>
<tr><th>AI는 어디에?</th><td>실시간 번역, 질문 → 성대 공식 안내 자동 매칭, 개인정보 자동 가림, 금지 요청 걸러내기. 유료 LLM 없음 — 지어낸 답이 없고 서버비가 거의 0</td></tr>
<tr><th>로그인이 없으면 악용은?</th><td>포인트는 현금화가 안 되고, 이벤트는 멘토 · 운영팀만 연다. 신고 3건 자동 가림, 멘토 가리기, 기기당 쓰기 속도 제한</td></tr>
<tr><th>성대 말고 다른 학교는?</th><td>학교를 고르면 같은 학교끼리만 그룹이 된다 (성균관대 · 한동대 · 충남대 · 다른 대학교). 다음 단계는 성대 국제처와 협업해 신입 유학생에게 첫날부터 우리 조를 주는 것 (멘토링 피드백)</td></tr>
</table>

<h2>10. 알고 있어야 할 한계</h2>
<ul>
<li>결제 · 충전은 데모 — 결제대행사 연결 없음. 화면에 DEMO 표시</li>
<li>「예시」 그룹 · 이벤트 · 글은 팀이 넣은 것 (그룹 8 · 이벤트 8). 예시 글은 시간 규칙(72시간 · 7일)이 적용되지 않는다</li>
<li>알림 없음 — 앱을 열어 두면 8초마다(그룹방은 3초마다) 새로 불러온다</li>
<li>무료 번역은 막힐 수 있다 — 막히면 영어 · 한국어 외 언어의 <b>메뉴</b>는 영어로 남는다 (글 · 채팅은 MyMemory로 번역, IP당 하루 약 5,000자)</li>
<li>멘토 초대 코드는 하나뿐 — 누가 멘토인지는 닉네임으로만 구분</li>
<li>공식 안내 중 은행 · 휴대폰은 2020년 안내서 기준(앱에 표시), 셔틀 요금 · 시간표는 확인 안 됨</li>
<li>데이터는 Vercel Blob의 JSON 파일 하나 — 데모 · 발표 규모에는 충분, 사용자가 수천 명이면 DB로 바꿔야 한다</li>
<li>쪽지(1:1) · 사진 · 글 끌어올리기는 없다. v1(멘토 매칭)은 GitHub 태그 <span class="mono">v1-demo</span></li>
</ul>

<h2>11. 발표자료 · 영상</h2>
<table>
<tr><th>발표 5분판</th><td><span class="mono">발표자료/어울림_발표_5분.pptx</span> (10장, 3장에 홍보 영상 50초가 들어 있음 · 노트에 시간 표시 대본) · <span class="mono">어울림_발표_5분.pdf</span> · 대본 <span class="mono">어울림_발표대본_5분.pdf</span>. 합계 4분 45초</td></tr>
<tr><th>발표 3분 30초판</th><td><span class="mono">발표자료/어울림_발표.pptx</span> (9장, 영상 없음, 슬라이드 노트에 발표 대본) · 같은 폴더 <span class="mono">어울림_발표.pdf</span>. 글꼴 나눔고딕 — 발표장 PC에 없으면 PPT 글꼴이 바뀌므로 <b>PDF로 발표하는 것이 안전</b></td></tr>
<tr><th>홍보 영상</th><td><span class="mono">발표자료/어울림_홍보영상_50초_2026-10-03.mp4</span> — 50초 · 1080p · 배경음악 + 효과음 · 내레이션 없음. 데모가 막힐 때 대신 틀 수 있다</td></tr>
<tr><th>화면</th><td>전부 실제 앱 화면. 촬영용 저장소(운영 데이터와 따로)에서 2026-10-03에 찍었다</td></tr>
</table>
</body></html>`;
}

const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
for (const share of [false, true]) {
  const h = join(TMP, share ? 'guide-share.html' : 'guide.html');
  writeFileSync(h, html(share));
  await page.goto(pathToFileURL(h).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(OUT, share ? '어울림_기능설명_공유용.pdf' : '어울림_기능설명.pdf');
  await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
  console.log('저장:', out);
}
await browser.close();
