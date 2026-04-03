import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'

const STATUS_META = {
  PENDING:     { label: 'Waiting',   color: 'amber', icon: '🕐' },
  ACCEPTED:    { label: 'Accepted',  color: 'green', icon: '✅' },
  IN_PROGRESS: { label: 'In progress', color: 'green', icon: '⚡' },
  COMPLETED:   { label: 'Completed', color: 'blue',  icon: '🎉' },
  CANCELLED:   { label: 'Declined',  color: 'red',   icon: '✕'  },
}

export default function CustomerRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter((r) =>
    filter === 'all' || r.status === filter.toUpperCase()
  )

  return (
    <CustomerLayout>
      <div className="cre-page">
        <div className="cre-header">
          <h1 className="cre-title">My requests</h1>
          <p className="cre-sub">Track all job requests you have sent</p>
        </div>

        <div className="cre-tabs">
          {['all','PENDING','ACCEPTED','COMPLETED','CANCELLED'].map((tab) => (
            <button
              key={tab}
              className={`cre-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab === 'all' ? 'All' : STATUS_META[tab]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="cre-empty">
            <div className="cre-empty-icon">⏳</div>
            <p>Loading your requests…</p>
          </div>
        ) : (
          <div className="cre-list">
            {filtered.length === 0 && (
              <div className="cre-empty">
                <div className="cre-empty-icon">📭</div>
                <p>No {filter === 'all' ? '' : filter.toLowerCase()} requests yet.</p>
                <button className="cre-find-btn" onClick={() => navigate('/customer/search')}>
                  Find a worker →
                </button>
              </div>
            )}

            {filtered.map((req) => {
              const meta = STATUS_META[req.status] || STATUS_META.PENDING
              const workerName = req.worker?.user?.name ?? 'Worker'
              return (
                <div key={req.id} className={`cre-card status-${req.status.toLowerCase()}`}>
                  <div className="cre-card-left">
                    <div className="cre-worker-avatar">{workerName[0]}</div>
                    <div>
                      <div className="cre-job-title">{req.title}</div>
                      <div className="cre-worker-name">👷 {workerName}</div>
                      <div className="cre-card-meta">
                        <span>📅 {new Date(req.createdAt).toLocaleDateString('en-IN')}</span>
                        <span>💰 {req.budget ? `₹${req.budget}` : 'Open'}</span>
                        <span>⏰ {req.urgency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cre-card-right">
                    <span className={`cre-status-badge ${meta.color}`}>
                      {meta.icon} {meta.label}
                    </span>
                    {(req.status === 'ACCEPTED' || req.status === 'IN_PROGRESS') && (
                      <button className="cre-action-btn" onClick={() => navigate('/customer/active')}>
                        View job →
                      </button>
                    )}
                    {req.status === 'COMPLETED' && (
                      <button className="cre-action-btn review" onClick={() => navigate('/customer/active')}>
                        Leave review
                      </button>
                    )}
                    {req.status === 'CANCELLED' && (
                      <button className="cre-action-btn" onClick={() => navigate('/customer/search')}>
                        Find another
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button className="cre-new-btn" onClick={() => navigate('/customer/search')}>
          + Send a new request
        </button>
      </div>
    </CustomerLayout>
  )
}