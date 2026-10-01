import { AppProvider, useApp } from './store.jsx'
import { Belong, Toast } from './components/ui.jsx'
import Home, { Welcome } from './screens/Home.jsx'
import Setup from './screens/Setup.jsx'
import Group from './screens/Group.jsx'
import { Ask, Question } from './screens/Solve.jsx'
import Community, { NewPost, Post, Write } from './screens/Community.jsx'
import Events, { EventDetail, EventNew } from './screens/Events.jsx'
import Points from './screens/Points.jsx'
import Profile from './screens/Profile.jsx'
import Settings from './screens/Settings.jsx'
import Admin from './screens/Admin.jsx'
import Guide from './screens/Guide.jsx'
import About from './screens/About.jsx'

const SCREENS = {
  welcome: Welcome,
  setup: Setup,
  home: Home,
  group: Group,
  community: Community,
  solve: Community, // v2 address: Ask and Community are one board now
  ask: Ask,
  q: Question,
  new: NewPost,
  write: Write,
  post: Post,
  events: Events,
  event: EventDetail,
  eventNew: EventNew,
  points: Points,
  profile: Profile,
  settings: Settings,
  admin: Admin,
  guide: Guide,
  about: About,
}
// Screens you can open before pressing "Start" (the official guide needs no points).
const OPEN_BEFORE_START = new Set(['welcome', 'settings', 'about', 'guide'])
const DARK = new Set(['welcome', 'about'])
const NO_BELONG = new Set(['welcome', 'about', 'setup'])

function Router() {
  const { route, started } = useApp()
  let name = route.name || (started ? 'home' : 'welcome')
  if (!started && !OPEN_BEFORE_START.has(name)) name = 'welcome'
  if (started && name === 'welcome') name = 'home'
  const Screen = SCREENS[name] || Home
  return (
    <div className="stage">
      <div className={'phone' + (DARK.has(name) ? ' dark' : '')}>
        {started && !NO_BELONG.has(name) && <Belong />}
        <Screen id={route.id} key={name + (route.id || '')} />
        <Toast />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
