import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'

const STATUS = {
  PENDING:     { label:'Waiting for response', color:'#92400e', bg:'#fef3c7', icon:'🕐', dot:'#f59e0b' },
  ACCEPTED:    { label:'Worker accepted',       color:'#166534', bg:'#dcfce7', icon:'✅', dot:'#22c55e' },
  IN_PROGRESS: { label:'In progress',           color:'#1d4ed8', bg:'#dbeafe', icon:'⚡', dot:'#3b82f6' },
  COMPLETED:   { label:'Completed',             color:'#6b7280', bg:'#f3f4f6', icon:'🎉', dot:'#9ca3af' },
  CANCELLED:   { label:'Declined',              color:'#991b1b', bg:'#fee2e2', icon:'✕',  dot:'#ef4444' },
}

const COLORS = ['#1a6b4a','#7c3aed','#0891b2','#d97706','#dc2626','#be185d']

export default function CustomerRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = requests.filter(r => {
    const matchF = filter === 'all' || r.status === filter
    const matchS = !search || r.title.toLowerCase().includes(search.toLowerCase()) ||
                   r.worker?.user?.name?.toLowerCase().includes(search.toLowerCase())
    return matchF && matchS
  })

  const counts = {
    all:         requests.length,
    PENDING:     requests.filter(r=>r.status==='PENDING').length,
    ACCEPTED:    requests.filter(r=>['ACCEPTED','IN_PROGRESS'].includes(r.status)).length,
    COMPLETED:   requests.filter(r=>r.status==='COMPLETED').length,
    CANCELLED:   requests.filter(r=>r.status==='CANCELLED').length,
  }

  return (
    <CustomerLayout>
      <style>{`
        .cr2-page { display:flex; flex-direction:column; gap:20px; max-width:820px; }
        .cr2-hdr  { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .cr2-title { font-size:22px; font-weight:800; color:#111917; }
        .cr2-sub   { font-size:13px; color:#9ca3af; margin-top:4px; }
        .cr2-search { padding:10px 14px; border:1.5px solid #e8ede9; border-radius:10px; font-size:14px; outline:none; transition:border-color .15s; min-width:200px; }
        .cr2-search:focus { border-color:#4f6ef7; }

        .cr2-tabs { display:flex; gap:5px; flex-wrap:wrap; }
        .cr2-tab  { padding:7px 16px; border-radius:30px; border:1.5px solid #e8ede9; background:#fff; font-size:13px; font-weight:600; color:#6b7b72; cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:6px; }
        .cr2-tab:hover { border-color:#4f6ef7; color:#4f6ef7; }
        .cr2-tab.on { background:#4f6ef7; border-color:#4f6ef7; color:#fff; }
        .cr2-cnt { background:rgba(255,255,255,.2); border-radius:20px; padding:1px 7px; font-size:11px; font-weight:800; }
        .cr2-tab:not(.on) .cr2-cnt { background:#f0f4f1; color:#6b7b72; }

        .cr2-list { display:flex; flex-direction:column; gap:12px; }
        .cr2-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:60px 20px; color:#9ca3af; text-align:center; }
        .cr2-empty-ic { font-size:44px; opacity:.3; }
        .cr2-find-btn { padding:11px 24px; background:#4f6ef7; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; margin-top:4px; transition:background .15s; }
        .cr2-find-btn:hover { background:#3a57e8; }

        .cr2-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:18px 20px; display:flex; align-items:flex-start; gap:14px; transition:all .2s; }
        .cr2-card:hover { border-color:#4f6ef7; box-shadow:0 4px 16px rgba(79,110,247,.08); }
        .cr2-av { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
        .cr2-info { flex:1; min-width:0; }
        .cr2-job-title  { font-size:15px; font-weight:700; color:#111917; }
        .cr2-worker-name { font-size:13px; color:#6b7280; margin-top:2px; }
        .cr2-meta { display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; font-size:12px; color:#9ca3af; }
        .cr2-status-row { display:flex; align-items:center; gap:6px; margin-top:8px; }
        .cr2-status-dot { width:7px; height:7px; border-radius:50%; flex-shrink:0; }
        .cr2-status-txt { font-size:12px; font-weight:600; }
        .cr2-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }
        .cr2-budget { font-size:17px; font-weight:800; color:#111917; }
        .cr2-date   { font-size:11px; color:#9ca3af; }
        .cr2-badge  { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }
        .cr2-action { padding:8px 16px; border-radius:10px; border:none; font-size:13px; font-weight:700; cursor:pointer; transition:all .15s; }
        .cr2-action.primary { background:#4f6ef7; color:#fff; }
        .cr2-action.primary:hover { background:#3a57e8; }
        .cr2-action.green { background:#1a6b4a; color:#fff; }
        .cr2-action.green:hover { background:#134d35; }
        .cr2-action.outline { background:#fff; border:1.5px solid #e8ede9; color:#6b7280; }
        .cr2-action.outline:hover { border-color:#4f6ef7; color:#4f6ef7; }

        .cr2-new-btn { background:linear-gradient(135deg,#4f6ef7,#3a57e8); color:#fff; border:none; border-radius:14px; padding:14px 28px; font-size:15px; font-weight:700; cursor:pointer; align-self:flex-start; transition:all .2s; box-shadow:0 4px 14px rgba(79,110,247,.3); }
        .cr2-new-btn:hover { box-shadow:0 8px 22px rgba(79,110,247,.4); transform:translateY(-1px); }
      `}</style>

      <div className="cr2-page">
        <div className="cr2-hdr">
          <div>
            <h1 className="cr2-title">My requests</h1>
            <p className="cr2-sub">Track all job requests you have sent</p>
          </div>
          <input className="cr2-search" placeholder="Search jobs or workers…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="cr2-tabs">
          {[
            ['all','All',counts.all],
            ['PENDING','Waiting',counts.PENDING],
            ['ACCEPTED','Active',counts.ACCEPTED],
            ['COMPLETED','Done',counts.COMPLETED],
            ['CANCELLED','Declined',counts.CANCELLED],
          ].map(([v,l,c]) => (
            <button key={v} className={`cr2-tab ${filter===v?'on':''}`} onClick={() => setFilter(v)}>
              {l} <span className="cr2-cnt">{c}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="cr2-empty"><p>Loading your requests…</p></div>
        ) : filtered.length === 0 ? (
          <div className="cr2-empty">
            <div className="cr2-empty-ic">📭</div>
            <p>{search ? `No results for "${search}"` : 'No requests yet.'}</p>
            <button className="cr2-find-btn" onClick={() => navigate('/customer/search')}>
              Find a worker →
            </button>
          </div>
        ) : (
          <div className="cr2-list">
            {filtered.map((req, i) => {
              const sm = STATUS[req.status] || STATUS.PENDING
              const workerName = req.worker?.user?.name ?? 'Worker'
              const color = COLORS[workerName.charCodeAt(0) % COLORS.length]
              const isActive = ['ACCEPTED','IN_PROGRESS'].includes(req.status)

              return (
                <div key={req.id} className="cr2-card">
                  <div className="cr2-av" style={{ background: color }}>{workerName[0]}</div>
                  <div className="cr2-info">
                    <div className="cr2-job-title">{req.title}</div>
                    <div className="cr2-worker-name">👷 {workerName}</div>
                    <div className="cr2-meta">
                      <span>📍 {req.address}</span>
                      <span>⚡ {req.urgency}</span>
                      {req.budget && <span>💰 ₹{req.budget.toLocaleString('en-IN')}</span>}
                    </div>
                    <div className="cr2-status-row">
                      <div className="cr2-status-dot" style={{ background:sm.dot }} />
                      <div className="cr2-status-txt" style={{ color:sm.color }}>{sm.label}</div>
                    </div>
                  </div>
                  <div className="cr2-right">
                    <div className="cr2-date">{new Date(req.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    <div className="cr2-badge" style={{ background:sm.bg, color:sm.color }}>{sm.icon} {req.status.replace('_',' ')}</div>
                    {isActive && (
                      <button className="cr2-action primary" onClick={() => navigate('/customer/active')}>
                        View job →
                      </button>
                    )}
                    {req.status === 'COMPLETED' && !req.review && (
                      <button className="cr2-action green" onClick={() => navigate('/customer/active')}>
                        ⭐ Rate
                      </button>
                    )}
                    {req.status === 'COMPLETED' && req.review && (
                      <div style={{ fontSize:13, color:'#9ca3af' }}>
                        {'★'.repeat(req.review.rating)} Rated
                      </div>
                    )}
                    {req.status === 'CANCELLED' && (
                      <button className="cr2-action outline" onClick={() => navigate('/customer/search')}>
                        Try again
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <button className="cr2-new-btn" onClick={() => navigate('/customer/search')}>
          + Send a new request
        </button>
      </div>
    </CustomerLayout>
  )
}