import { NavLink } from 'react-router-dom'
import clsx from 'clsx'

const NAV = [
  { to: '/dashboard',       label: 'Dashboard',       icon: '◆' },
  { to: '/services',        label: 'Services',         icon: '◈' },
  { to: '/recommendations', label: 'Recommendations',  icon: '◇' },
  { to: '/settings',        label: 'Settings',         icon: '◎' },
]

export default function NavBar() {
  return (
    <aside className="w-52 shrink-0 flex flex-col bg-white border-r border-slate-100 min-h-screen py-6 px-3">
      {/* Wordmark */}
      <div className="px-3 mb-8">
        <span className="text-xl font-semibold tracking-tight text-slate-800">
          ami
        </span>
        <span className="ml-1.5 text-xs text-slate-400 font-normal">beta</span>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors duration-100',
                isActive
                  ? 'bg-sage-500/10 text-sage-700 font-medium'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50',
              )
            }
          >
            <span className="text-xs opacity-70">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 text-xs text-slate-300 leading-relaxed">
        Local-first · No cloud
      </div>
    </aside>
  )
}
