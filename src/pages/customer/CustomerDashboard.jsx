import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'

const FEATURED_SERVICES = [
  { icon:'🎨', name:'Painting',    desc:'Walls, exteriors',   color:'#7c3aed' },
  { icon:'🔧', name:'Plumbing',    desc:'Pipes, leaks',       color:'#0891b2' },
  { icon:'⚡', name:'Electrical',  desc:'Wiring, fixtures',   color:'#d97706' },
  { icon:'🔨', name:'Carpentry',   desc:'Furniture, doors',   color:'#1a6b4a' },
  { icon:'❄️', name:'AC Repair',   desc:'Service, gas fill',  color:'#4f6ef7' },
  { icon:'🧹', name:'Cleaning',    desc:'Deep clean, office', color:'#dc2626' },
]

export default function CustomerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [requests, setRequests] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setRequests(data.slice(0,4)))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const active = requests.find(r => ['ACCEPTED','IN_PROGRESS'].includes(r.status))
  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour<12 ? 'Good morning' : hour<17 ? 'Good afternoon' : 'Good evening'

  return (
    <CustomerLayout>
      <style>{`
        .cd2-page { display:flex; flex-direction:column; gap:22px; max-width:900px; }

        /* Hero */
        .cd2-hero { background:linear-gradient(135deg,#1e3a5f 0%,#1a4a7a 100%); border-radius:20px; padding:28px 32px; position:relative; overflow:hidden; }
        .cd2-hero::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(79,110,247,.35),transparent 70%); pointer-events:none; }
        .cd2-hero-row { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .cd2-greeting { font-size:13px; color:rgba(255,255,255,.55); margin-bottom:5px; }
        .cd2-hero-name { font-size:clamp(22px,4vw,30px); font-weight:800; color:#fff; }
        .cd2-hero-sub  { font-size:14px; color:rgba(255,255,255,.55); margin-top:4px; }
        .cd2-hero-btn  { background:linear-gradient(135deg,#4f6ef7,#3a57e8); border:none; border-radius:14px; padding:13px 26px; font-size:15px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 6px 18px rgba(79,110,247,.4); white-space:nowrap; }
        .cd2-hero-btn:hover { box-shadow:0 10px 26px rgba(79,110,247,.5); transform:translateY(-2px); }

        /* Active job banner */
        .cd2-active { background:linear-gradient(135deg,#052e0a,#0f4a1a); border-radius:16px; padding:18px 22px; border:1px solid rgba(74,222,128,.25); display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .cd2-active-tag  { font-size:11px; font-weight:800; color:rgba(74,222,128,.8); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:5px; display:flex; align-items:center; gap:6px; }
        .cd2-active-dot  { width:7px; height:7px; border-radius:50%; background:#4ade80; animation:cd2Pulse 1.5s infinite; }
        @keyframes cd2Pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.3)} }
        .cd2-active-title { font-size:17px; font-weight:800; color:#fff; }
        .cd2-active-sub   { font-size:13px; color:rgba(255,255,255,.55); margin-top:3px; }
        .cd2-active-btn   { background:rgba(74,222,128,.15); border:1.5px solid rgba(74,222,128,.35); border-radius:12px; padding:11px 20px; font-size:14px; font-weight:700; color:#4ade80; cursor:pointer; transition:all .15s; }
        .cd2-active-btn:hover { background:rgba(74,222,128,.25); }

        /* Quick stats */
        .cd2-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:480px){ .cd2-stats { grid-template-columns:repeat(3,1fr); gap:8px; } }
        .cd2-stat  { background:#fff; border-radius:14px; border:1.5px solid #e8ede9; padding:16px; text-align:center; transition:border-color .15s; }
        .cd2-stat:hover { border-color:#4f6ef7; }
        .cd2-stat-val { font-size:22px; font-weight:800; color:#111917; }
        .cd2-stat-lbl { font-size:12px; color:#9ca3af; margin-top:3px; }

        /* Services */
        .cd2-section-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; }
        .cd2-section-ttl { font-size:17px; font-weight:800; color:#111917; }
        .cd2-see-all { background:none; border:none; font-size:13px; font-weight:600; color:#4f6ef7; cursor:pointer; }
        .cd2-services { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:480px){ .cd2-services { grid-template-columns:repeat(2,1fr); } }
        .cd2-srv  { background:#fff; border-radius:14px; border:1.5px solid #e8ede9; padding:18px 14px; display:flex; flex-direction:column; align-items:center; gap:8px; cursor:pointer; transition:all .2s; text-align:center; }
        .cd2-srv:hover { border-color:#4f6ef7; transform:translateY(-2px); box-shadow:0 6px 16px rgba(79,110,247,.1); }
        .cd2-srv-icon { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; }
        .cd2-srv-name { font-size:13px; font-weight:700; color:#111917; }
        .cd2-srv-desc { font-size:11px; color:#9ca3af; }

        /* Recent requests */
        .cd2-req-list { display:flex; flex-direction:column; gap:10px; }
        .cd2-req-card { background:#fff; border-radius:12px; border:1.5px solid #e8ede9; padding:14px 16px; display:flex; align-items:center; gap:12px; transition:border-color .15s; }
        .cd2-req-card:hover { border-color:#4f6ef7; }
        .cd2-req-av   { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:#fff; flex-shrink:0; }
        .cd2-req-name { font-size:14px; font-weight:600; color:#111917; }
        .cd2-req-meta { font-size:12px; color:#9ca3af; margin-top:2px; }
        .cd2-req-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; margin-left:auto; flex-shrink:0; }

        .cd2-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:32px; color:#9ca3af; text-align:center; }
        .cd2-empty-ic { font-size:36px; opacity:.3; }
      `}</style>

      <div className="cd2-page">

        {/* Hero */}
        <div className="cd2-hero">
          <div className="cd2-hero-row">
            <div>
              <div className="cd2-greeting">{greeting} 👋</div>
              <div className="cd2-hero-name">{firstName}</div>
              <div className="cd2-hero-sub">Find skilled workers near you, fast.</div>
            </div>
            <button className="cd2-hero-btn" onClick={() => navigate('/customer/search')}>
              🔍 Find a worker
            </button>
          </div>
        </div>

        {/* Active job */}
        {active && (
          <div className="cd2-active">
            <div>
              <div className="cd2-active-tag"><div className="cd2-active-dot" /> Job in progress</div>
              <div className="cd2-active-title">{active.title}</div>
              <div className="cd2-active-sub">👷 {active.worker?.user?.name} · {active.status.replace('_',' ')}</div>
            </div>
            <button className="cd2-active-btn" onClick={() => navigate('/customer/active')}>
              Track job →
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="cd2-stats">
          {[
            { val: requests.filter(r=>r.status==='COMPLETED').length, lbl:'Jobs done' },
            { val: requests.filter(r=>['PENDING','ACCEPTED','IN_PROGRESS'].includes(r.status)).length, lbl:'Active' },
            { val: requests.filter(r=>r.review).length, lbl:'Reviews given' },
          ].map(s => (
            <div key={s.lbl} className="cd2-stat">
              <div className="cd2-stat-val">{s.val}</div>
              <div className="cd2-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Services */}
        <div>
          <div className="cd2-section-hdr">
            <div className="cd2-section-ttl">Browse services</div>
            <button className="cd2-see-all" onClick={() => navigate('/customer/search')}>See all →</button>
          </div>
          <div className="cd2-services">
            {FEATURED_SERVICES.map(s => (
              <div key={s.name} className="cd2-srv"
                onClick={() => navigate(`/customer/search?skill=${s.name}`)}>
                <div className="cd2-srv-icon" style={{ background:s.color+'18' }}>{s.icon}</div>
                <div className="cd2-srv-name">{s.name}</div>
                <div className="cd2-srv-desc">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent requests */}
        <div>
          <div className="cd2-section-hdr">
            <div className="cd2-section-ttl">Recent requests</div>
            <button className="cd2-see-all" onClick={() => navigate('/customer/requests')}>See all →</button>
          </div>

          {loading ? (
            <div className="cd2-empty"><p>Loading…</p></div>
          ) : requests.length === 0 ? (
            <div className="cd2-empty">
              <div className="cd2-empty-ic">📭</div>
              <p>No requests yet. Find your first worker!</p>
              <button style={{ marginTop:8, padding:'10px 22px', background:'#4f6ef7', color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:13 }}
                onClick={() => navigate('/customer/search')}>Find a worker →</button>
            </div>
          ) : (
            <div className="cd2-req-list">
              {requests.map((req, i) => {
                const STATUS_COLORS = { PENDING:'#f59e0b', ACCEPTED:'#22c55e', IN_PROGRESS:'#3b82f6', COMPLETED:'#9ca3af', CANCELLED:'#ef4444' }
                const STATUS_BG = { PENDING:'#fffbeb', ACCEPTED:'#f0fdf4', IN_PROGRESS:'#eff6ff', COMPLETED:'#f9fafb', CANCELLED:'#fff5f5' }
                const COLORS = ['#1a6b4a','#7c3aed','#0891b2','#d97706']
                return (
                  <div key={req.id} className="cd2-req-card"
                    style={{ cursor:'pointer' }}
                    onClick={() => navigate(['ACCEPTED','IN_PROGRESS'].includes(req.status) ? '/customer/active' : '/customer/requests')}>
                    <div className="cd2-req-av" style={{ background:COLORS[i%COLORS.length] }}>
                      {req.worker?.user?.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div className="cd2-req-name">{req.title}</div>
                      <div className="cd2-req-meta">👷 {req.worker?.user?.name} · {new Date(req.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                    </div>
                    <div className="cd2-req-badge" style={{ color:STATUS_COLORS[req.status], background:STATUS_BG[req.status] }}>
                      {req.status.replace('_',' ')}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </CustomerLayout>
  )
}