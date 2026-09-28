// Stroke icons. Paths for home/find/community/chat/bot/bell/points/chevron come from 다미's prototype.
const PATHS = {
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" />,
  find: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M3.5 19c.6-3 3-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M16.5 14.5c2.3 0 4 1.2 4.5 3.5" />
    </>
  ),
  community: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10h8M8 14h5" />
    </>
  ),
  chat: <path d="M5 6h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-7l-4 3v-3H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" />,
  bot: (
    <>
      <rect x="5" y="8" width="14" height="11" rx="3" />
      <path d="M12 8V5.5M9 13v1M15 13v1M3 13v2M21 13v2" />
      <circle cx="12" cy="4.5" r="1" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20a2 2 0 0 0 4 0" />
    </>
  ),
  points: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 16.5V8h3a2.3 2.3 0 0 1 0 4.6h-3" />
    </>
  ),
  chevron: <path d="M9 5l7 7-7 7" />,
  back: <path d="M15 5l-7 7 7 7" />,
  send: <path d="M4 12 20 4l-6 16-3-7z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  check: <path d="M5 12.5 10 17l9-10" />,
  heart: <path d="M12 19s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.5C19 14.6 12 19 12 19z" />,
  comment: <path d="M5 6h14v10H9l-4 3z" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" />
    </>
  ),
  external: <path d="M14 5h5v5M19 5l-8 8M17 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h4" />,
  pin: (
    <>
      <path d="M12 21s-6-5.3-6-10.5a6 6 0 0 1 12 0C18 15.7 12 21 12 21z" />
      <circle cx="12" cy="10.5" r="2.2" />
    </>
  ),
  translate: <path d="M4 6h9M8.5 4v2M6 6c.5 3 2.5 5.5 5 6.5M11 6c-.5 3-3 6-6 7.5M13 20l4-9 4 9M14.5 17h5" />,
  book: <path d="M5 5.5A1.5 1.5 0 0 1 6.5 4H19v14H6.5A1.5 1.5 0 0 0 5 19.5zM5 19.5A1.5 1.5 0 0 0 6.5 21H19" />,
  sparkle: <path d="M12 4l1.8 4.7L18.5 10.5l-4.7 1.8L12 17l-1.8-4.7L5.5 10.5l4.7-1.8zM18 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z" />,
  users: (
    <>
      <circle cx="9" cy="8.5" r="3" />
      <path d="M3.5 19c.6-3 3-4.5 5.5-4.5s4.9 1.5 5.5 4.5" />
      <path d="M15 6a3 3 0 0 1 0 5.5M17 14.7c2 .5 3.2 2 3.5 4.3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4.5-4.5" />
    </>
  ),
  camera: (
    <>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  gift: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 13h16M12 9v11M12 9c-1.5-3-5-3.5-5-1.2C7 9 12 9 12 9zm0 0c1.5-3 5-3.5 5-1.2C17 9 12 9 12 9z" />
    </>
  ),
  shield: <path d="M12 3.5 19 6v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />,
}

export default function Icon({ name, size = 22, stroke = 1.8, style, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
      className={className}
    >
      {PATHS[name]}
    </svg>
  )
}

export function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="15" cy="20" r="11" fill="#8C82FF" />
      <circle cx="26" cy="20" r="11" fill="#FF6B4A" fillOpacity="0.92" />
    </svg>
  )
}
