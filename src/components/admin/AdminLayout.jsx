import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

const NAV = [
  { to: '/admin',             icon: '▦',  label: 'Overview',   exact: true },
  { to: '/admin/analytics',   icon: '📊', label: 'Analytics'               },
  { to: '/admin/workers',     icon: '👷', label: 'Workers'                 },
  { to: '/admin/customers',   icon: '👤', label: 'Customers'               },
  { to: '/admin/jobs',        icon: '📋', label: 'Jobs'                    },
  { to: '/admin/withdrawals', icon: '💸', label: 'Withdrawals'             },
  { to: '/admin/disputes',    icon: '⚠️', label: 'Disputes'                },
  { to: '/admin/accounts',    icon: '🛡️', label: 'Admins'                  },
  { to: '/admin/settings',    icon: '⚙️', label: 'Settings'                },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="al-root">
      <aside className={`al-sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="al-brand">
          <div className="al-brand-icon">S</div>
          <div>
            <div className="al-brand-name">SmartTalent</div>
            <div className="al-brand-tag">Admin Panel</div>
          </div>
        </div>

        <nav className="al-nav">
          {NAV.map(({ to, icon, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `al-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}>
              <span className="al-link-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="al-admin-pill">
          <div className="al-avatar">{user?.name?.[0] ?? 'A'}</div>
          <div>
            <div className="al-admin-name">{user?.name ?? 'Admin'}</div>
            <div className="al-admin-role">Super Admin</div>
          </div>
        </div>

        <button className="al-logout" onClick={() => { logout(); navigate('/') }}>
          ⎋ Sign out
        </button>
      </aside>

      {mobileOpen && <div className="al-overlay" onClick={() => setMobileOpen(false)} />}

      <div className="al-main">
        <header className="al-topbar">
          <button className="al-menu-btn" onClick={() => setMobileOpen(true)}>☰</button>
          <div className="al-topbar-title">Admin Panel</div>
          <div className="al-topbar-right">
            <div className="al-avatar sm">{user?.name?.[0] ?? 'A'}</div>
          </div>
        </header>
        <div className="al-content">{children}</div>
      </div>
    </div>
  )
}