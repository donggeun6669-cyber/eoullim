import { useApp } from '../store.jsx'
import Icon, { Logo } from '../components/Icon.jsx'
import { LangToggle } from '../components/ui.jsx'

// Project page for judges and mentors. Text follows our team application (2gether, 2026-09-25).
function Block({ n, title, children }) {
  return (
    <div style={{ background: 'var(--night-2)', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#8C82FF' }}>{n}</span>
      <span className="display" style={{ fontSize: 18 }}>{title}</span>
      <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--night-text)' }}>{children}</div>
    </div>
  )
}

export default function About() {
  const { tx, go, back } = useApp()
  return (
    <div className="screen" style={{ padding: '20px 20px 28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 }}>
        <button className="icon-btn" style={{ background: 'var(--night-2)', color: '#fff' }} aria-label={tx('Back', '뒤로')} onClick={() => back('welcome')}>
          <Icon name="back" />
        </button>
        <LangToggle dark />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Logo size={44} />
        <div>
          <div className="display" style={{ fontSize: 26 }}>Eoullim <span style={{ fontSize: 16, color: 'var(--night-muted)' }}>어울림</span></div>
          <div style={{ fontSize: 13, color: 'var(--night-muted)' }}>{tx('Campus life helper for international & exchange students', '국내 외국인 유학생·교환학생 캠퍼스 생활 도우미')}</div>
        </div>
      </div>

      <Block n="01 · WHY" title={tx('Recruiting is not settling', '유치만큼 중요한 건 정착')}>
        {tx(
          'As the school-age population shrinks, universities fill seats by recruiting international and exchange students. But settling in gets little support. Exchange students do not know where to ask even small things, like how to use the library coffee machine.',
          '학령인구가 줄면서 대학은 외국인 유학생·교환학생 유치로 빈자리를 채우고 있습니다. 그러나 유치만큼 중요한 정착은 뒷받침이 약합니다. 교환학생은 도서관 커피머신 사용법 같은 작은 생활 문제조차 어디에 물어야 할지 모릅니다.',
        )}
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <li>{tx('Few Korean class options lower motivation (Jeong, 2021)', '선택할 수 있는 한국어 수업이 부족해 학습 의욕을 잃음 (정진현, 2021)')}</li>
          <li>{tx('Not enough information and promotion for exchange students (Shin, 2011)', '교환학생 관련 정보·홍보 부족 (신태진, 2011)')}</li>
          <li>{tx('Hands-on cultural exchange raises adjustment and satisfaction (Hyun et al., 2026)', '한국 문화를 직접 체험·교류하는 활동은 적응과 만족도를 높임 (현은령 외, 2026)')}</li>
        </ul>
      </Block>

      <Block n="02 · WHAT" title={tx('Three layers in one link', '링크 하나에 세 가지')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span>📚 <b style={{ color: '#fff' }}>{tx('Connect', '연결')}</b>: {tx('introduce the support programs SKKU already runs (OISS, OIR, HI-Club, SG MAPLE, S-LINK, Korean classes, counseling).', '성균관대에 이미 있는 지원 프로그램(외국인유학생지원팀, 국제처, 하이클럽, SG MAPLE, S-LINK, 한국어, 상담)을 소개·연결.')}</span>
          <span>🤝 <b style={{ color: '#fff' }}>{tx('Community (main)', '커뮤니티 (메인)')}</b>: {tx('senior-junior mentoring, exchange-student community, and Korean friend matching.', '유학생 선후배 멘토링, 교환학생 커뮤니티, 한국 친구 소개.')}</span>
          <span>🤖 <b style={{ color: '#fff' }}>{tx('AI Help Bot', 'AI 헬프봇')}</b>: {tx('answers from official SKKU guides with the source link, and hands over to a mentor when the guide has no answer.', '성균관대 공식 안내를 근거로 출처 링크와 함께 답하고, 안내에 없으면 멘토에게 넘김.')}</span>
        </div>
      </Block>

      <Block n="03 · HOW" title={tx('Web page, open by link or QR', '링크·QR로 여는 웹페이지')}>
        {tx(
          'No install. Each university has its own private community, so students only meet people from their own campus. Mentors earn points for confirmed help.',
          '설치가 필요 없습니다. 학교마다 따로 커뮤니티가 있어 같은 캠퍼스 학생끼리만 만납니다. 도움이 확인되면 멘토가 포인트를 받습니다.',
        )}
      </Block>

      <div style={{ fontSize: 13, color: 'var(--night-muted)', lineHeight: 1.6, textAlign: 'center' }}>
        {tx('Team 2gether: 정동근 (lead), 김다미 Wint Yi Kyaw', '2gether 팀: 정동근(팀장), 김다미(Wint Yi Kyaw)')}
        <br />
        HUSS AI BRIDGE · {tx('AI Convergence Community, SKKU', '성균관대 AI 융합 커뮤니티')}
        <br />
        <span className="demo-pill" style={{ marginTop: 8 }}>{tx('Prototype: people and chats are sample data', '프로토타입: 사람·채팅은 예시 데이터')}</span>
      </div>

      <button className="btn" onClick={() => go('uni')}>{tx('Try the demo', '데모 써 보기')}</button>
    </div>
  )
}
