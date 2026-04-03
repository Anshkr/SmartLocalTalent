import { useState } from 'react'
import useNotifications from '../../hooks/useNotifications'

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, dismiss } = useNotifications()
  const [open, setOpen] = useState(false)

  const toggle = () => {
    setOpen((o) => !o)
    if (!open) markAllRead()
  }

  return (
    <div className="nb-wrap">
      <button className="nb-btn" onClick={toggle}>
        <span className="nb-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="nb-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="nb-dropdown">
          <div className="nb-header">
            <span className="nb-title">Notifications</span>
            {notifications.length > 0 && (
              <button className="nb-clear" onClick={() => dismiss('all')}>
                Clear all
              </button>
            )}
          </div>

          <div className="nb-list">
            {notifications.length === 0 ? (
              <div className="nb-empty">
                <span>🔕</span>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`nb-item ${n.type}`}>
                  <div className="nb-item-icon">
                    {n.type === 'request'  ? '📋' :
                     n.type === 'accepted' ? '✅' :
                     n.type === 'message'  ? '💬' :
                     n.type === 'review'   ? '⭐' : '🔔'}
                  </div>
                  <div className="nb-item-body">
                    <div className="nb-item-msg">{n.message}</div>
                    <div className="nb-item-time">{n.time}</div>
                  </div>
                  <button className="nb-item-dismiss" onClick={() => dismiss(n.id)}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {open && <div className="nb-overlay" onClick={() => setOpen(false)} />}
    </div>
  )
}