import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import NotificationBell from '../shared/NotificationBell'

const NAV = [
  { to:'/customer/home',         icon:'🏠', label:'Home'         },
  { to:'/customer/search',       icon:'🔍', label:'Find Workers'  },
  { to:'/customer/requests',     icon:'📋', label:'Requests'     },
  { to:'/customer/active',       icon:'⚡', label:'Active Job'   },
  { to:'/customer/orders',       icon:'🧾', label:'Orders'       },
  { to:'/customer/transactions', icon:'💳', label:'Transactions' },
  { to:'/customer/profile',      icon:'👤', label:'Profile'      },
  { to:'/customer/settings',     icon:'⚙️', label:'Settings'     },
]

const BOTTOM_NAV = [
  { to:'/customer/home',     icon:'🏠', label:'Home'     },
  { to:'/customer/search',   icon:'🔍', label:'Search'   },
  { to:'/customer/requests', icon:'📋', label:'Requests' },
  { to:'/customer/active',   icon:'⚡', label:'Active'   },
  { to:'/customer/orders',   icon:'🧾', label:'Orders'   },
]

export default function CustomerLayout({ children }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <div className="cl-root">
      <aside className={`cl-sidebar ${sideOpen ? 'open' : ''}`}>
        <style>{`
          .cl-sidebar { display:flex !important; flex-direction:column !important; overflow:hidden !important; }
          .cl-nav { flex:1 !important; overflow-y:auto !important; min-height:0 !important; scrollbar-width:none !important; }
          .cl-nav::-webkit-scrollbar { display:none; }
          .cl-sidebar-foot { flex-shrink:0; padding:10px 12px 14px; border-top:1px solid rgba(0,0,0,.06); }
          .cl-foot-signout { width:100%; padding:10px 14px; border-radius:10px; border:1.5px solid #e8ede9; background:#fff; color:#6b7b72; font-size:13px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:8px; transition:all .15s; font-family:inherit; }
          .cl-foot-signout:hover { border-color:#ef4444; color:#ef4444; background:#fee2e2; }
        `}</style>

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

        <div className="cl-sidebar-foot">
          <button className="cl-foot-signout" onClick={() => { logout(); navigate('/') }}>
            <span>⎋</span> Sign out
          </button>
        </div>
      </aside>

      {sideOpen && <div className="cl-overlay" onClick={() => setSideOpen(false)} />}

      <div className="cl-main">
        <header className="cl-topbar">
          <button className="cl-menu-btn" onClick={() => setSideOpen(true)}>☰</button>
          <div className="cl-topbar-brand">
            <div className="cl-brand-icon sm">S</div>
            <span>SmartTalent</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <NotificationBell />
            <div className="cl-avatar sm">{user?.name?.[0] ?? 'C'}</div>
          </div>
        </header>

        <div className="cl-content">{children}</div>

        <nav className="cl-bottom-nav">
          {BOTTOM_NAV.map(({ to, icon, label }) => (
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