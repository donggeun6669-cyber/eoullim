// ───────────────────────────────────────────────────────────────
// 어울림 홍보 영상 — 장면 7개. render(t) 는 시간 t 만 보고 모든 요소를 정한다.
//
//  0–6     문제 제시   떠 있는 질문들(비자·보험·친구…) → 한가운데로 모여 사라짐
//  6–14.4  시작        폰이 올라옴 · 시작 화면 → 학교·나라 고르기 → 우리 조 그룹방
//  14.4–22.5 우리 조   그룹방 위쪽 멤버들이 폰 밖으로 나와 「필리핀 2조」로 줄 섬 (음악이 열리는 순간) · 이번 주 미션
//  22.5–31 한국인 멘토 한국 학생 서연: 인증 코드 화면 → 필리핀 · 교환학생 갈 예정 → 같은 조 채팅 · Joy의 원문이 한국어로 번역됨
//  31–41   이벤트      이벤트 4개가 폰 밖으로 · Undas → 결제(데모) → 참가 신청 완료
//  41–45   커뮤니티    질문을 쓰면 성대 공식 안내부터
//  45–50   마무리      어울림 로고 · QR (45.6~49.4 정지) → 남색으로 사라져 처음과 이어짐
//
// 폰 안은 전부 실제 앱 캡처(assets/screens). 폰 밖의 카드·멤버는 그 화면의 글자를 그대로 옮긴 광고용 연출이다.
// 폰은 확대·축소하지 않는다(이동만) → 화면이 흐려지지 않는다.
// ───────────────────────────────────────────────────────────────
(function () {
  const C = window.AD_CONFIG;
  const { E, prog, K, el, show, tf } = window.ADK;
  const SC = Object.fromEntries(C.scenes.map((s) => [s.id, s]));
  const SHOT = (n) => `assets/screens/${n}.png`;

  // 폰 안 화면 순서 — t 에 이 화면이 위로 덮인다 (dark: 위쪽 상태 표시줄을 남색으로)
  const SCREENS = [
    { img: 'a01_welcome', t: 6.0, dark: true },
    { img: 'a02_setup', t: 9.0 },
    { img: 'a03_group', t: 12.0, dark: true },
    { img: 'b00_verify', t: 22.7 },
    { img: 'b01_setup_kr_tie', t: 24.3 },
    { img: 'b03_group_chat_kr', t: 25.8, dark: true },
    { img: 'a05_events', t: 31.0, dark: true },
    { img: 'a06_event', t: 35.4, dark: true },
    { img: 'a07_pay', t: 36.9, dark: true },
    { img: 'a08_paid', t: 38.3, dark: true },
    { img: 'a10_ask', t: 41.0, dark: true },
  ];
  const FADE = 0.3;
  // 누르는 표시 (앱 화면 좌표, CSS px)
  const TAPS = [
    { t: 8.6, x: 195, y: 700 },   // 시작하기 — 무료
    { t: 10.3, x: 69, y: 540 },   // 필리핀
    { t: 35.0, x: 195, y: 222 },  // Undas 이벤트
    { t: 36.6, x: 195, y: 759 },  // ₩12,000 결제하고 참가
    { t: 38.0, x: 195, y: 690 },  // ₩12,000 결제하기
  ];
  const PX = 1230 - 211; // 폰 왼쪽 (가운데 x = 1230)
  const PY = 80;
  const APP_X = 16, APP_Y = 16 + 44;
  const RIGHT = 1480; // 폰 오른쪽에 꺼내 놓는 카드의 왼쪽 끝

  const els = {};
  const copies = [];

  function build(stage) {
    const bgL = el('div', 'layer bg-light', stage);
    bgL.style.zIndex = 0;
    const tint = el('div', 'blob', stage);
    Object.assign(tint.style, { left: '930px', top: '120px', width: '760px', height: '760px', background: 'radial-gradient(circle, #E6E3FF 0%, rgba(230,227,255,0) 70%)' });
    els.tint = tint;
    els.night = el('div', 'layer bg-night', stage);
    const b1 = el('div', 'blob', els.night); Object.assign(b1.style, { left: '1480px', top: '-260px', width: '640px', height: '640px', background: '#22314D' });
    const b2 = el('div', 'blob', els.night); Object.assign(b2.style, { left: '1640px', top: '760px', width: '460px', height: '460px', background: '#5B4DFF' });
    const b3 = el('div', 'blob', els.night); Object.assign(b3.style, { left: '-180px', top: '820px', width: '420px', height: '420px', background: 'rgba(255,107,74,0.18)' });

    // 1. 떠 있는 질문들
    const SPOTS = [[230, 170], [1360, 140], [120, 770], [1430, 830], [700, 96], [1560, 470], [150, 470], [930, 900]];
    els.worries = C.worries.map((w, i) => {
      const e = el('div', 'worry', stage, w);
      e._p = SPOTS[i % SPOTS.length];
      return e;
    });

    // 문구 (장면마다 하나)
    for (const s of C.scenes) {
      if (s.id === 'brand') continue;
      const dark = s.id === 'problem';
      const box = el('div', 'copy' + (dark ? ' center dark' : ''), stage);
      let kick = null;
      if (s.kicker) kick = el('div', 'kicker', box, s.kicker);
      const lines = s.copy.map((c, i) => el('div', 'line' + (i === s.copy.length - 1 ? ' em' : ''), box, c));
      copies.push({ s, box, kick, lines, dark });
    }

    // 미션 카드
    els.mission = el('div', 'card mission', stage);
    el('div', 'cap', els.mission, '이번 주 그룹 미션');
    const mt = el('div', 'txt', els.mission, C.mission + ' ');
    el('span', 'emoji', mt, '😲');

    // 폰
    const ph = el('div', 'phone', stage);
    el('div', 'ph-body', ph);
    const scr = el('div', 'ph-screen', ph);
    const st = el('div', 'ph-status', scr);
    els.statusDark = el('div', 'ph-status-dark', st);
    els.statusInk = el('div', 'abs', st);
    Object.assign(els.statusInk.style, { width: '390px', height: '44px' });
    el('div', 'ph-time', els.statusInk, '9:41');
    const ic = el('div', 'ph-icons', els.statusInk);
    [5, 7, 9, 11].forEach((h) => { const b = el('i', null, ic); b.style.height = h + 'px'; });
    el('b', null, el('div', 'ph-batt', ic));
    el('div', 'ph-island', st);
    const app = el('div', 'ph-app', scr);
    els.screens = SCREENS.map((s, i) => {
      const im = el('img', 'scr', app);
      im.src = SHOT(s.img);
      im.alt = '';
      im.style.zIndex = i + 1;
      return im;
    });
    els.taps = TAPS.map(() => { const d = el('div', 'tap', app); d.style.zIndex = 50; return d; });
    els.phone = ph;
    els.real = el('div', 'real-label', stage, C.labels.realScreen);
    els.payDemo = el('div', 'real-label', stage, C.labels.payDemo);

    // 3. 우리 조 멤버 (그룹방 위쪽 동그라미 자리에서 나온다)
    els.groupTag = el('div', 'group-tag', stage);
    el('span', 'emoji', els.groupTag, '🇵🇭 ');
    els.groupTag.appendChild(document.createTextNode('필리핀 2조 · 3/4명 + 멘토'));
    const FROM_X = [50, 110, 170, 290];
    els.members = C.members.slice(0, 4).map((m, i) => {
      const e = el('div', 'member' + (m.mentor ? ' mentor' : ''), stage);
      el('div', 'av', e, m.avatar);
      const tx = el('div', null, e);
      el('b', null, tx, m.nick);
      el('small', null, tx, m.role);
      e._from = [PX + APP_X + FROM_X[i], PY + APP_Y + 160];
      e._to = [RIGHT, 250 + i * 150];
      return e;
    });

    // 4. 한국 친구 · 번역
    const f = C.members[4];
    els.friend = el('div', 'member friend', stage);
    el('div', 'av', els.friend, f.avatar);
    const ftx = el('div', null, els.friend);
    el('b', null, ftx, f.nick);
    el('small', null, ftx, '🇰🇷 인증 멘토 · 🇵🇭 교환학생 갈 예정');
    els.orig = el('div', 'card', stage);
    const oc = el('div', 'cap', els.orig);
    el('span', 'pill night', oc, C.chat.from);
    oc.appendChild(document.createTextNode(C.labels.original + ' · Filipino / English'));
    el('div', 'txt', els.orig, C.chat.original);
    els.arrow = el('div', 'arrow', stage, '↓  ' + C.labels.autoTr);
    els.trans = el('div', 'card tr', stage);
    const tc = el('div', 'cap', els.trans);
    el('span', 'pill', tc, '서연의 화면');
    tc.appendChild(document.createTextNode('한국어'));
    el('div', 'txt', els.trans, C.chat.translated);

    // 5. 이벤트
    els.events = C.events.map((ev, i) => {
      const e = el('div', 'card ev', stage);
      el('div', 'ic', e, ev.icon);
      const tx = el('div', null, e);
      el('span', 'pill', tx, ev.tag);
      el('b', null, tx, ev.title);
      el('span', 'fee', tx, ev.fee);
      e._to = [RIGHT, 150 + i * 178];
      return e;
    });
    els.paid = el('div', 'card paid', stage, '✓ 참가 신청 완료!');

    // 6. 커뮤니티 — 공식 안내
    els.official = el('div', 'card', stage);
    const oc2 = el('div', 'cap', els.official);
    el('span', 'pill', oc2, '📘 성대 공식 안내');
    oc2.appendChild(document.createTextNode('무료'));
    el('div', 'txt', els.official, '건강보험은 어떻게 되나요?');
    const n = el('div', 'cap', els.official, C.labels.official);
    n.style.marginTop = '14px'; n.style.marginBottom = '0';

    // 7. 마무리
    els.brand = el('div', 'brand', stage);
    els.brand.style.left = '200px';
    els.brand.style.top = '250px';
    const logo = el('div', 'logo', els.brand);
    const mark = el('div', 'mark', logo); el('i', null, mark); el('i', null, mark);
    const nm = el('div', null, logo);
    el('span', 'name', nm, '어울림');
    el('span', 'en', nm, 'Eoullim');
    els.logo = logo;
    const bc = el('div', 'dark', els.brand);
    bc.style.marginTop = '44px';
    els.brandLines = SC.brand.copy.map((c, i) => { const l = el('div', 'line' + (i ? ' em' : ''), bc, c); l.style.fontSize = '64px'; return l; });
    els.facts = el('div', 'facts', els.brand);
    C.labels.facts.forEach((x) => el('span', null, els.facts, x));
    els.team = el('div', 'team', els.brand, C.labels.team);
    els.qr = el('div', 'qr-card', stage);
    const qi = el('img', null, els.qr); qi.src = 'assets/qr-eoullim.svg'; qi.alt = 'QR';
    el('b', null, els.qr, C.labels.cta);
    el('small', null, els.qr, C.labels.qrHint);
    el('span', 'url', els.qr, C.demoUrlLabel);

    // 쌓는 순서
    const z = (e, v) => { e.style.zIndex = v; };
    z(bgL, 0); z(tint, 1); z(els.night, 2);
    els.worries.forEach((e) => z(e, 5));
    copies.forEach((c) => z(c.box, 6));
    z(els.mission, 6);
    z(ph, 10); z(els.real, 10); z(els.payDemo, 10);
    [els.groupTag, ...els.members, els.friend, els.orig, els.arrow, els.trans, ...els.events, els.paid, els.official].forEach((e) => z(e, 12));
    z(els.brand, 20); z(els.qr, 20);
  }

  // 들어오고(a..a+dIn) 나가는(b-dOut..b) 투명도
  const inOut = (t, a, b, dIn = 0.5, dOut = 0.45) => Math.min(prog(t, a, a + dIn, E.out), 1 - prog(t, b - dOut, b, E.in));

  function render(t) {
    const night = K(t, [[0, 1], [5.6, 1], [6.5, 0], [44.6, 0], [45.4, 1], [50, 1]]);
    show(els.night, night);
    show(els.tint, 1 - night);

    // 1. 질문들
    els.worries.forEach((e, i) => {
      const [x0, y0] = e._p;
      const a = 0.15 + i * 0.16;
      const drift = [Math.sin(t * 0.6 + i) * 14, -t * 7 + Math.cos(t * 0.5 + i * 2) * 8];
      const g = prog(t, 4.3 + i * 0.05, 5.5 + i * 0.05, E.inOutQuint);
      const x = x0 + drift[0] + (960 - 120 - x0) * g;
      const y = y0 + drift[1] + (520 - y0) * g;
      const o = Math.min(prog(t, a, a + 0.7, E.out), 1 - prog(t, 5.0, 5.8, E.in));
      if (show(e, o)) tf(e, `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(1 - 0.6 * g).toFixed(3)})`);
    });

    // 문구
    for (const c of copies) {
      const { s } = c;
      const a = s.id === 'intro' ? 7.0 : s.start + 0.45;
      const b = s.id === 'problem' ? 5.9 : s.end - 0.05;
      const shown = show(c.box, t >= a - 0.1 && t <= b ? 1 : 0);
      if (!shown) continue;
      const parts = [c.kick, ...c.lines].filter(Boolean);
      const top = c.dark ? 400 : 330;
      tf(c.box, `translate(0px, ${top}px)`);
      parts.forEach((p, i) => {
        const ai = a + i * 0.22;
        const o = inOut(t, ai, b, 0.55, 0.4);
        show(p, o);
        tf(p, `translate(0px, ${((1 - prog(t, ai, ai + 0.7, E.outQuint)) * 34 + prog(t, b - 0.4, b, E.in) * -14).toFixed(1)}px)`);
      });
    }

    // 미션
    const mo = inOut(t, 18.3, 22.2, 0.6, 0.4);
    if (show(els.mission, mo)) tf(els.mission, `translate(150px, ${(700 + (1 - prog(t, 18.3, 19.0, E.outQuint)) * 30).toFixed(1)}px)`);

    // 폰 — 올라오기 · 내려가기 (이동만)
    const py = K(t, [[0, 1180], [6.0, 1180], [7.4, PY, E.outQuint], [44.5, PY], [45.4, 1180, E.in]]);
    if (show(els.phone, t > 5.9 && t < 45.5 ? 1 : 0)) tf(els.phone, `translate(${PX}px, ${py.toFixed(1)}px)`);
    // 화면 겹치기
    let dark = 0;
    SCREENS.forEach((s, i) => {
      const next = SCREENS[i + 1];
      let o = i === 0 ? 1 : prog(t, s.t, s.t + FADE, E.inOut);
      if (t < s.t && i > 0) o = 0;
      if (next && t >= next.t + FADE) o = 0;
      show(els.screens[i], o);
      if (o > 0 && s.dark) dark = Math.max(dark, o);
      if (o > 0 && !s.dark) dark = Math.min(dark, 1 - o);
    });
    show(els.statusDark, dark);
    els.statusInk.style.color = dark > 0.5 ? '#fff' : '#0F1B2E';
    TAPS.forEach((p, i) => {
      const u = (t - p.t + 0.05) / 0.5;
      const e = els.taps[i];
      if (show(e, u > 0 && u < 1 ? (u < 0.25 ? u / 0.25 : 1 - (u - 0.25) / 0.75) * 0.95 : 0)) {
        tf(e, `translate(${p.x}px, ${p.y}px) scale(${(0.55 + u * 0.8).toFixed(3)})`);
      }
    });
    const labelY = py + 920 + 18;
    const payO = inOut(t, 36.7, 40.7, 0.4, 0.4);
    if (show(els.real, Math.min(inOut(t, 7.4, 44.5, 0.6, 0.4), 1 - payO))) tf(els.real, `translate(${PX}px, ${labelY}px)`);
    if (show(els.payDemo, payO)) tf(els.payDemo, `translate(${PX - 40}px, ${labelY}px)`);
    els.payDemo.style.width = '502px';

    // 3. 우리 조 멤버 — 14.4초 음악이 열릴 때 폰 밖으로
    const go = inOut(t, 15.4, 22.4, 0.5, 0.45);
    if (show(els.groupTag, go)) tf(els.groupTag, `translate(${RIGHT}px, ${(150 + (1 - prog(t, 15.4, 16.1, E.outQuint)) * 20).toFixed(1)}px)`);
    els.members.forEach((e, i) => {
      const a = 14.4 + i * 0.14;
      const u = prog(t, a, a + 1.0, E.outQuint);
      const o = Math.min(prog(t, a, a + 0.25), 1 - prog(t, 22.0, 22.45, E.in));
      if (!show(e, o)) return;
      const x = e._from[0] + (e._to[0] - e._from[0]) * u;
      const y = e._from[1] + (e._to[1] - e._from[1]) * u;
      tf(e, `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(0.35 + 0.65 * u).toFixed(3)})`);
      e.style.transformOrigin = '0 50%';
    });

    // 4. 한국 친구 · 번역
    const fo = inOut(t, 23.1, 30.9, 0.5, 0.45);
    if (show(els.friend, fo)) tf(els.friend, `translate(${RIGHT}px, ${(200 + (1 - prog(t, 23.1, 23.8, E.outQuint)) * 26).toFixed(1)}px)`);
    const oo = inOut(t, 26.4, 30.9, 0.5, 0.45);
    if (show(els.orig, oo)) tf(els.orig, `translate(${RIGHT}px, ${(360 + (1 - prog(t, 26.4, 27.1, E.outQuint)) * 26).toFixed(1)}px)`);
    const ao = inOut(t, 27.25, 30.9, 0.3, 0.45);
    if (show(els.arrow, ao)) tf(els.arrow, `translate(${RIGHT + 28}px, 590px)`);
    const tro = inOut(t, 27.5, 30.9, 0.4, 0.45);
    if (show(els.trans, tro)) {
      const u = prog(t, 27.5, 28.3, E.outQuint);
      tf(els.trans, `translate(${RIGHT}px, ${(650 + (1 - u) * -60).toFixed(1)}px) scale(${(0.92 + 0.08 * u).toFixed(3)})`);
    }

    // 5. 이벤트 카드 — 폰 가운데에서 오른쪽으로
    els.events.forEach((e, i) => {
      const a = 32.0 + i * 0.3;
      const u = prog(t, a, a + 0.9, E.outQuint);
      const o = Math.min(prog(t, a, a + 0.3), 1 - prog(t, 34.6, 35.1, E.in));
      if (!show(e, o)) return;
      const fx = 1230 - 200, fy = 300 + i * 120;
      tf(e, `translate(${(fx + (e._to[0] - fx) * u).toFixed(1)}px, ${(fy + (e._to[1] - fy) * u).toFixed(1)}px) scale(${(0.7 + 0.3 * u).toFixed(3)})`);
    });
    const pd = inOut(t, 38.55, 40.8, 0.35, 0.4);
    if (show(els.paid, pd)) tf(els.paid, `translate(${RIGHT}px, 470px) scale(${(0.85 + 0.15 * prog(t, 38.55, 39.1, E.outQuint)).toFixed(3)})`);

    // 6. 공식 안내
    const of = inOut(t, 41.7, 44.6, 0.5, 0.4);
    if (show(els.official, of)) tf(els.official, `translate(${RIGHT}px, ${(400 + (1 - prog(t, 41.7, 42.4, E.outQuint)) * 26).toFixed(1)}px)`);

    // 7. 마무리
    const end = 1 - prog(t, 49.4, 49.95, E.in);
    const lo = Math.min(prog(t, 45.3, 45.9, E.out), end);
    show(els.brand, lo > 0 ? 1 : 0);
    if (show(els.logo, lo)) tf(els.logo, `translate(0px, ${((1 - prog(t, 45.3, 46.0, E.outQuint)) * 30).toFixed(1)}px)`);
    els.brandLines.forEach((l, i) => {
      const a = 45.6 + i * 0.22;
      show(l, Math.min(prog(t, a, a + 0.5, E.out), end));
      tf(l, `translate(0px, ${((1 - prog(t, a, a + 0.7, E.outQuint)) * 30).toFixed(1)}px)`);
    });
    show(els.facts, Math.min(prog(t, 46.2, 46.7, E.out), end));
    show(els.team, Math.min(prog(t, 46.4, 46.9, E.out), end));
    const qo = Math.min(prog(t, 45.8, 46.4, E.out), end);
    if (show(els.qr, qo)) tf(els.qr, `translate(1300px, ${(250 + (1 - prog(t, 45.8, 46.6, E.outQuint)) * 40).toFixed(1)}px)`);
  }

  const assets = [...SCREENS.map((s) => SHOT(s.img)), 'assets/qr-eoullim.svg'];
  window.AdPlayer({ duration: 50, scenes: C.scenes, build, render, assets });
})();
