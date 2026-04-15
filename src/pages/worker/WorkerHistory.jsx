import { useState, useEffect } from 'react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

export default function WorkerHistory() {
  const { user } = useAuthStore()
  const profile  = user?.workerProfile
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setJobs(data.filter(r => r.status === 'COMPLETED')))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const filtered = jobs.filter(j => {
    const d = new Date(j.updatedAt)
    if (filter === 'week')  return (now - d) < 7  * 86400000
    if (filter === 'month') return (now - d) < 30 * 86400000
    return true
  })

  const totalEarned  = filtered.reduce((a,j) => a+(j.budget||0), 0)
  const reviewedJobs = filtered.filter(j => j.review)
  const avgRating    = reviewedJobs.length
    ? (reviewedJobs.reduce((a,j) => a+j.review.rating, 0) / reviewedJobs.length).toFixed(1)
    : '—'

  const COLORS = ['#1a6b4a','#7c3aed','#0891b2','#d97706','#dc2626','#be185d']

  return (
    <WorkerLayout>
      <style>{`
        .wh2-page { display:flex; flex-direction:column; gap:20px; max-width:820px; }
        .wh2-hdr { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .wh2-title { font-size:22px; font-weight:800; color:#111917; }
        .wh2-sub   { font-size:13px; color:#9ca3af; margin-top:4px; }

        .wh2-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
        @media(max-width:640px){ .wh2-summary { grid-template-columns:repeat(2,1fr); } }
        .wh2-sum { background:#fff; border-radius:14px; border:1.5px solid #e8ede9; padding:18px; }
        .wh2-sum-val { font-size:22px; font-weight:800; color:#111917; line-height:1; }
        .wh2-sum-lbl { font-size:12px; color:#9ca3af; margin-top:5px; }

        .wh2-filters { display:flex; gap:6px; flex-wrap:wrap; }
        .wh2-filter  { padding:7px 16px; border-radius:30px; border:1.5px solid #e8ede9; background:#fff; font-size:13px; font-weight:600; color:#6b7b72; cursor:pointer; transition:all .15s; }
        .wh2-filter:hover { border-color:#1a6b4a; color:#1a6b4a; }
        .wh2-filter.on { background:#0f2d1f; border-color:#0f2d1f; color:#4ade80; }

        .wh2-list { display:flex; flex-direction:column; gap:12px; }
        .wh2-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:60px 20px; color:#9ca3af; text-align:center; }
        .wh2-empty-ic { font-size:44px; opacity:.3; }

        .wh2-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:18px 20px; display:flex; align-items:flex-start; gap:14px; transition:border-color .15s; }
        .wh2-card:hover { border-color:#1a6b4a; }
        .wh2-av { width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
        .wh2-info { flex:1; min-width:0; }
        .wh2-cname { font-size:15px; font-weight:700; color:#111917; }
        .wh2-job   { font-size:13px; color:#6b7280; margin-top:2px; }
        .wh2-meta  { display:flex; gap:12px; flex-wrap:wrap; margin-top:5px; font-size:12px; color:#9ca3af; }
        .wh2-stars { display:flex; gap:2px; margin-top:5px; }
        .wh2-star  { font-size:14px; color:#d1d5db; }
        .wh2-star.on { color:#f59e0b; }
        .wh2-review-text { font-size:13px; color:#4b5563; font-style:italic; margin-top:6px; padding:8px 12px; background:#f8faf9; border-radius:8px; border-left:3px solid #1a6b4a; }
        .wh2-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
        .wh2-earned { font-size:18px; font-weight:800; color:#1a6b4a; }
        .wh2-date   { font-size:11px; color:#9ca3af; }
        .wh2-paid-badge { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700; }
      `}</style>

      <div className="wh2-page">
        <div className="wh2-hdr">
          <div>
            <h1 className="wh2-title">Job history</h1>
            <p className="wh2-sub">All your completed jobs and customer reviews</p>
          </div>
        </div>

        {/* Summary */}
        <div className="wh2-summary">
          {[
            { val: filtered.length,                     lbl: 'Jobs completed',   color:'#1a6b4a' },
            { val: `₹${totalEarned.toLocaleString('en-IN')}`, lbl: 'Earned this period', color:'#7c3aed' },
            { val: avgRating + (avgRating !== '—' ? ' ⭐':''), lbl: 'Avg rating',         color:'#f59e0b' },
            { val: reviewedJobs.length,                 lbl: 'Reviews received', color:'#0891b2' },
          ].map(s => (
            <div className="wh2-sum" key={s.lbl}>
              <div className="wh2-sum-val" style={{ color:s.color }}>{s.val}</div>
              <div className="wh2-sum-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Period filter */}
        <div className="wh2-filters">
          {[['all','All time'],['month','This month'],['week','This week']].map(([v,l]) => (
            <button key={v} className={`wh2-filter ${filter===v?'on':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div className="wh2-empty"><p>Loading history…</p></div>
        ) : filtered.length === 0 ? (
          <div className="wh2-empty">
            <div className="wh2-empty-ic">📁</div>
            <p>No completed jobs in this period yet.</p>
          </div>
        ) : (
          <div className="wh2-list">
            {filtered.map((job, i) => (
              <div className="wh2-card" key={job.id}>
                <div className="wh2-av" style={{ background: COLORS[i%COLORS.length] }}>
                  {job.customer?.name?.[0] ?? '?'}
                </div>
                <div className="wh2-info">
                  <div className="wh2-cname">{job.customer?.name}</div>
                  <div className="wh2-job">{job.title}</div>
                  <div className="wh2-meta">
                    <span>📍 {job.address}</span>
                    <span>⏰ {job.urgency}</span>
                  </div>
                  {job.review && (
                    <>
                      <div className="wh2-stars">
                        {[1,2,3,4,5].map(n => (
                          <span key={n} className={`wh2-star ${n<=job.review.rating?'on':''}`}>★</span>
                        ))}
                        <span style={{ fontSize:12, color:'#6b7280', marginLeft:5 }}>
                          {job.review.rating}/5
                        </span>
                      </div>
                      {job.review.text && (
                        <div className="wh2-review-text">"{job.review.text}"</div>
                      )}
                    </>
                  )}
                </div>
                <div className="wh2-right">
                  <div className="wh2-earned">+₹{(job.budget||0).toLocaleString('en-IN')}</div>
                  <div className="wh2-paid-badge">✓ Paid</div>
                  <div className="wh2-date">
                    {new Date(job.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  )
}