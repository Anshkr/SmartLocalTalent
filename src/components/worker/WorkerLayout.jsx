import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../shared/NotificationBell'


const NAV = [
  { to: '/worker/dashboard',  icon: '▦',  label: 'Dashboard' },
  { to: '/worker/requests',   icon: '📋', label: 'Requests'  },
  { to: '/worker/active',     icon: '⚡', label: 'Active Job' },
  { to: '/worker/history',    icon: '📁', label: 'History'   },
  { to: '/worker/profile',    icon: '👤', label: 'Profile'   },
  { to: '/worker/earnings', icon: '💰', label: 'Earnings' },

]

export default function WorkerLayout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }


  return (
    <div className="wl-root">
      {/* Sidebar */}
      <aside className={`wl-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="wl-brand">
          <div className="wl-brand-icon">S</div>
          <span className="wl-brand-name">SmartTalent</span>

        </div>


        <div className="wl-worker-pill">
          <div className="wl-avatar">{user?.name?.[0] ?? 'W'}</div>
          <div>
            <div className="wl-worker-name">{user?.name ?? 'Worker'}</div>
            <div className="wl-worker-role">Worker account</div>
          </div>
        </div>

        <nav className="wl-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `wl-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="wl-link-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="wl-logout" onClick={handleLogout}>
          <span>⎋</span> Sign out
        </button>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="wl-overlay" onClick={() => setMobileOpen(false)} />}




      {/* Main content */}
      <div className="wl-main">
          <NotificationBell />
        <header className="wl-topbar">
          <button className="wl-menu-btn" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="wl-topbar-right">
            <div className="wl-notif-dot">🔔</div>
            <div className="wl-avatar sm">{user?.name?.[0] ?? 'W'}</div>
          </div>
        </header>
        <div className="wl-content">
          {children}
        </div>
      </div>
    </div>
  )
}