import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI, updateStatusAPI } from '../../lib/api'

export default function WorkerRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')
  const [loading, setLoading]   = useState(true)
  const [acting, setActing]     = useState(false)

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const act = async (id, action) => {
    setActing(true)
    try {
      const status = action === 'accept' ? 'ACCEPTED' : 'CANCELLED'
      const { data } = await updateStatusAPI(id, status)
      setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status: data.status } : r))
      setSelected(null)
      if (action === 'accept') setTimeout(() => navigate('/worker/active'), 400)
    } catch (err) {
      console.error(err)
    } finally {
      setActing(false)
    }
  }

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true
    const map = { pending: 'PENDING', accepted: 'ACCEPTED', declined: 'CANCELLED' }
    return r.status === (map[filter] || filter.toUpperCase())
  })

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <WorkerLayout>
      <div className="wr-page">
        <div className="wr-header">
          <div>
            <h1 className="wr-title">Job requests</h1>
            <p className="wr-sub">{pendingCount > 0 ? `${pendingCount} new request${pendingCount > 1 ? 's' : ''} waiting` : 'All caught up!'}</p>
          </div>
        </div>

        <div className="wr-tabs">
          {['all','pending','accepted','declined'].map((tab) => (
            <button key={tab} className={`wr-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && pendingCount > 0 && <span className="wr-badge">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="wr-empty"><div className="wr-empty-icon">⏳</div><p>Loading requests…</p></div>
        ) : (
          <div className="wr-list">
            {filtered.length === 0 && (
              <div className="wr-empty"><div className="wr-empty-icon">📭</div><p>No {filter === 'all' ? '' : filter} requests yet.</p></div>
            )}
            {filtered.map((req) => (
              <div key={req.id}
                className={`wr-card ${req.status?.toLowerCase()} ${selected === req.id ? 'expanded' : ''}`}
                onClick={() => setSelected(selected === req.id ? null : req.id)}
              >
                <div className="wr-card-top">
                  <div className="wr-card-avatar">{req.customer?.name?.[0] ?? '?'}</div>
                  <div className="wr-card-info">
                    <div className="wr-card-customer">{req.customer?.name}</div>
                    <div className="wr-card-job">{req.title}</div>
                    <div className="wr-card-meta">
                      <span>📍 {req.address}</span>
                      <span>💰 {req.budget ? `₹${req.budget}` : 'Open'}</span>
                      <span>⏰ {req.urgency}</span>
                    </div>
                  </div>
                  <div className="wr-card-right">
                    <span className={`wr-status-badge ${req.status === 'PENDING' ? 'pending' : req.status === 'ACCEPTED' ? 'accepted' : 'declined'}`}>
                      {req.status === 'PENDING' ? 'New' : req.status === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                    </span>
                  </div>
                </div>

                {selected === req.id && (
                  <div className="wr-card-detail" onClick={(e) => e.stopPropagation()}>
                    <div className="wr-desc-label">Job description</div>
                    <p className="wr-desc">{req.description}</p>
                    {req.status === 'PENDING' && (
                      <div className="wr-actions">
                        <button className="wr-btn decline" disabled={acting} onClick={() => act(req.id, 'decline')}>Decline</button>
                        <button className="wr-btn accept"  disabled={acting} onClick={() => act(req.id, 'accept')}>Accept job →</button>
                      </div>
                    )}
                    {req.status === 'ACCEPTED' && (
                      <div className="wr-accepted-msg">
                        ✅ You accepted this job.
                        <button className="wr-go-active" onClick={() => navigate('/worker/active')}>Go to active job →</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  )
}