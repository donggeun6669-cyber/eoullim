import { AppProvider, useApp } from './store.jsx'
import { Toast } from './components/ui.jsx'
import Home, { Welcome } from './screens/Home.jsx'
import Solve, { Ask, Question } from './screens/Solve.jsx'
import Community, { Post, Write } from './screens/Community.jsx'
import Points from './screens/Points.jsx'
import Profile from './screens/Profile.jsx'
import Settings from './screens/Settings.jsx'
import Admin from './screens/Admin.jsx'
import Guide from './screens/Guide.jsx'
import About from './screens/About.jsx'

const SCREENS = {
  welcome: Welcome,
  home: Home,
  solve: Solve,
  ask: Ask,
  q: Question,
  community: Community,
  write: Write,
  post: Post,
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

function Router() {
  const { route, started } = useApp()
  let name = route.name || (started ? 'home' : 'welcome')
  if (!started && !OPEN_BEFORE_START.has(name)) name = 'welcome'
  if (started && name === 'welcome') name = 'home'
  const Screen = SCREENS[name] || Home
  return (
    <div className="stage">
      <div className={'phone' + (DARK.has(name) ? ' dark' : '')}>
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
