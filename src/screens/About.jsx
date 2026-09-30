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
        {tx('Where buddy programs don’t reach, the whole campus answers.', '버디 프로그램이 닿지 않는 곳에서, 캠퍼스 전체가 답합니다.')}
      </p>

      {block(tx('Who it is for', '누구를 위해'), (
        <ul>
          <li>{tx('Degree-seeking international students in the buddy blind spot — SKKU’s Global Buddy is for freshmen only, so 2nd-years and up, transfer and graduate students have no program.', '버디 프로그램의 사각지대에 있는 학위과정 유학생 — 성대 「글로벌 버디」는 신입생만 대상이라 2학년 이상·편입생·대학원생은 들어갈 프로그램이 없어요.')}</li>
          <li>{tx('Students who find a 1:1 buddy too much — they just want to ask when they need to. (Buddy programs like SG MAPLE work well for exchange students; Eoullim fills the gap around them.)', '1:1 버디가 부담스러운 학생 — 필요할 때만 가볍게 묻고 싶은 사람. (SG MAPLE 같은 버디 프로그램은 교환학생에게 잘 작동해요. 어울림은 그 바깥을 채워요.)')}</li>
        </ul>
      ))}

      {block(tx('How it works', '어떻게'), (
        <ol>
          <li>{tx('Ask with points (100 won = 1 P). The official SKKU guide is shown first — if it answers you, it’s free.', '포인트를 걸고 물어요 (100원 = 1P). 먼저 성대 공식 안내를 보여 줘요 — 거기서 해결되면 무료.')}</li>
          <li>{tx('Anyone can answer. Korean managers answer Korea-style questions.', '누구나 답할 수 있어요. 한국식 질문은 한국인 관리자가 답해요.')}</li>
          <li>{tx('The adopted answer gets the points. No answer in 72h → full refund. No adoption in 7 days → a manager decides.', '채택된 답이 포인트를 받아요. 72시간 무답변 → 전액 환불. 7일 미채택 → 관리자가 결정.')}</li>
          <li>{tx('Community boards: find people to eat, study and travel with; language lounges.', '커뮤니티: 밥·스터디·여행 같이 할 사람 찾기, 언어별 라운지.')}</li>
        </ol>
      ))}

      {block(tx('Privacy by design', '처음부터 개인정보 없이'), (
        <ul>
          <li>{tx('No sign-up, no login, no verification.', '가입·로그인·인증 없음.')}</li>
          <li>{tx('No name, student ID, nationality, phone, email or location. Language lounges instead of nationality boards.', '이름·학번·국적·전화·이메일·위치를 받지 않아요. 국적 대신 언어별 라운지.')}</li>
          <li>{tx('Phones, emails and messenger IDs in posts are hidden automatically.', '글 속 전화번호·이메일·메신저 ID는 자동으로 가려요.')}</li>
          <li>{tx('A random code identifies the phone; the server keeps only a one-way hash of it.', '무작위 코드로 기기를 구분하고, 서버는 그 코드의 되돌릴 수 없는 해시만 보관해요.')}</li>
        </ul>
      ))}

      {block(tx('Business model', '수익 구조'), (
        <ul>
          <li>{tx('Students buy points. No ads.', '학생이 포인트를 사요. 광고 없음.')}</li>
          <li>{tx('30% of sales go to Korean managers by work done — a campus job for Korean students.', '매출의 30%를 한국인 관리자가 실적대로 나눠 받아요 — 한국 학생에게는 캠퍼스 일자리.')}</li>
          <li>{tx('Next: universities buy point bundles for students who have no buddy.', '다음 단계: 학교가 포인트를 묶음으로 사서 버디 없는 유학생에게 나눠 줘요.')}</li>
          <li>{tx('Points can’t be cashed out or sent between users.', '포인트는 현금화·이용자 간 송금이 안 돼요.')}</li>
        </ul>
      ))}

      {block(tx('Why it matters', '왜 필요한가'), (
        <p className="small light">
          {tx('As the school-age population shrinks, universities fill seats with international students. Recruiting them is not enough — they need to settle in. Eoullim turns small daily problems into answers, and answers into community.', '학령인구가 줄면서 대학은 유학생으로 빈자리를 채우고 있어요. 데려오는 것만큼 정착이 중요해요. 어울림은 작은 생활 문제를 답으로, 답을 커뮤니티로 바꿔요.')}
        </p>
      ))}

      <p className="small light">
        {tx('Team 2gether — Jeong Donggeun (English Language & Literature) · Wint Yi Kyaw (Korean Language & Literature). Example posts are marked “Example”. Charging is a demo: no real payment.', '2gether 팀 — 정동근(영어영문학과) · 김다미 Wint Yi Kyaw(국어국문학과). 예시 글에는 「예시」 표시가 있어요. 충전은 데모로, 실제 결제되지 않아요.')}
      </p>
    </div>
  )
}
