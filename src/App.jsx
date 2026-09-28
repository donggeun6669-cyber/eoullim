import { AppProvider, useApp } from './store.jsx'
import { Toast } from './components/ui.jsx'
import { Welcome, ChooseUni, Login, ProfileSetup, Interests } from './screens/Onboarding.jsx'
import Home from './screens/Home.jsx'
import { Find, PersonProfile } from './screens/Find.jsx'
import { RequestHelp, MyRequests } from './screens/Requests.jsx'
import { Chats, ChatRoom } from './screens/Chats.jsx'
import Guide from './screens/Guide.jsx'
import Community from './screens/Community.jsx'
import Points from './screens/Points.jsx'
import About from './screens/About.jsx'

const SCREENS = {
  welcome: Welcome,
  uni: ChooseUni,
  login: Login,
  profile: ProfileSetup,
  interests: Interests,
  home: Home,
  find: Find,
  person: PersonProfile,
  request: RequestHelp,
  requests: MyRequests,
  chats: Chats,
  chat: ChatRoom,
  guide: Guide,
  community: Community,
  points: Points,
  about: About,
}
const DARK = new Set(['welcome', 'about'])

function Router() {
  const { route, state } = useApp()
  const name = route.name || (state.onboarded ? 'home' : 'welcome')
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
