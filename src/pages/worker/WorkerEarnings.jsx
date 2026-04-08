import { useState, useEffect } from 'react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI, getWithdrawalsAPI, requestWithdrawalAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

const METHODS = [
  { id: 'upi',   label: 'UPI',           sub: 'GPay · PhonePe · Paytm',  placeholder: 'yourname@upi'           },
  { id: 'bank',  label: 'Bank Transfer', sub: 'NEFT / IMPS · Instant',    placeholder: 'Account No · IFSC Code' },
  { id: 'paytm', label: 'Paytm Wallet', sub: 'Paytm wallet transfer',     placeholder: '10-digit mobile number' },
]

const WSTATUS = {
  PENDING:  { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Pending'  },
  APPROVED: { bg: '#dcfce7', color: '#166534', dot: '#22c55e', label: 'Approved' },
  REJECTED: { bg: '#fee2e2', color: '#991b1b', dot: '#ef4444', label: 'Rejected' },
}

export default function WorkerEarnings() {
  const { user } = useAuthStore()
  const profile  = user?.workerProfile

  const [jobs, setJobs]               = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading]         = useState(true)
  const [period, setPeriod]           = useState('all')
  const [activeTab, setActiveTab]     = useState('overview')
  const [showModal, setShowModal]     = useState(false)
  const [wMethod, setWMethod]         = useState('upi')
  const [wAmount, setWAmount]         = useState('')
  const [wAccount, setWAccount]       = useState('')
  const [wLoading, setWLoading]       = useState(false)
  const [wError, setWError]           = useState('')
  const [wSuccess, setWSuccess]       = useState('')

  useEffect(() => {
    Promise.all([getMyRequestsAPI(), getWithdrawalsAPI()])
      .then(([j, w]) => {
        setJobs(j.data.filter(x => x.status === 'COMPLETED'))
        setWithdrawals(w.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const filtered = jobs.filter(j => {
    const d = new Date(j.updatedAt)
    if (period === 'week')  return (now - d) < 7  * 86400000
    if (period === 'month') return (now - d) < 30 * 86400000
    return true
  })

  const totalEarned  = profile?.totalEarned    || 0
  const withdrawn    = profile?.withdrawnAmount || 0
  const available    = totalEarned - withdrawn
  const periodEarned = filtered.reduce((a, j) => a + (j.budget || 0), 0)
  const avgRating    = profile?.rating > 0 ? profile.rating.toFixed(1) : '—'

  const byMonth = {}
  jobs.forEach(j => {
    const key = new Date(j.updatedAt).toLocaleDateString('en-IN', { month: 'short' })
    byMonth[key] = (byMonth[key] || 0) + (j.budget || 0)
  })
  const chartData = Object.entries(byMonth).slice(-6)
  const chartMax  = Math.max(...chartData.map(([, v]) => v), 1)

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setWError('')
    const amt = parseInt(wAmount)
    if (!amt || amt < 100) return setWError('Minimum withdrawal amount is ₹100')
    if (amt > available)   return setWError(`Maximum available is ₹${available.toLocaleString('en-IN')}`)
    if (!wAccount.trim())  return setWError('Please enter your account details')
    setWLoading(true)
    try {
      await requestWithdrawalAPI({ amount: amt, method: wMethod, accountDetails: wAccount.trim() })
      setWSuccess(`₹${amt.toLocaleString('en-IN')} withdrawal request submitted!`)
      setWAmount(''); setWAccount('')
      const { data } = await getWithdrawalsAPI()
      setWithdrawals(data)
      setTimeout(() => { setShowModal(false); setWSuccess('') }, 2500)
    } catch (err) {
      setWError(err.response?.data?.error || 'Failed to submit. Try again.')
    } finally { setWLoading(false) }
  }

  return (
    <WorkerLayout>
      <style>{`
        .we-page { display:flex; flex-direction:column; gap:0; max-width:960px; }

        .we-hero {
          background: linear-gradient(135deg,#071810 0%,#0f2d1f 50%,#1a3d28 100%);
          border-radius: 20px; padding: 32px 36px; margin-bottom: 24px; position:relative; overflow:hidden;
        }
        .we-hero::before {
          content:''; position:absolute; top:-80px; right:-80px; width:280px; height:280px; border-radius:50%;
          background: radial-gradient(circle,rgba(26,107,74,.45) 0%,transparent 70%); pointer-events:none;
        }
        .we-hero::after {
          content:''; position:absolute; bottom:-40px; left:25%; width:200px; height:200px; border-radius:50%;
          background: radial-gradient(circle,rgba(245,158,11,.07) 0%,transparent 70%); pointer-events:none;
        }
        .we-hero-row { position:relative; z-index:1; display:flex; align-items:center; justify-content:space-between; gap:24px; flex-wrap:wrap; }
        .we-hero-left { display:flex; flex-direction:column; gap:8px; }
        .we-eyebrow { font-size:11px; font-weight:700; color:rgba(74,222,128,.8); letter-spacing:2px; text-transform:uppercase; }
        .we-balance { font-size:clamp(36px,5vw,56px); font-weight:800; color:#fff; line-height:1; letter-spacing:-2px; }
        .we-hint { font-size:13px; color:rgba(255,255,255,.4); margin-top:3px; }
        .we-pills { display:flex; gap:10px; flex-wrap:wrap; margin-top:8px; }
        .we-pill { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.1); border-radius:30px; padding:5px 13px; font-size:12px; }
        .we-pdot { width:6px; height:6px; border-radius:50%; flex-shrink:0; }
        .we-pval { color:#fff; font-weight:700; }
        .we-plbl { color:rgba(255,255,255,.4); }
        .we-cta {
          background: linear-gradient(135deg,#22c55e,#16a34a); border:none; border-radius:14px;
          padding:14px 30px; font-size:15px; font-weight:700; color:#fff; cursor:pointer;
          transition:all .2s; white-space:nowrap; flex-shrink:0; box-shadow:0 8px 24px rgba(34,197,94,.35);
        }
        .we-cta:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 14px 32px rgba(34,197,94,.45); }
        .we-cta:disabled { opacity:.4; cursor:not-allowed; box-shadow:none; transform:none; }

        .we-ctrl { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:18px; }
        .we-periods { display:flex; gap:4px; background:#f0f4f1; border-radius:12px; padding:4px; }
        .we-per { padding:8px 18px; border-radius:9px; border:none; background:transparent; font-size:13px; font-weight:600; color:#6b7b72; cursor:pointer; transition:all .15s; }
        .we-per.on { background:#fff; color:#111917; box-shadow:0 1px 6px rgba(0,0,0,.08); }

        .we-tabs { display:flex; border-bottom:2px solid #e8ede9; margin-bottom:20px; }
        .we-tab { padding:10px 22px; border:none; background:transparent; font-size:14px; font-weight:600; color:#9ca3af; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all .15s; }
        .we-tab.on { color:#1a6b4a; border-bottom-color:#1a6b4a; }

        .we-kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:22px; }
        @media(max-width:700px) { .we-kpis { grid-template-columns:repeat(2,1fr); } }
        .we-kpi { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:20px; display:flex; flex-direction:column; gap:8px; transition:border-color .15s; }
        .we-kpi:hover { border-color:#1a6b4a; }
        .we-kpi-ic  { width:40px; height:40px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; }
        .we-kpi-val { font-size:26px; font-weight:800; line-height:1; }
        .we-kpi-lbl { font-size:12px; color:#9ca3af; }
        .we-kpi-sub { font-size:11px; color:#d1d5db; }

        .we-chart { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:24px; margin-bottom:20px; }
        .we-chart-hdr { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .we-chart-ttl { font-size:15px; font-weight:700; color:#111917; }
        .we-chart-tot { font-size:13px; color:#9ca3af; }
        .we-chart-tot b { color:#1a6b4a; font-weight:700; }
        .we-bars { display:flex; align-items:flex-end; gap:10px; height:140px; }
        .we-bcol { flex:1; display:flex; flex-direction:column; align-items:center; gap:5px; height:100%; justify-content:flex-end; }
        .we-bamt { font-size:10px; font-weight:600; color:#9ca3af; white-space:nowrap; }
        .we-btrack { width:100%; flex:1; display:flex; flex-direction:column; justify-content:flex-end; background:#f0f4f1; border-radius:6px; overflow:hidden; }
        .we-bfill { width:100%; background:linear-gradient(180deg,#4ade80,#1a6b4a); border-radius:6px 6px 0 0; min-height:4px; }
        .we-blbl { font-size:11px; color:#9ca3af; }

        .we-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:48px; color:#9ca3af; text-align:center; }
        .we-empty-ic { font-size:40px; opacity:.3; }

        .we-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; overflow:hidden; }
        .we-card-hdr { display:flex; align-items:center; justify-content:space-between; padding:18px 22px; border-bottom:1px solid #f0f4f1; }
        .we-card-ttl { font-size:15px; font-weight:700; color:#111917; }
        .we-card-cnt { font-size:12px; color:#9ca3af; background:#f8faf9; border:1px solid #e8ede9; border-radius:20px; padding:3px 10px; font-weight:600; }

        .we-tx { display:flex; align-items:center; gap:14px; padding:14px 22px; border-bottom:1px solid #f8faf9; transition:background .12s; }
        .we-tx:last-child { border-bottom:none; }
        .we-tx:hover { background:#fafbfa; }
        .we-tx-ic { width:40px; height:40px; border-radius:12px; background:#f0fdf4; border:1px solid #dcfce7; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .we-tx-name { font-size:14px; font-weight:600; color:#111917; }
        .we-tx-meta { font-size:12px; color:#9ca3af; margin-top:2px; }
        .we-tx-amt  { font-size:17px; font-weight:800; color:#1a6b4a; }
        .we-tx-stars { display:flex; gap:1px; margin-top:3px; }
        .we-tx-star  { font-size:11px; color:#d1d5db; }
        .we-tx-star.on { color:#f59e0b; }

        .we-wdl { display:flex; align-items:center; gap:14px; padding:16px 22px; border-bottom:1px solid #f8faf9; transition:background .12s; }
        .we-wdl:last-child { border-bottom:none; }
        .we-wdl:hover { background:#fafbfa; }
        .we-wdl-ic   { width:42px; height:42px; border-radius:12px; background:#f0f4f1; border:1.5px solid #e8ede9; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .we-wdl-name { font-size:14px; font-weight:600; color:#111917; }
        .we-wdl-acc  { font-size:12px; color:#9ca3af; margin-top:2px; font-family:monospace; }
        .we-wdl-date { font-size:11px; color:#d1d5db; margin-top:3px; }
        .we-wdl-amt  { font-size:17px; font-weight:800; color:#111917; }
        .we-wdl-badge { font-size:11px; font-weight:700; padding:3px 10px; border-radius:20px; display:inline-flex; align-items:center; gap:5px; margin-top:4px; }
        .we-wdl-dot  { width:5px; height:5px; border-radius:50%; }

        .we-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
        .we-modal { background:#fff; border-radius:22px; max-width:440px; width:100%; overflow:hidden; max-height:92vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:weIn .25s cubic-bezier(.34,1.56,.64,1); }
        @keyframes weIn { from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }

        .we-mtop { background:linear-gradient(135deg,#071810,#0f2d1f); padding:26px 28px; position:relative; }
        .we-mx { position:absolute; top:14px; right:14px; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,.1); border:none; color:rgba(255,255,255,.7); font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
        .we-mx:hover { background:rgba(255,255,255,.2); color:#fff; }
        .we-mey { font-size:11px; font-weight:700; color:rgba(74,222,128,.8); letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
        .we-mbal { font-size:44px; font-weight:800; color:#fff; line-height:1; letter-spacing:-2px; }
        .we-mhint { font-size:13px; color:rgba(255,255,255,.45); margin-top:6px; }

        .we-mbody { padding:22px; display:flex; flex-direction:column; gap:18px; }
        .we-lbl { font-size:13px; font-weight:700; color:#374151; margin-bottom:8px; }
        .we-quicks { display:flex; gap:7px; flex-wrap:wrap; }
        .we-qbtn { flex:1; min-width:58px; padding:9px 6px; border-radius:10px; border:1.5px solid #e8ede9; background:#f8faf9; font-size:13px; font-weight:700; color:#4b5a52; cursor:pointer; transition:all .15s; text-align:center; }
        .we-qbtn:hover { border-color:#1a6b4a; color:#1a6b4a; background:#f0fdf4; }
        .we-qbtn.on { background:#1a6b4a; border-color:#1a6b4a; color:#fff; }
        .we-qbtn:disabled { opacity:.35; cursor:not-allowed; }

        .we-awrap { position:relative; display:flex; align-items:center; }
        .we-apre  { position:absolute; left:13px; font-size:20px; font-weight:700; color:#6b7b72; z-index:1; pointer-events:none; }
        .we-ain   { width:100%; padding:14px 74px 14px 31px; border-radius:12px; border:2px solid #e8ede9; font-size:22px; font-weight:800; color:#111917; outline:none; transition:border-color .15s; }
        .we-ain:focus { border-color:#1a6b4a; }
        .we-amax  { position:absolute; right:10px; background:#1a6b4a; color:#fff; border:none; border-radius:8px; padding:6px 11px; font-size:12px; font-weight:700; cursor:pointer; }

        .we-mlist { display:flex; flex-direction:column; gap:8px; }
        .we-meth  { display:flex; align-items:center; gap:12px; padding:13px 14px; border-radius:12px; border:2px solid #e8ede9; background:#fff; cursor:pointer; text-align:left; transition:all .15s; }
        .we-meth:hover { border-color:#1a6b4a; }
        .we-meth.on { border-color:#1a6b4a; background:#f0fdf4; }
        .we-meth-ic { font-size:22px; flex-shrink:0; }
        .we-meth-name { font-size:14px; font-weight:700; color:#111917; }
        .we-meth-sub  { font-size:11px; color:#9ca3af; margin-top:1px; }
        .we-radio { width:18px; height:18px; border-radius:50%; border:2px solid #d1d5db; margin-left:auto; flex-shrink:0; transition:all .15s; }
        .we-meth.on .we-radio { border-color:#1a6b4a; background:#1a6b4a; box-shadow:inset 0 0 0 3px #fff; }

        .we-accin { width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e8ede9; font-size:14px; outline:none; transition:border-color .15s; }
        .we-accin:focus { border-color:#1a6b4a; }

        .we-merr { background:#fee2e2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; font-size:13px; color:#991b1b; }
        .we-mok  { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:20px; font-size:14px; color:#166534; font-weight:700; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; }
        .we-mok-ic  { font-size:44px; }
        .we-mok-sub { font-size:12px; color:#4b7a5a; font-weight:500; }

        .we-submit { background:linear-gradient(135deg,#22c55e,#16a34a); border:none; border-radius:13px; padding:15px; width:100%; font-size:16px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 6px 20px rgba(22,163,74,.3); }
        .we-submit:hover:not(:disabled) { box-shadow:0 10px 28px rgba(22,163,74,.4); transform:translateY(-1px); }
        .we-submit:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; transform:none; }
        .we-snote { text-align:center; font-size:12px; color:#9ca3af; }
      `}</style>

      <div className="we-page">

        {/* HERO */}
        <div className="we-hero">
          <div className="we-hero-row">
            <div className="we-hero-left">
              <div className="we-eyebrow">Available balance</div>
              <div className="we-balance">₹{available.toLocaleString('en-IN')}</div>
              <div className="we-hint">
                {available < 100 ? 'Complete jobs to build your balance' : 'Ready to withdraw anytime'}
              </div>
              <div className="we-pills">
                <div className="we-pill">
                  <div className="we-pdot" style={{ background:'#4ade80' }} />
                  <span className="we-pval">₹{totalEarned.toLocaleString('en-IN')}</span>
                  <span className="we-plbl">Total earned</span>
                </div>
                <div className="we-pill">
                  <div className="we-pdot" style={{ background:'#a78bfa' }} />
                  <span className="we-pval">₹{withdrawn.toLocaleString('en-IN')}</span>
                  <span className="we-plbl">Withdrawn</span>
                </div>
                <div className="we-pill">
                  <div className="we-pdot" style={{ background:'#f59e0b' }} />
                  <span className="we-pval">{profile?.jobsDone || 0}</span>
                  <span className="we-plbl">Jobs done</span>
                </div>
              </div>
            </div>
            <button className="we-cta" onClick={() => setShowModal(true)} disabled={available < 100}>
              {available < 100 ? 'Min ₹100 needed' : '💸 Withdraw funds'}
            </button>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="we-ctrl">
          <div className="we-periods">
            {[['week','This week'],['month','This month'],['all','All time']].map(([v,l]) => (
              <button key={v} className={`we-per ${period===v?'on':''}`} onClick={() => setPeriod(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="we-tabs">
          {[['overview','Overview'],['transactions','Transactions'],['withdrawals','Withdrawals']].map(([v,l]) => (
            <button key={v} className={`we-tab ${activeTab===v?'on':''}`} onClick={() => setActiveTab(v)}>{l}</button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === 'overview' && <>
          <div className="we-kpis">
            {[
              { ic:'💰', bg:'#dcfce7', color:'#16a34a', val:`₹${periodEarned.toLocaleString('en-IN')}`, lbl:'Period earnings',  sub:`${filtered.length} jobs` },
              { ic:'✅', bg:'#dbeafe', color:'#2563eb', val:filtered.length,                             lbl:'Jobs completed',   sub:'This period'             },
              { ic:'⭐', bg:'#fef3c7', color:'#d97706', val:avgRating,                                   lbl:'Average rating',   sub:`${profile?.reviewCount||0} reviews` },
              { ic:'💳', bg:'#ede9fe', color:'#7c3aed', val:`₹${withdrawn.toLocaleString('en-IN')}`,    lbl:'Total withdrawn',  sub:`${withdrawals.filter(w=>w.status==='APPROVED').length} payouts` },
            ].map(k => (
              <div className="we-kpi" key={k.lbl}>
                <div className="we-kpi-ic" style={{ background:k.bg }}>{k.ic}</div>
                <div className="we-kpi-val" style={{ color:k.color }}>{k.val}</div>
                <div className="we-kpi-lbl">{k.lbl}</div>
                <div className="we-kpi-sub">{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="we-chart">
            <div className="we-chart-hdr">
              <div className="we-chart-ttl">Monthly earnings</div>
              <div className="we-chart-tot">All time: <b>₹{jobs.reduce((a,j)=>a+(j.budget||0),0).toLocaleString('en-IN')}</b></div>
            </div>
            {chartData.length === 0 ? (
              <div className="we-empty">
                <div className="we-empty-ic">📊</div>
                <p>No data yet. Complete jobs to see your chart.</p>
              </div>
            ) : (
              <div className="we-bars">
                {chartData.map(([month, val]) => (
                  <div key={month} className="we-bcol">
                    <div className="we-bamt">{val>=1000?`₹${(val/1000).toFixed(1)}k`:val>0?`₹${val}`:''}</div>
                    <div className="we-btrack">
                      <div className="we-bfill" style={{ height:`${Math.max((val/chartMax)*100,4)}%` }} />
                    </div>
                    <div className="we-blbl">{month}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>}

        {/* TRANSACTIONS */}
        {activeTab === 'transactions' && (
          <div className="we-card">
            <div className="we-card-hdr">
              <span className="we-card-ttl">Job transactions</span>
              <span className="we-card-cnt">{filtered.length} jobs</span>
            </div>
            {loading ? (
              <div className="we-empty"><p>Loading…</p></div>
            ) : filtered.length === 0 ? (
              <div className="we-empty"><div className="we-empty-ic">💸</div><p>No transactions in this period.</p></div>
            ) : filtered.map(job => (
              <div key={job.id} className="we-tx">
                <div className="we-tx-ic">✅</div>
                <div style={{ flex:1 }}>
                  <div className="we-tx-name">{job.title}</div>
                  <div className="we-tx-meta">{job.customer?.name} · {new Date(job.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end' }}>
                  <div className="we-tx-amt">+₹{(job.budget||0).toLocaleString('en-IN')}</div>
                  {job.review && (
                    <div className="we-tx-stars">
                      {[1,2,3,4,5].map(n=><span key={n} className={`we-tx-star ${n<=job.review.rating?'on':''}`}>★</span>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WITHDRAWALS */}
        {activeTab === 'withdrawals' && (
          <div className="we-card">
            <div className="we-card-hdr">
              <span className="we-card-ttl">Withdrawal history</span>
              <span className="we-card-cnt">{withdrawals.length} requests</span>
            </div>
            {withdrawals.length === 0 ? (
              <div className="we-empty"><div className="we-empty-ic">🏦</div><p>No withdrawal requests yet.</p></div>
            ) : withdrawals.map(w => {
              const sc = WSTATUS[w.status] || WSTATUS.PENDING
              const ico = w.method==='upi'?'📱':w.method==='bank'?'🏦':'💜'
              return (
                <div key={w.id} className="we-wdl">
                  <div className="we-wdl-ic">{ico}</div>
                  <div style={{ flex:1 }}>
                    <div className="we-wdl-name">{w.method.toUpperCase()} withdrawal</div>
                    <div className="we-wdl-acc">{w.accountDetails}</div>
                    <div className="we-wdl-date">{new Date(w.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                  </div>
                  <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end' }}>
                    <div className="we-wdl-amt">₹{w.amount.toLocaleString('en-IN')}</div>
                    <div className="we-wdl-badge" style={{ background:sc.bg,color:sc.color }}>
                      <div className="we-wdl-dot" style={{ background:sc.dot }} />{sc.label}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* WITHDRAWAL MODAL */}
      {showModal && (
        <div className="we-overlay" onClick={()=>!wLoading&&setShowModal(false)}>
          <div className="we-modal" onClick={e=>e.stopPropagation()}>

            <div className="we-mtop">
              <button className="we-mx" onClick={()=>!wLoading&&setShowModal(false)}>✕</button>
              <div className="we-mey">Withdraw funds</div>
              <div className="we-mbal">₹{available.toLocaleString('en-IN')}</div>
              <div className="we-mhint">Available balance · Minimum ₹100</div>
            </div>

            {wSuccess ? (
              <div className="we-mbody">
                <div className="we-mok">
                  <div className="we-mok-ic">🎉</div>
                  <strong>{wSuccess}</strong>
                  <div className="we-mok-sub">Admin will process within 24 hours.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="we-mbody">

                <div>
                  <div className="we-lbl">Quick select</div>
                  <div className="we-quicks">
                    {[500,1000,2000,5000].map(a=>(
                      <button key={a} type="button" className={`we-qbtn ${+wAmount===a?'on':''}`}
                        onClick={()=>setWAmount(a.toString())} disabled={a>available}>
                        ₹{a.toLocaleString('en-IN')}
                      </button>
                    ))}
                    <button type="button" className={`we-qbtn ${+wAmount===available&&available>0?'on':''}`}
                      onClick={()=>setWAmount(available.toString())}>Max</button>
                  </div>
                </div>

                <div>
                  <div className="we-lbl">Enter amount</div>
                  <div className="we-awrap">
                    <span className="we-apre">₹</span>
                    <input className="we-ain" type="number" placeholder="0"
                      min="100" max={available} value={wAmount}
                      onChange={e=>setWAmount(e.target.value)} />
                    <button type="button" className="we-amax"
                      onClick={()=>setWAmount(available.toString())}>Max</button>
                  </div>
                </div>

                <div>
                  <div className="we-lbl">Payment method</div>
                  <div className="we-mlist">
                    {METHODS.map(m=>(
                      <button key={m.id} type="button"
                        className={`we-meth ${wMethod===m.id?'on':''}`}
                        onClick={()=>{setWMethod(m.id);setWAccount('')}}>
                        <span className="we-meth-ic">{m.id==='upi'?'📱':m.id==='bank'?'🏦':'💜'}</span>
                        <div>
                          <div className="we-meth-name">{m.label}</div>
                          <div className="we-meth-sub">{m.sub}</div>
                        </div>
                        <div className="we-radio" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="we-lbl">{wMethod==='upi'?'UPI ID':wMethod==='bank'?'Account number & IFSC code':'Paytm mobile number'}</div>
                  <input className="we-accin"
                    placeholder={METHODS.find(m=>m.id===wMethod)?.placeholder}
                    value={wAccount} onChange={e=>setWAccount(e.target.value)} required />
                </div>

                {wError && <div className="we-merr">{wError}</div>}

                <button type="submit" className="we-submit" disabled={wLoading||!wAmount}>
                  {wLoading?'⏳ Submitting…':`Request ₹${wAmount?parseInt(wAmount).toLocaleString('en-IN'):'—'} withdrawal`}
                </button>
                <div className="we-snote">⏱ Processed within 24 hours by admin</div>
              </form>
            )}
          </div>
        </div>
      )}
    </WorkerLayout>
  )
}