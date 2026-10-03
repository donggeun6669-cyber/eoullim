// 발표자료·홍보 영상에 넣을 실제 앱 화면을 찍는다.
//
// 운영 데이터를 건드리지 않도록 「촬영용 DB」로 띄운 로컬 앱을 찍는다:
//   .env.promo.local 에 EOULLIM_DB=eoullim/db-promo.json  →  npm run dev -- --port 5175 --mode promo
// 촬영용 DB는 처음 열 때 예시 데이터(그룹 8 · 이벤트 8 · 글)로 시작한다. 다시 찍으려면 그 Blob 파일을 지우고 연다.
//
// 실행: node promo/tools/capture-screens.mjs [주소=http://localhost:5175]
//   Playwright는 이 맥의 npx 캐시를 쓴다(새로 설치하지 않음). 다른 위치면 PLAYWRIGHT_PATH.
//   멘토 화면은 .env.local 의 ADMIN_CODE 로 켠다(코드는 화면·로그에 남기지 않는다).
//
// 결과: promo/assets/screens/*.png (390×844, 3배 해상도). 긴 화면은 *_tall.png (390×1500)
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const PW = process.env.PLAYWRIGHT_PATH
  || '/Users/r_o_und_12/.npm/_npx/9833c18b2d85bc59/node_modules/playwright/index.mjs';
const { chromium } = await import(PW);

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets/screens');
const URL = process.argv[2] || 'http://localhost:5175';
const ADMIN_CODE = (readFileSync(join(ROOT, '../.env.local'), 'utf8').match(/^ADMIN_CODE=(.*)$/m) || [])[1]?.replace(/^"|"$/g, '');

// 촬영용 DB를 지우고 예시 데이터로 새로 시작한다 (db-promo.json 만 — 운영·개발 DB는 손대지 않음)
const env = readFileSync(join(ROOT, '../.env.local'), 'utf8');
process.env.BLOB_READ_WRITE_TOKEN = (env.match(/^BLOB_READ_WRITE_TOKEN=(.*)$/m) || [])[1]?.replace(/^"|"$/g, '');
const { del, list } = await import(join(ROOT, '../node_modules/@vercel/blob/dist/index.js'));
const PROMO = 'eoullim/db-promo.json';
const found = (await list({ prefix: PROMO })).blobs.filter((b) => b.pathname === PROMO);
for (const b of found) await del(b.url);
console.log('촬영용 DB 초기화', found.length ? '(지움)' : '(없었음)');

const browser = await chromium.launch({ channel: 'chrome' });

async function device() {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
    locale: 'ko-KR', timezoneId: 'Asia/Seoul',
  });
  // 앱 언어는 한국어로 시작(발표 청중이 한국어). 알림(토스트)은 찍지 않는다.
  await ctx.addInitScript(() => {
    if (!localStorage.getItem('eoullim-lang')) localStorage.setItem('eoullim-lang', '"ko"');
    document.addEventListener('DOMContentLoaded', () => {
      const s = document.createElement('style');
      s.textContent = '.toast{display:none!important} *{caret-color:transparent!important}';
      document.head.appendChild(s);
    });
  });
  const p = await ctx.newPage();
  p.setDefaultTimeout(20000);
  p.W = (ms) => p.waitForTimeout(ms);
  return p;
}
const go = async (p, h) => { await p.goto(`${URL}/#/${h}`); await p.waitForLoadState('networkidle'); await p.W(1600); };
const tall = async (p, h = 1500) => { await p.setViewportSize({ width: 390, height: h }); await p.W(700); };
const short = async (p) => { await p.setViewportSize({ width: 390, height: 844 }); await p.W(500); };
const scrollTo = async (p, sel) => { await p.locator(sel).first().evaluate((e) => e.scrollIntoView({ block: 'start' })); await p.W(500); };
const scrollEnd = async (p) => { await p.evaluate(() => { const s = document.querySelector('.screen'); s.scrollTop = s.scrollHeight; }); await p.W(600); };
const top = async (p) => { await p.evaluate(() => { document.querySelector('.screen').scrollTop = 0; }); await p.W(400); };
const shots = [];
const shot = async (p, name) => { await p.screenshot({ path: join(OUT, `${name}.png`) }); shots.push(name); console.log('찍음', name); };

// ── 기기 A: 필리핀에서 온 유학생 Joy ──
const A = await device();
await A.goto(URL, { waitUntil: 'networkidle' }); await A.W(1200);
await shot(A, 'a01_welcome');
await A.click('text=시작하기 — 무료'); await A.W(700);
await A.locator('.option-card', { hasText: '외국인 유학생' }).click(); await A.W(500);
await A.locator('.country-grid .option-card', { hasText: '필리핀' }).click(); await A.W(400);
await A.fill('input.input', 'Joy'); await A.W(300);
await top(A); await shot(A, 'a02_setup');
await scrollEnd(A); await shot(A, 'a02_setup_end');
await A.locator('button.btn', { hasText: '조 만나기' }).click(); await A.W(3000);
await shot(A, 'a03_group_before');
await tall(A); await shot(A, 'a03_group_tall'); await short(A);
await go(A, 'home'); await shot(A, 'a04_home');
await tall(A); await shot(A, 'a04_home_tall'); await short(A);
await go(A, 'events'); await shot(A, 'a05_events');
await tall(A, 1700); await shot(A, 'a05_events_tall'); await short(A);
await A.locator('.card', { hasText: 'Undas' }).first().click(); await A.W(1500);
const undasHash = await A.evaluate(() => location.hash.slice(2));
await shot(A, 'a06_event');
await A.locator('button.btn', { hasText: '결제하고 참가' }).click(); await A.W(800);
await scrollEnd(A); await shot(A, 'a07_pay');
await A.locator('button.btn', { hasText: '결제하기' }).click(); await A.W(2000);
await scrollEnd(A); await shot(A, 'a08_paid');
await go(A, 'community'); await shot(A, 'a09_community');
await tall(A, 1600); await shot(A, 'a09_community_tall'); await short(A);
await go(A, 'ask');
await A.fill('input.input', '건강보험 꼭 들어야 해요?'); await A.W(1200);
await shot(A, 'a10_ask');
await go(A, 'points'); await shot(A, 'a11_points');
await go(A, 'about'); await shot(A, 'a12_about');
await tall(A, 2200); await shot(A, 'a12_about_tall'); await short(A);

// v6 (2026-10-03): 조당 멘토 1명. 필리핀 2조는 예시 멘토 없이 기다리는 조 → 서연이 그 조의 멘토가 된다

// ── 기기 B: 필리핀에 관심 있는 한국 학생 서연 ──
const B = await device();
await B.goto(URL, { waitUntil: 'networkidle' }); await B.W(1200);
await B.click('text=시작하기 — 무료'); await B.W(700);
await B.locator('.option-card', { hasText: '한국 학생' }).click(); await B.W(500);
await shot(B, 'b00_verify'); // 인증 코드가 필요해요 (데모는 코드 없이 계속)
await B.locator('button', { hasText: '데모로 계속' }).click(); await B.W(1500);
await B.locator('.country-grid .option-card', { hasText: '필리핀' }).click(); await B.W(300);
await B.locator('.chip', { hasText: '교환학생 갈 예정' }).click(); await B.W(300);
await B.fill('input.input', '서연'); await B.locator('.emoji-grid button').nth(1).click(); await B.W(400);
await top(B); await shot(B, 'b01_setup_kr');
await B.locator('.chip', { hasText: '교환학생 갈 예정' }).scrollIntoViewIfNeeded(); await B.W(400); await shot(B, 'b01_setup_kr_tie');
await scrollEnd(B); await shot(B, 'b01_setup_kr_end');
await B.locator('button.btn', { hasText: '멘토로 그룹 맡기' }).click();
await B.waitForURL(/#\/group/); await B.W(2500);
await shot(B, 'b02_group_kr');
// 서연이 인사 → Joy가 타갈로그어로 답 → 서연 화면에서 한국어로 번역돼 보인다
await B.fill('.composer input, input[aria-label="메시지"]', '안녕하세요! 필리핀에 관심 많은 서연이에요 😊 다음 주에 학식 같이 먹어요!');
await B.locator('.send-btn').click(); await B.W(1500);
await go(A, 'group');
await A.fill('input[aria-label="메시지"]', 'Hi Seoyeon! Salamat! Gusto ko rin kumain ng kimchi stew 😋');
await A.locator('.send-btn').click(); await A.W(2500);
await scrollEnd(A); await A.W(800);
await shot(A, 'a13_group_chat');
await go(A, 'group'); await A.evaluate(() => { document.querySelector('.screen').scrollTop = 0; }); await A.W(600);
await shot(A, 'a03_group'); // 서연이 멘토로 들어온 뒤의 그룹방 (발표 4장·영상 3장면)
await go(B, 'group'); await B.W(4500); // 번역이 도착할 시간
await scrollEnd(B); await B.W(800);
await shot(B, 'b03_group_chat_kr');
await tall(B); await shot(B, 'b03_group_chat_kr_tall'); await short(B);
await go(B, 'home'); await shot(B, 'b04_home_kr');
await go(B, undasHash); await shot(B, 'b05_event_kr');

// ── 기기 C: 한국인 멘토 (초대 코드) ──
if (ADMIN_CODE) {
  const C = await device();
  await C.goto(URL, { waitUntil: 'networkidle' }); await C.W(1000);
  await C.click('text=시작하기 — 무료'); await C.W(700);
  await C.click('text=나중에 할게요'); await C.W(1200);
  await go(C, 'settings');
  await C.fill('input[placeholder="인증 코드"]', ADMIN_CODE);
  const btn = C.locator('input[placeholder="인증 코드"] >> xpath=following::button[1]');
  await btn.click(); await C.W(2000);
  await go(C, 'admin'); await shot(C, 'c01_mentor');
  await tall(C, 2000); await shot(C, 'c01_mentor_tall'); await short(C);
  await C.locator('.seg button', { hasText: '인증·모집' }).click(); await C.W(500);
  await C.fill('input[placeholder^="메모"]', '10-04 부스'); await C.locator('button', { hasText: '발급' }).click(); await C.W(1500);
  await shot(C, 'c02_codes'); // 운영팀: 멘토가 필요한 나라 · 1인 1코드 발급
} else console.log('ADMIN_CODE 없음 — 멘토 화면은 건너뜀');

await browser.close();
console.log(`화면 ${shots.length}장 → ${OUT}`);
