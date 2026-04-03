import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { toggleOnlineAPI, getMyRequestsAPI } from '../../lib/api'

export default function WorkerDashboard() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const [isOnline, setIsOnline]   = useState(user?.workerProfile?.isOnline ?? false)
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [toggling, setToggling]   = useState(false)

  const profile   = user?.workerProfile
  const isPending = profile?.status === 'PENDING'
  const isNew     = (profile?.jobsDone ?? 0) === 0 && (profile?.reviewCount ?? 0) === 0

  const totalEarned = profile?.totalEarned    || 0
  const withdrawn   = profile?.withdrawnAmount || 0
  const available   = totalEarned - withdrawn

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data.slice(0, 3)))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async () => {
    if (isPending || toggling) return
    setToggling(true)
    try {
      const next = !isOnline
      await toggleOnlineAPI(next)
      setIsOnline(next)
      updateUser({ workerProfile: { ...profile, isOnline: next } })
    } catch (e) { console.error(e) }
    finally { setToggling(false) }
  }

  return (
    <WorkerLayout>
      <div className="wd-page">

        {/* Pending banner */}
        {isPending && (
          <div className="wd-pending-banner">
            <span className="wd-pending-icon">⏳</span>
            <div>
              <strong>Your account is under review</strong>
              <p>Admin will approve it shortly. Set up your profile in the meantime.</p>
            </div>
          </div>
        )}

        {/* Header + online toggle */}
        <div className="wd-header">
          <div>
            <h1 className="wd-greeting">
              {isNew ? `Welcome, ${user?.name?.split(' ')[0]}! 🎉` : `Good day, ${user?.name?.split(' ')[0]} 👋`}
            </h1>
            <p className="wd-subtext">
              {isPending ? 'Pending admin approval.' : isOnline ? 'You are visible to customers.' : 'Go online to receive job requests.'}
            </p>
          </div>
          <div className={`wd-online-card ${isOnline && !isPending ? 'online' : 'offline'} ${isPending ? 'disabled' : ''}`}>
            <div className="wd-online-label">
              <div className={`wd-pulse ${isOnline && !isPending ? 'active' : ''}`} />
              <span>{isPending ? 'Pending' : isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button className="wd-toggle" onClick={handleToggle} disabled={toggling || isPending}>
              <div className={`wd-toggle-knob ${isOnline && !isPending ? 'on' : ''}`} />
            </button>
          </div>
        </div>

        {/* New worker checklist */}
        {isNew && (
          <div className="wd-welcome-card">
            <div className="wd-welcome-title">🚀 3 steps to your first job</div>
            <div className="wd-welcome-list">
              <div className={`wd-welcome-item ${profile?.bio ? 'done' : ''}`}>
                <div className="wd-welcome-num">{profile?.bio ? '✓' : '1'}</div>
                <div><strong>Complete your profile</strong><p>Add bio, skills and hourly rate</p></div>
                <button className="wd-welcome-btn" onClick={() => navigate('/worker/profile')}>
                  {profile?.bio ? 'Edit' : 'Set up →'}
                </button>
              </div>
              <div className={`wd-welcome-item ${isOnline ? 'done' : ''}`}>
                <div className="wd-welcome-num">{isOnline ? '✓' : '2'}</div>
                <div><strong>Go online</strong><p>Customers can only find online workers</p></div>
                <button className="wd-welcome-btn" onClick={handleToggle} disabled={toggling || isPending}>
                  {isOnline ? 'Online ✓' : 'Go online →'}
                </button>
              </div>
              <div className="wd-welcome-item">
                <div className="wd-welcome-num">3</div>
                <div><strong>Wait for requests</strong><p>You'll get notified instantly</p></div>
                <button className="wd-welcome-btn" onClick={() => navigate('/worker/requests')}>View →</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {!isNew && (
          <div className="wd-stats">
            {[
              { label: 'Jobs done',    value: profile?.jobsDone ?? 0, icon: '✅', color: '#1a6b4a' },
              { label: 'Avg rating',   value: profile?.rating > 0 ? profile.rating.toFixed(1) : '—', icon: '⭐', color: '#f59e0b' },
              { label: 'Total earned', value: `₹${totalEarned.toLocaleString()}`, icon: '💰', color: '#7c3aed' },
              { label: 'Reviews',      value: profile?.reviewCount ?? 0, icon: '💬', color: '#0891b2' },
            ].map(({ label, value, icon, color }) => (
              <div className="wd-stat-card" key={label}>
                <div className="wd-stat-icon" style={{ background: color + '18', color }}>{icon}</div>
                <div className="wd-stat-value">{value}</div>
                <div className="wd-stat-label">{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Earnings & withdrawal quick card — show only if has earnings */}
        {totalEarned > 0 && (
          <div className="wd-earnings-card">
            <div className="wd-earnings-left">
              <div className="wd-earnings-label">Available to withdraw</div>
              <div className="wd-earnings-amount">₹{available.toLocaleString()}</div>
              <div className="wd-earnings-sub">
                Total earned ₹{totalEarned.toLocaleString()} · Withdrawn ₹{withdrawn.toLocaleString()}
              </div>
            </div>
            <div className="wd-earnings-actions">
              <button
                className="wd-earnings-withdraw-btn"
                onClick={() => navigate('/worker/earnings')}
                disabled={available < 100}
              >
                {available >= 100 ? '💸 Withdraw' : 'View earnings'}
              </button>
              <button className="wd-earnings-view-btn" onClick={() => navigate('/worker/earnings')}>
                Full report →
              </button>
            </div>
          </div>
        )}

        {/* Skills banner */}
        {profile?.skills?.length > 0 && (
          <div className="wd-skills-banner">
            <span className="wd-skills-label">Skills</span>
            <div className="wd-skills-chips">
              {profile.skills.map(s => <span key={s} className="wd-skill-chip">{s}</span>)}
            </div>
            <span className="wd-area">📍 {profile?.area}</span>
          </div>
        )}

        {/* Recent requests */}
        <div className="wd-section">
          <div className="wd-section-header">
            <h2 className="wd-section-title">Recent requests</h2>
            <button className="wd-see-all" onClick={() => navigate('/worker/requests')}>See all →</button>
          </div>

          {loading ? (
            <div className="wd-loading">Loading…</div>
          ) : requests.length === 0 ? (
            <div className="wd-empty-requests">
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <p style={{ color: '#6b7b72', fontSize: 13 }}>
                {isPending ? 'Requests appear here after approval.' : 'No requests yet. Go online so customers can find you.'}
              </p>
            </div>
          ) : (
            <div className="wd-requests">
              {requests.map(req => (
                <div className="wd-req-card" key={req.id}>
                  <div className="wd-req-avatar">{req.customer?.name?.[0] ?? '?'}</div>
                  <div className="wd-req-info">
                    <div className="wd-req-name">{req.customer?.name}</div>
                    <div className="wd-req-job">{req.title}</div>
                    <div className="wd-req-meta">
                      <span>📍 {req.address}</span>
                      <span>💰 {req.budget ? `₹${req.budget}` : 'Open'}</span>
                    </div>
                  </div>
                  <div className="wd-req-right">
                    <span className={`wd-req-badge ${req.status?.toLowerCase()}`}>
                      {req.status === 'PENDING' ? 'New' : req.status}
                    </span>
                    {req.status === 'PENDING' && (
                      <button className="wd-req-view" onClick={() => navigate('/worker/requests')}>View</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {!isOnline && !isPending && (
          <div className="wd-tip">
            <span className="wd-tip-icon">💡</span>
            <div><strong>Go online to get hired!</strong> Customers can only see online workers.</div>
            <button className="wd-tip-btn" onClick={handleToggle}>Go online</button>
          </div>
        )}

      </div>
    </WorkerLayout>
  )
}