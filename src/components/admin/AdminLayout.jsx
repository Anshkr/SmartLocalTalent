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
    <>
      <style>{`
        /* Force sidebar to be a column that doesn't overflow */
        .al-sidebar {
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
        }
        /* Nav area scrolls when there are too many items */
        .al-nav {
          flex: 1 1 0 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          min-height: 0 !important;
          scrollbar-width: none !important;
        }
        .al-nav::-webkit-scrollbar { display: none; }

        /* Bottom section always pinned, never pushed off screen */
        .al-sidebar-foot {
          flex-shrink: 0;
          padding: 10px 12px 14px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .al-foot-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          margin-bottom: 8px;
        }
        .al-foot-name { font-size: 13px; font-weight: 700; color: #fff; }
        .al-foot-role { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 1px; }
        .al-foot-signout {
          width: 100%;
          padding: 10px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.15s;
          font-family: inherit;
        }
        .al-foot-signout:hover {
          background: rgba(248,113,113,0.12);
          border-color: rgba(248,113,113,0.35);
          color: #f87171;
        }
      `}</style>

      <div className="al-root">
        <aside className={`al-sidebar ${mobileOpen ? 'open' : ''}`}>

          {/* Brand header */}
          <div className="al-brand">
            <div className="al-brand-icon">S</div>
            <div>
              <div className="al-brand-name">SmartTalent</div>
              <div className="al-brand-tag">Admin Panel</div>
            </div>
          </div>

          {/* Scrollable nav — won't push sign out off screen */}
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

          {/* Pinned footer — always visible no matter how many nav items */}
          <div className="al-sidebar-foot">
            <div className="al-foot-pill">
              <div className="al-avatar">{user?.name?.[0] ?? 'A'}</div>
              <div>
                <div className="al-foot-name">{user?.name ?? 'Admin'}</div>
                <div className="al-foot-role">Super Admin</div>
              </div>
            </div>
            <button
              className="al-foot-signout"
              onClick={() => { logout(); navigate('/') }}
            >
              <span>⎋</span>
              Sign out
            </button>
          </div>

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
    </>
  )
}