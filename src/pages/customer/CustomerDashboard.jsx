import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'

export default function CustomerDashboard() {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()
  const [requests, setRequests]   = useState([])
  const [loading, setLoading]     = useState(true)

  const isNew = requests.length === 0 && !loading

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data.slice(0, 3)))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = {
    PENDING:     { bg: '#fef3c7', color: '#92400e', label: 'Waiting'     },
    ACCEPTED:    { bg: '#dcfce7', color: '#166534', label: 'Accepted'    },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af', label: 'In progress' },
    COMPLETED:   { bg: '#eef1fe', color: '#4f6ef7', label: 'Completed'   },
    CANCELLED:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled'   },
  }

  return (
    <CustomerLayout>
      <div className="cd-page">

        {/* Header */}
        <div className="cd-header">
          <h1 className="cd-greeting">
            {isNew ? `Welcome, ${user?.name?.split(' ')[0]}! 👋` : `Hello, ${user?.name?.split(' ')[0]} 👋`}
          </h1>
          <p className="cd-sub">
            {isNew ? 'Find a local worker and get your job done today.' : 'Track your requests and find new workers below.'}
          </p>
        </div>

        {/* New customer onboarding */}
        {isNew && (
          <div className="cd-onboard">
            <div className="cd-onboard-title">🏠 How it works</div>
            <div className="cd-onboard-steps">
              <div className="cd-onboard-step">
                <div className="cd-onboard-num">1</div>
                <div className="cd-onboard-icon">🔍</div>
                <div className="cd-onboard-text"><strong>Search workers</strong><p>Find painters, carpenters, plumbers and more by skill or area</p></div>
              </div>
              <div className="cd-onboard-arrow">→</div>
              <div className="cd-onboard-step">
                <div className="cd-onboard-num">2</div>
                <div className="cd-onboard-icon">📋</div>
                <div className="cd-onboard-text"><strong>Send a request</strong><p>Describe your job and the worker accepts or declines</p></div>
              </div>
              <div className="cd-onboard-arrow">→</div>
              <div className="cd-onboard-step">
                <div className="cd-onboard-num">3</div>
                <div className="cd-onboard-icon">💬</div>
                <div className="cd-onboard-text"><strong>Chat & get it done</strong><p>Chat in-app, track progress, pay and leave a review</p></div>
              </div>
            </div>
            <button className="cd-find-btn" onClick={() => navigate('/customer/search')}>
              Find a worker now →
            </button>
          </div>
        )}

        {/* Recent requests */}
        {!isNew && (
          <div className="cd-section">
            <div className="cd-section-header">
              <h2 className="cd-section-title">Recent requests</h2>
              <button className="cd-see-all" onClick={() => navigate('/customer/requests')}>See all →</button>
            </div>

            {loading ? (
              <div className="cd-loading">Loading…</div>
            ) : (
              <div className="cd-req-list">
                {requests.map(req => {
                  const sc = STATUS_COLOR[req.status] || STATUS_COLOR.PENDING
                  return (
                    <div className="cd-req-card" key={req.id}>
                      <div className="cd-req-avatar">{req.worker?.user?.name?.[0] ?? '?'}</div>
                      <div className="cd-req-info">
                        <div className="cd-req-title">{req.title}</div>
                        <div className="cd-req-worker">👷 {req.worker?.user?.name ?? 'Worker'}</div>
                        <div className="cd-req-meta">
                          <span>📅 {new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                          {req.budget && <span>💰 ₹{req.budget}</span>}
                        </div>
                      </div>
                      <div>
                        <span className="cd-req-badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                        {(req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                          <button className="cd-req-action" onClick={() => navigate('/customer/active')}>View →</button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        <div className="cd-quick-actions">
          <button className="cd-action-card" onClick={() => navigate('/customer/search')}>
            <span>🔍</span>
            <strong>Find a worker</strong>
            <p>Search by skill or area</p>
          </button>
          <button className="cd-action-card" onClick={() => navigate('/customer/requests')}>
            <span>📋</span>
            <strong>My requests</strong>
            <p>Track sent requests</p>
          </button>
          <button className="cd-action-card" onClick={() => navigate('/customer/active')}>
            <span>⚡</span>
            <strong>Active job</strong>
            <p>Chat and track progress</p>
          </button>
          <button className="cd-action-card" onClick={() => navigate('/customer/orders')}>
            <span>🧾</span>
            <strong>Order history</strong>
            <p>View receipts</p>
          </button>
        </div>

      </div>
    </CustomerLayout>
  )
}