import { Logo } from '../components/Icon.jsx'
import { LangToggle, TopBar } from '../components/ui.jsx'
import { useApp } from '../store.jsx'

export default function About() {
  const { tx } = useApp()
  const block = (title, children) => (
    <section className="about-block">
      <h2 className="h3">{title}</h2>
      {children}
    </section>
  )
  return (
    <div className="screen dark-screen">
      <TopBar title="" right={<LangToggle dark />} />
      <div className="row" style={{ gap: 10 }}>
        <Logo size={40} />
        <span className="col">
          <span className="display" style={{ fontSize: 24 }}>Eoullim 어울림</span>
          <span className="small light">HUSS AI BRIDGE · AI 융합 커뮤니티 · 2gether</span>
        </span>
      </div>
      <p className="about-lead">
        {tx('A group that stays with you in Korea — and events that bring groups together.', '한국에서 끝까지 함께하는 그룹, 그리고 그룹을 잇는 이벤트.')}
      </p>

      {block(tx('Main value: rapport, for free', '핵심 가치: 라포 형성 (무료)'), (
        <ul>
          <li>{tx('Your group: 3–4 students from the same country + a verified Korean mentor, all semester. Free, always.', '우리 조: 같은 나라 학생 3~4명 + 인증된 한국인 멘토가 한 학기 내내 함께. 언제나 무료.')}</li>
          <li>{tx('Weekly group missions turn strangers into friends: lunch together, a song from home, a walk with the mentor.', '매주 그룹 미션으로 서먹함을 깨요: 학식 같이 먹기, 내 나라 노래 추천, 멘토와 동네 산책.')}</li>
          <li>{tx('Korean students who are interested in a country look after its groups as mentors — verified by the Eoullim team (student ID checked in person, one code per person; in this demo you can continue without a code). One mentor per group, a semester at a time. Paid from Eoullim’s revenue.', '특정 나라에 관심 있는 한국 학생은 그 나라 조를 맡는 멘토가 돼요 — 어울림 운영팀이 학생증을 직접 확인하고 한 사람에게 하나씩 인증 코드를 줘요 (지금은 데모라 코드 없이도 들어갈 수 있어요). 조마다 멘토 1명, 한 학기씩 맡아요. 어울림 수익에서 몫을 받아요.')}</li>
          <li>{tx('Every screen shows where you belong — your school, the board you’re on and your group.', '모든 화면에 내 소속이 보여요 — 학교, 지금 있는 게시판, 우리 조.')}</li>
          <li>{tx('Write in any language. Boards and group chat are translated live.', '어떤 언어로 써도 돼요. 게시판과 그룹 채팅은 실시간 번역.')}</li>
        </ul>
      ))}

      {block(tx('Events: how Eoullim earns', '이벤트: 어울림의 수익'), (
        <ul>
          <li>{tx('Only in Korea: saju café, Sindang-dong ghost-story walk, hanbok palace walk.', '한국에서만: 사주 카페, 신당동 귀신 골목 투어, 한복 고궁 산책.')}</li>
          <li>{tx('Holidays by country: Vietnamese Women’s Day, Undas, Hangeul Day… the country’s groups help host.', '나라별 명절: 베트남 여성의 날, 필리핀 Undas, 한글날… 그 나라 조가 같이 준비해요.')}</li>
          <li>{tx('Group vs group: sports day, quiz night.', '그룹 대항: 체육대회, 퀴즈 나이트.')}</li>
          <li>{tx('Participants pay a fee. Eoullim keeps 15%; the rest is the host’s budget for the event.', '참가비를 받고, 어울림이 15%를 수수료로 가져가요. 나머지는 진행 예산.')}</li>
        </ul>
      ))}

      {block(tx('Community + points (second)', '커뮤니티 + 포인트 (보조 수익)'), (
        <ul>
          <li>{tx('Quick help, everyday questions, meetups for today — one board.', '가벼운 도움, 일상 질문, 오늘의 모임 — 게시판 하나.')}</li>
          <li>{tx('Points are optional: put them on a question for faster answers (100 won = 1 P). No answer in 72h → refund.', '포인트는 선택: 질문에 걸면 답이 빨라져요 (100원 = 1P). 72시간 무답변 → 환불.')}</li>
          <li>{tx('30% of Eoullim’s revenue goes to Korean mentors by work done — a campus job for Korean students.', '어울림 수익의 30%는 한국인 멘토가 실적대로 나눠 받아요 — 한국 학생에게는 캠퍼스 일자리.')}</li>
        </ul>
      ))}

      {block(tx('Privacy by design', '개인정보는 최소한으로'), (
        <ul>
          <li>{tx('Korean mentors are verified in person by the Eoullim team (student ID check, one code per person).', '한국인 멘토는 어울림 운영팀이 학생증을 직접 확인해 인증해요 (1인 1코드).')}</li>
          <li>{tx('Your country is used only to make your group — never shown on posts.', '나라는 그룹을 만드는 데만 쓰고, 글에는 보이지 않아요.')}</li>
          <li>{tx('Phones, emails and messenger IDs in posts and chat are hidden automatically.', '글과 채팅 속 전화번호·이메일·메신저 ID는 자동으로 가려요.')}</li>
        </ul>
      ))}

      {block(tx('Why it matters', '왜 필요한가'), (
        <p className="small light">
          {tx('As the school-age population shrinks, universities fill seats with international students. Recruiting them is not enough — they need to settle in. Eoullim gives every student a group from day one.', '학령인구가 줄면서 대학은 유학생으로 빈자리를 채우고 있어요. 데려오는 것만큼 정착이 중요해요. 어울림은 첫날부터 모두에게 「우리 조」를 줘요.')}
        </p>
      ))}

      <p className="small light">
        {tx('Team 2gether — Jeong Donggeun (English Language & Literature) · Wint Yi Kyaw (Korean Language & Literature). Example posts are marked “Example”. Payments are a demo: no real money moves.', '2gether 팀 — 정동근(영어영문학과) · 김다미 Wint Yi Kyaw(국어국문학과). 예시 글에는 「예시」 표시가 있어요. 결제·충전은 데모로, 실제 돈이 오가지 않아요.')}
      </p>
    </div>
  )
}
