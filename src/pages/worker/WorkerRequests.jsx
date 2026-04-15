import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI, updateStatusAPI } from '../../lib/api'

const URGENCY_COLOR = {
  'today':     { bg:'#fef2f2', color:'#dc2626', label:'Today'     },
  'tomorrow':  { bg:'#fef3c7', color:'#d97706', label:'Tomorrow'  },
  'this-week': { bg:'#f0fdf4', color:'#16a34a', label:'This week' },
  'normal':    { bg:'#f0f9ff', color:'#0284c7', label:'Normal'    },
}

const STATUS_META = {
  PENDING:     { bg:'#fef3c7', color:'#92400e', label:'New'         },
  ACCEPTED:    { bg:'#dcfce7', color:'#166534', label:'Accepted'    },
  IN_PROGRESS: { bg:'#dbeafe', color:'#1d4ed8', label:'In Progress' },
  COMPLETED:   { bg:'#f3f4f6', color:'#6b7280', label:'Done'        },
  CANCELLED:   { bg:'#fee2e2', color:'#991b1b', label:'Declined'    },
}

export default function WorkerRequests() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [acting, setActing]     = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const act = async (id, action) => {
    setActing(id)
    try {
      const status = action === 'accept' ? 'ACCEPTED' : 'CANCELLED'
      await updateStatusAPI(id, status)
      setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r))
      setSelected(null)
      if (action === 'accept') setTimeout(() => navigate('/worker/active'), 600)
    } catch (err) {
      console.error(err)
    } finally { setActing(null) }
  }

  const filtered = requests.filter(r =>
    filter === 'all' ? true :
    filter === 'pending' ? r.status === 'PENDING' :
    filter === 'accepted' ? ['ACCEPTED','IN_PROGRESS'].includes(r.status) :
    filter === 'done' ? ['COMPLETED','CANCELLED'].includes(r.status) : true
  )

  const counts = {
    all: requests.length,
    pending:  requests.filter(r => r.status === 'PENDING').length,
    accepted: requests.filter(r => ['ACCEPTED','IN_PROGRESS'].includes(r.status)).length,
    done:     requests.filter(r => ['COMPLETED','CANCELLED'].includes(r.status)).length,
  }

  return (
    <WorkerLayout>
      <style>{`
        .wr2-page { display:flex; flex-direction:column; gap:20px; max-width:820px; }
        .wr2-hdr { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .wr2-title { font-size:22px; font-weight:800; color:#111917; }
        .wr2-sub   { font-size:13px; color:#9ca3af; margin-top:4px; }

        .wr2-tabs { display:flex; gap:6px; flex-wrap:wrap; }
        .wr2-tab  { padding:8px 16px; border-radius:30px; border:1.5px solid #e8ede9; background:#fff; font-size:13px; font-weight:600; color:#6b7b72; cursor:pointer; transition:all .15s; display:flex; align-items:center; gap:6px; }
        .wr2-tab:hover  { border-color:#1a6b4a; color:#1a6b4a; }
        .wr2-tab.on { background:#0f2d1f; border-color:#0f2d1f; color:#4ade80; }
        .wr2-count { background:rgba(255,255,255,.15); border-radius:20px; padding:1px 7px; font-size:11px; font-weight:800; }
        .wr2-tab:not(.on) .wr2-count { background:#f0f4f1; color:#6b7b72; }

        .wr2-list { display:flex; flex-direction:column; gap:12px; }
        .wr2-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:60px 20px; color:#9ca3af; text-align:center; }
        .wr2-empty-ic { font-size:44px; opacity:.3; }
        .wr2-loading { display:flex; justify-content:center; gap:8px; padding:40px; color:#9ca3af; font-size:14px; }

        .wr2-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; overflow:hidden; cursor:pointer; transition:all .2s; }
        .wr2-card:hover { border-color:#1a6b4a; box-shadow:0 6px 20px rgba(26,107,74,.08); }
        .wr2-card.open { border-color:#1a6b4a; box-shadow:0 8px 24px rgba(26,107,74,.12); }

        .wr2-card-top { padding:16px 20px; display:flex; align-items:center; gap:14px; }
        .wr2-avatar { width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
        .wr2-cname { font-size:15px; font-weight:700; color:#111917; }
        .wr2-job   { font-size:13px; color:#6b7280; margin-top:2px; }
        .wr2-right { display:flex; flex-direction:column; align-items:flex-end; gap:5px; margin-left:auto; flex-shrink:0; }
        .wr2-budget { font-size:16px; font-weight:800; color:#1a6b4a; }
        .wr2-time   { font-size:11px; color:#9ca3af; }
        .wr2-badge  { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; }

        /* Expanded detail */
        .wr2-detail { padding:0 20px 18px; border-top:1px solid #f0f4f1; display:flex; flex-direction:column; gap:12px; }
        .wr2-desc   { font-size:14px; color:#4b5563; line-height:1.6; padding-top:14px; }
        .wr2-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .wr2-info-item { background:#f8faf9; border-radius:10px; padding:10px 12px; }
        .wr2-info-lbl  { font-size:11px; color:#9ca3af; font-weight:600; text-transform:uppercase; letter-spacing:.5px; margin-bottom:3px; }
        .wr2-info-val  { font-size:14px; font-weight:700; color:#111917; }
        .wr2-urgency-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:700; }

        .wr2-actions { display:flex; gap:10px; }
        .wr2-accept { flex:2; padding:12px; border-radius:12px; border:none; background:linear-gradient(135deg,#1a6b4a,#134d35); color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; box-shadow:0 4px 14px rgba(26,107,74,.3); }
        .wr2-accept:hover:not(:disabled) { box-shadow:0 8px 20px rgba(26,107,74,.4); transform:translateY(-1px); }
        .wr2-accept:disabled { opacity:.55; cursor:not-allowed; }
        .wr2-decline { flex:1; padding:12px; border-radius:12px; border:1.5px solid #e8ede9; background:#fff; color:#6b7280; font-size:14px; font-weight:700; cursor:pointer; transition:all .15s; }
        .wr2-decline:hover:not(:disabled) { border-color:#ef4444; color:#ef4444; background:#fee2e2; }
        .wr2-decline:disabled { opacity:.55; cursor:not-allowed; }
      `}</style>

      <div className="wr2-page">

        <div className="wr2-hdr">
          <div>
            <h1 className="wr2-title">Job requests</h1>
            <p className="wr2-sub">Accept or decline incoming requests from customers</p>
          </div>
        </div>

        <div className="wr2-tabs">
          {[['all','All'],['pending','New'],['accepted','Active'],['done','Done']].map(([v,l]) => (
            <button key={v} className={`wr2-tab ${filter===v?'on':''}`} onClick={() => setFilter(v)}>
              {l} <span className="wr2-count">{counts[v]}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="wr2-loading">⏳ Loading requests…</div>
        ) : filtered.length === 0 ? (
          <div className="wr2-empty">
            <div className="wr2-empty-ic">📭</div>
            <p>No {filter === 'all' ? '' : filter} requests yet.</p>
          </div>
        ) : (
          <div className="wr2-list">
            {filtered.map(req => {
              const isOpen = selected === req.id
              const sm = STATUS_META[req.status] || STATUS_META.PENDING
              const urg = URGENCY_COLOR[(req.urgency||'').toLowerCase()] || URGENCY_COLOR['normal']
              const COLORS = ['#1a6b4a','#7c3aed','#0891b2','#d97706','#dc2626','#be185d']
              const color = COLORS[req.customer?.name?.charCodeAt(0) % COLORS.length] || '#1a6b4a'

              return (
                <div key={req.id} className={`wr2-card ${isOpen?'open':''}`}
                  onClick={() => setSelected(isOpen ? null : req.id)}>

                  <div className="wr2-card-top">
                    <div className="wr2-avatar" style={{ background: color }}>
                      {req.customer?.name?.[0] ?? '?'}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="wr2-cname">{req.customer?.name}</div>
                      <div className="wr2-job">{req.title}</div>
                    </div>
                    <div className="wr2-right">
                      <div className="wr2-budget">{req.budget ? `₹${req.budget.toLocaleString('en-IN')}` : 'Open budget'}</div>
                      <div className="wr2-badge" style={{ background:sm.bg, color:sm.color }}>{sm.label}</div>
                      <div className="wr2-time">{new Date(req.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="wr2-detail">
                      <div className="wr2-desc">{req.description}</div>
                      <div className="wr2-info-grid">
                        <div className="wr2-info-item">
                          <div className="wr2-info-lbl">Location</div>
                          <div className="wr2-info-val">📍 {req.address}</div>
                        </div>
                        <div className="wr2-info-item">
                          <div className="wr2-info-lbl">Urgency</div>
                          <div className="wr2-urgency-badge" style={{ background:urg.bg, color:urg.color }}>
                            ⚡ {req.urgency || 'Normal'}
                          </div>
                        </div>
                        <div className="wr2-info-item">
                          <div className="wr2-info-lbl">Budget</div>
                          <div className="wr2-info-val">{req.budget ? `₹${req.budget.toLocaleString('en-IN')}` : 'Open'}</div>
                        </div>
                        <div className="wr2-info-item">
                          <div className="wr2-info-lbl">Customer phone</div>
                          <div className="wr2-info-val">{req.customer?.phone || '—'}</div>
                        </div>
                      </div>

                      {req.status === 'PENDING' && (
                        <div className="wr2-actions">
                          <button className="wr2-accept"
                            onClick={e => { e.stopPropagation(); act(req.id, 'accept') }}
                            disabled={acting === req.id}>
                            {acting === req.id ? '⏳ Accepting…' : '✓ Accept job'}
                          </button>
                          <button className="wr2-decline"
                            onClick={e => { e.stopPropagation(); act(req.id, 'decline') }}
                            disabled={acting === req.id}>
                            Decline
                          </button>
                        </div>
                      )}

                      {req.status === 'ACCEPTED' && (
                        <button className="wr2-accept" style={{ maxWidth:220 }}
                          onClick={e => { e.stopPropagation(); navigate('/worker/active') }}>
                          → Go to active job
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </WorkerLayout>
  )
}