import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../shared/NotificationBell'

const NAV = [
  { to: '/customer/home',     icon: '🏠', label: 'Home'        },
  { to: '/customer/search',   icon: '🔍', label: 'Find Workers' },
  { to: '/customer/requests', icon: '📋', label: 'Requests'    },
  { to: '/customer/active',   icon: '⚡', label: 'Active Job'  },
  { to: '/customer/orders',   icon: '🧾', label: 'Orders'      },
  { to: '/customer/profile',  icon: '👤', label: 'Profile'     },
]

export default function CustomerLayout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="cl-root">
      <aside className={`cl-sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="cl-brand">
          <div className="cl-brand-icon">S</div>
          <span>SmartTalent</span>
        </div>

        <div className="cl-user-pill">
          <div className="cl-avatar">{user?.name?.[0] ?? 'C'}</div>
          <div>
            <div className="cl-user-name">{user?.name ?? 'Customer'}</div>
            <div className="cl-user-role">Customer account</div>
          </div>
        </div>

        <nav className="cl-nav">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `cl-link ${isActive ? 'active' : ''}`}
              onClick={() => setSideOpen(false)}>
              <span className="cl-link-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="cl-logout" onClick={() => { logout(); navigate('/login') }}>
          ⎋ Sign out
        </button>
      </aside>

      {sideOpen && <div className="cl-overlay" onClick={() => setSideOpen(false)} />}

      <div className="cl-main">
        <header className="cl-topbar">
          <button className="cl-menu-btn" onClick={() => setSideOpen(true)}>☰</button>
          <div className="cl-topbar-brand">
            <div className="cl-brand-icon sm">S</div>
            <span>SmartTalent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <NotificationBell />
            <div className="cl-avatar sm">{user?.name?.[0] ?? 'C'}</div>
          </div>
        </header>

        <div className="cl-content">{children}</div>

        <nav className="cl-bottom-nav">
          {NAV.slice(0, 5).map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `cl-bottom-link ${isActive ? 'active' : ''}`}>
              <span className="cl-bottom-icon">{icon}</span>
              <span className="cl-bottom-label">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}