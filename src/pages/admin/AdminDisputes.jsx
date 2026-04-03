import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminDisputesAPI, resolveDisputeAPI } from '../../lib/api'

const PRIORITY_META = {
  HIGH:   { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444' },
  MEDIUM: { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
  LOW:    { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
}

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [note, setNote]         = useState('')
  const [filter, setFilter]     = useState('all')
  const [acting, setActing]     = useState(false)

  useEffect(() => {
    getAdminDisputesAPI()
      .then(({ data }) => setDisputes(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const resolve = async (id) => {
    setActing(true)
    try {
      await resolveDisputeAPI(id, note || 'Resolved by admin.')
      setDisputes((ds) => ds.map((d) => d.id === id ? { ...d, status:'RESOLVED', resolution: note } : d))
      setSelected(null)
      setNote('')
    } catch (err) { console.error(err) }
    finally { setActing(false) }
  }

  const filtered = disputes.filter((d) => filter === 'all' || d.status.toLowerCase() === filter)
  const openCount = disputes.filter((d) => d.status === 'OPEN').length
  const sel = disputes.find((d) => d.id === selected)

  return (
    <AdminLayout>
      <div className="ad-page">
        <div className="ad-header">
          <div>
            <h1 className="ad-title">Disputes</h1>
            <p className="ad-sub">{openCount > 0 ? `${openCount} open dispute${openCount > 1 ? 's' : ''} need attention` : 'All disputes resolved ✅'}</p>
          </div>
        </div>

        <div className="ad-tabs">
          {['all','open','resolved'].map((tab) => (
            <button key={tab} className={`ad-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'open' && openCount > 0 && <span className="ad-badge">{openCount}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="ad-empty"><span>⏳</span><p>Loading disputes…</p></div>
        ) : (
          <div className="ad-layout">
            <div className="ad-list">
              {filtered.length === 0 && <div className="ad-empty"><span>✅</span><p>No {filter} disputes.</p></div>}
              {filtered.map((d) => {
                const pm = PRIORITY_META[d.priority] || PRIORITY_META.MEDIUM
                return (
                  <div key={d.id}
                    className={`ad-card ${selected === d.id ? 'selected' : ''} ${d.status === 'RESOLVED' ? 'resolved' : ''}`}
                    onClick={() => setSelected(d.id)}
                  >
                    <div className="ad-card-top">
                      <div className="ad-priority-dot" style={{ background: pm.dot }} />
                      <div className="ad-card-info">
                        <div className="ad-card-job">{d.job?.title}</div>
                        <div className="ad-card-parties">{d.customer?.name} vs {d.job?.worker?.user?.name}</div>
                        <div className="ad-card-date">🗓 {new Date(d.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div className="ad-card-right">
                        <span className="ad-priority-tag" style={{ background: pm.bg, color: pm.color }}>{d.priority}</span>
                        <span className={`ad-status-tag ${d.status.toLowerCase()}`}>{d.status === 'OPEN' ? 'Open' : 'Resolved'}</span>
                      </div>
                    </div>
                    <p className="ad-card-issue">"{d.issue}"</p>
                  </div>
                )
              })}
            </div>

            {sel && (
              <div className="ad-detail">
                <button className="ad-close" onClick={() => setSelected(null)}>✕</button>
                <div className="ad-detail-header">
                  <h2 className="ad-detail-job">{sel.job?.title}</h2>
                  <span className={`ad-detail-status ${sel.status.toLowerCase()}`}>
                    {sel.status === 'OPEN' ? '🔴 Open' : '✅ Resolved'}
                  </span>
                </div>
                <div className="ad-detail-parties">
                  <div className="ad-party"><div className="ad-party-label">Customer</div><div className="ad-party-name">{sel.customer?.name}</div></div>
                  <div className="ad-vs">vs</div>
                  <div className="ad-party"><div className="ad-party-label">Worker</div><div className="ad-party-name">{sel.job?.worker?.user?.name}</div></div>
                </div>
                <div className="ad-detail-section">
                  <div className="ad-detail-label">Complaint</div>
                  <p className="ad-detail-issue">{sel.issue}</p>
                </div>
                {sel.status === 'OPEN' ? (
                  <div className="ad-resolve-section">
                    <div className="ad-detail-label">Resolution note</div>
                    <textarea className="ad-note" rows={3}
                      placeholder="Write your resolution note…"
                      value={note} onChange={(e) => setNote(e.target.value)} />
                    <button className="ad-resolve-btn" disabled={acting} onClick={() => resolve(sel.id)}>
                      {acting ? 'Resolving…' : '✅ Mark as resolved'}
                    </button>
                  </div>
                ) : (
                  <div className="ad-resolved-msg">
                    ✅ Resolved.
                    {sel.resolution && <p className="ad-resolution-note">"{sel.resolution}"</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}