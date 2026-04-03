import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminWorkersAPI, updateWorkerStatusAPI } from '../../lib/api'

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [acting, setActing]     = useState(false)

  useEffect(() => {
    getAdminWorkersAPI()
      .then(({ data }) => setWorkers(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const act = async (id, status) => {
    setActing(true)
    try {
      await updateWorkerStatusAPI(id, status)
      setWorkers((ws) => ws.map((w) => w.id === id ? { ...w, status } : w))
      setSelected(null)
    } catch (err) { console.error(err) }
    finally { setActing(false) }
  }

  const counts = {
    all: workers.length,
    active: workers.filter((w) => w.status === 'ACTIVE').length,
    pending: workers.filter((w) => w.status === 'PENDING').length,
    suspended: workers.filter((w) => w.status === 'SUSPENDED').length,
  }

  const filtered = workers.filter((w) => {
    const matchF = filter === 'all' || w.status.toLowerCase() === filter
    const matchS = !search || w.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.skills?.some((s) => s.toLowerCase().includes(search.toLowerCase()))
    return matchF && matchS
  })

  const sel = workers.find((w) => w.id === selected)

  return (
    <AdminLayout>
      <div className="aw-page">
        <div className="aw-header">
          <div>
            <h1 className="aw-title">Workers</h1>
            <p className="aw-sub">Manage worker accounts and approvals</p>
          </div>
          <input className="aw-search" placeholder="Search by name or skill…"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="aw-tabs">
          {Object.entries(counts).map(([tab, count]) => (
            <button key={tab} className={`aw-tab ${filter === tab ? 'active' : ''}`} onClick={() => setFilter(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="aw-count">{count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="aw-empty">Loading workers…</div>
        ) : (
          <div className="aw-layout">
            <div className="aw-list">
              {filtered.map((w) => (
                <div key={w.id} className={`aw-card ${selected === w.id ? 'selected' : ''}`} onClick={() => setSelected(w.id)}>
                  <div className="aw-card-avatar">{w.user?.name?.[0]}</div>
                  <div className="aw-card-info">
                    <div className="aw-card-name">{w.user?.name}</div>
                    <div className="aw-card-skills">{w.skills?.join(' · ')}</div>
                    <div className="aw-card-meta">📍 {w.area} · ⭐ {w.rating} · {w.jobsDone} jobs</div>
                  </div>
                  <div className="aw-card-right">
                    <span className={`aw-status-badge ${w.status?.toLowerCase()}`}>{w.status}</span>
                    <div className="aw-card-joined">Joined {new Date(w.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <div className="aw-empty">No workers found.</div>}
            </div>

            {sel && (
              <div className="aw-detail">
                <button className="aw-close" onClick={() => setSelected(null)}>✕</button>
                <div className="aw-detail-hero">
                  <div className="aw-detail-avatar">{sel.user?.name?.[0]}</div>
                  <h2 className="aw-detail-name">{sel.user?.name}</h2>
                  <div className="aw-detail-skills">{sel.skills?.map((s) => <span key={s} className="aw-skill-tag">{s}</span>)}</div>
                  <span className={`aw-detail-status ${sel.status?.toLowerCase()}`}>{sel.status}</span>
                </div>
                <div className="aw-detail-grid">
                  <div className="aw-detail-item"><span>Email</span><strong>{sel.user?.email}</strong></div>
                  <div className="aw-detail-item"><span>Phone</span><strong>{sel.user?.phone || '—'}</strong></div>
                  <div className="aw-detail-item"><span>Area</span><strong>{sel.area}</strong></div>
                  <div className="aw-detail-item"><span>Rate</span><strong>₹{sel.rate}/hr</strong></div>
                  <div className="aw-detail-item"><span>Rating</span><strong>⭐ {sel.rating}</strong></div>
                  <div className="aw-detail-item"><span>Jobs done</span><strong>{sel.jobsDone}</strong></div>
                  <div className="aw-detail-item"><span>Earnings</span><strong>₹{(sel.totalEarned||0).toLocaleString()}</strong></div>
                </div>
                <div className="aw-actions">
                  {sel.status === 'PENDING' && (
                    <button className="aw-btn approve" disabled={acting} onClick={() => act(sel.id, 'ACTIVE')}>✅ Approve worker</button>
                  )}
                  {sel.status === 'ACTIVE' && (
                    <button className="aw-btn suspend" disabled={acting} onClick={() => act(sel.id, 'SUSPENDED')}>⛔ Suspend account</button>
                  )}
                  {sel.status === 'SUSPENDED' && (
                    <button className="aw-btn approve" disabled={acting} onClick={() => act(sel.id, 'ACTIVE')}>✅ Reinstate account</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}