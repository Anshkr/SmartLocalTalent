import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getWorkerAPI } from '../../lib/api'
import API from '../../lib/api'

function Stars({ rating, size = 16 }) {
  const full = Math.round(rating || 0)
  return (
    <span style={{ display:'inline-flex', gap:2 }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize:size, color: n<=full ? '#f59e0b' : '#e5e7eb' }}>★</span>
      ))}
    </span>
  )
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
      <span style={{ fontSize:12, color:'#6b7280', width:14, textAlign:'right', flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, background:'#f0f4f1', borderRadius:4, height:8, overflow:'hidden' }}>
        <div style={{ width:`${pct}%`, height:'100%', background:'#f59e0b', borderRadius:4, transition:'width .5s' }} />
      </div>
      <span style={{ fontSize:12, color:'#9ca3af', width:28, flexShrink:0 }}>{count}</span>
    </div>
  )
}

export default function WorkerProfilePage() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [worker, setWorker]   = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getWorkerAPI(id),
      API.get(`/reviews/worker/${id}`).catch(() => ({ data: [] }))
    ])
      .then(([w, r]) => {
        setWorker(w.data)
        setReviews(r.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <CustomerLayout>
      <div style={{ padding:60, textAlign:'center', color:'#9ca3af' }}>Loading…</div>
    </CustomerLayout>
  )

  if (!worker) return (
    <CustomerLayout>
      <div style={{ padding:40 }}>
        <p style={{ color:'#ef4444' }}>Worker not found.</p>
        <button onClick={() => navigate('/customer/search')} style={{ color:'#4f6ef7', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>← Back</button>
      </div>
    </CustomerLayout>
  )

  const ratingDist = [5,4,3,2,1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length
  }))

  const avgRating   = worker.rating || 0
  const reviewCount = worker.reviewCount || 0
  const COLORS = ['#1a6b4a','#7c3aed','#0891b2','#d97706','#dc2626']

  return (
    <CustomerLayout>
      <style>{`
        .wpp-page { display:flex; flex-direction:column; gap:20px; max-width:740px; }

        .wpp-back { background:none; border:none; color:#4f6ef7; font-size:14px; font-weight:600; cursor:pointer; padding:0; display:flex; align-items:center; gap:5px; margin-bottom:4px; }

        /* Hero */
        .wpp-hero { background:#fff; border-radius:20px; border:1.5px solid #e8ede9; overflow:hidden; }
        .wpp-hero-top { background:linear-gradient(135deg,#f0fdf4,#e0f2fe); padding:28px 28px 20px; display:flex; align-items:flex-start; gap:20px; flex-wrap:wrap; }
        .wpp-avatar { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:32px; font-weight:800; color:#fff; flex-shrink:0; border:4px solid #fff; box-shadow:0 4px 16px rgba(0,0,0,.12); }
        .wpp-name  { font-size:22px; font-weight:800; color:#111917; font-family:system-ui,sans-serif; }
        .wpp-tagline { font-size:14px; color:#6b7280; margin-top:3px; }
        .wpp-area  { font-size:13px; color:#9ca3af; margin-top:6px; display:flex; align-items:center; gap:5px; }
        .wpp-skills { display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
        .wpp-skill { padding:4px 12px; border-radius:20px; background:#f0fdf4; border:1px solid #dcfce7; font-size:12px; font-weight:600; color:#1a6b4a; }
        .wpp-status-online  { display:inline-flex; align-items:center; gap:5px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:20px; padding:4px 10px; font-size:12px; font-weight:700; color:#16a34a; }
        .wpp-status-offline { display:inline-flex; align-items:center; gap:5px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:20px; padding:4px 10px; font-size:12px; font-weight:700; color:#9ca3af; }

        /* Stats row */
        .wpp-stats { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid #f0f4f1; }
        .wpp-stat  { padding:16px; text-align:center; border-right:1px solid #f0f4f1; }
        .wpp-stat:last-child { border-right:none; }
        .wpp-stat-val { font-size:22px; font-weight:800; color:#111917; font-family:system-ui,sans-serif; }
        .wpp-stat-lbl { font-size:12px; color:#9ca3af; margin-top:3px; }

        /* Rate + book */
        .wpp-action-row { padding:20px 28px; border-top:1px solid #f0f4f1; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .wpp-rate-tag { font-size:28px; font-weight:800; color:#1a6b4a; font-family:system-ui,sans-serif; }
        .wpp-rate-sub { font-size:12px; color:#9ca3af; margin-top:2px; }
        .wpp-hire-btn { background:linear-gradient(135deg,#1a6b4a,#134d35); border:none; border-radius:14px; padding:14px 32px; font-size:15px; font-weight:800; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 6px 18px rgba(26,107,74,.3); }
        .wpp-hire-btn:hover { box-shadow:0 10px 26px rgba(26,107,74,.4); transform:translateY(-2px); }
        .wpp-offline-note { font-size:13px; color:#9ca3af; font-style:italic; }

        /* Bio */
        .wpp-section { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:22px; }
        .wpp-section-title { font-size:15px; font-weight:700; color:#111917; margin-bottom:14px; }
        .wpp-bio { font-size:14px; color:#4b5563; line-height:1.7; }

        /* Rating summary */
        .wpp-rating-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:22px; }
        .wpp-rating-body { display:grid; grid-template-columns:auto 1fr; gap:28px; align-items:center; }
        .wpp-rating-big { text-align:center; }
        .wpp-rating-num  { font-size:56px; font-weight:800; color:#111917; line-height:1; font-family:system-ui,sans-serif; }
        .wpp-rating-cnt  { font-size:13px; color:#9ca3af; margin-top:6px; }
        .wpp-no-reviews { display:flex; flex-direction:column; align-items:center; gap:8px; padding:20px; color:#9ca3af; text-align:center; }
        .wpp-no-rev-ic   { font-size:36px; opacity:.3; }

        /* Review cards */
        .wpp-reviews { display:flex; flex-direction:column; gap:14px; margin-top:18px; }
        .wpp-review { background:#f8faf9; border-radius:14px; border:1px solid #f0f4f1; padding:16px 18px; }
        .wpp-rev-top { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .wpp-rev-av  { width:36px; height:36px; border-radius:50%; background:#4f6ef7; color:#fff; display:flex; align-items:center; justify-content:center; font-size:14px; font-weight:700; flex-shrink:0; }
        .wpp-rev-name { font-size:14px; font-weight:700; color:#111917; }
        .wpp-rev-job  { font-size:11px; color:#9ca3af; margin-top:1px; }
        .wpp-rev-date { font-size:11px; color:#d1d5db; margin-left:auto; }
        .wpp-rev-text { font-size:14px; color:#4b5563; line-height:1.6; margin-top:8px; }
      `}</style>

      <div className="wpp-page">

        <button className="wpp-back" onClick={() => navigate(-1)}>← Back to search</button>

        {/* Hero card */}
        <div className="wpp-hero">
          <div className="wpp-hero-top">
            <div className="wpp-avatar" style={{ background: COLORS[worker.id.charCodeAt(0) % COLORS.length] }}>
              {worker.user?.name?.[0] ?? '?'}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                <div className="wpp-name">{worker.user?.name}</div>
                <div className={worker.isOnline ? 'wpp-status-online' : 'wpp-status-offline'}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background: worker.isOnline ? '#22c55e' : '#d1d5db' }} />
                  {worker.isOnline ? 'Available now' : 'Offline'}
                </div>
              </div>
              <div className="wpp-tagline">{worker.experience ? `${worker.experience} experience` : 'Skilled professional'}</div>
              <div className="wpp-area">📍 {worker.area}</div>
              <div className="wpp-skills">
                {worker.skills?.map(s => <span key={s} className="wpp-skill">{s}</span>)}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="wpp-stats">
            <div className="wpp-stat">
              <div className="wpp-stat-val">
                {avgRating > 0 ? (
                  <span style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center' }}>
                    {avgRating.toFixed(1)} <span style={{ fontSize:18, color:'#f59e0b' }}>★</span>
                  </span>
                ) : '—'}
              </div>
              <div className="wpp-stat-lbl">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</div>
            </div>
            <div className="wpp-stat">
              <div className="wpp-stat-val">{worker.jobsDone || 0}</div>
              <div className="wpp-stat-lbl">Jobs done</div>
            </div>
            <div className="wpp-stat">
              <div className="wpp-stat-val">
                {new Date(worker.user?.createdAt).toLocaleDateString('en-IN', { month:'short', year:'numeric' })}
              </div>
              <div className="wpp-stat-lbl">Member since</div>
            </div>
          </div>

          {/* Rate & CTA */}
          <div className="wpp-action-row">
            <div>
              <div className="wpp-rate-tag">₹{worker.rate}<span style={{ fontSize:16, fontWeight:500, color:'#9ca3af' }}>/hr</span></div>
              <div className="wpp-rate-sub">Hourly rate</div>
            </div>
            {worker.isOnline ? (
              <button className="wpp-hire-btn" onClick={() => navigate(`/customer/request/${worker.id}`)}>
                Book now →
              </button>
            ) : (
              <div className="wpp-offline-note">Currently offline — you can still send a request</div>
            )}
            {!worker.isOnline && (
              <button
                style={{ padding:'12px 22px', border:'1.5px solid #e8ede9', borderRadius:12, background:'#fff', color:'#4b5a52', fontWeight:700, cursor:'pointer', fontSize:14 }}
                onClick={() => navigate(`/customer/request/${worker.id}`)}>
                Send request
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {worker.bio && (
          <div className="wpp-section">
            <div className="wpp-section-title">About {worker.user?.name}</div>
            <div className="wpp-bio">{worker.bio}</div>
          </div>
        )}

        {/* Rating section */}
        <div className="wpp-rating-card">
          <div className="wpp-section-title">Customer reviews</div>

          {reviewCount === 0 ? (
            <div className="wpp-no-reviews">
              <div className="wpp-no-rev-ic">⭐</div>
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            <>
              <div className="wpp-rating-body">
                <div className="wpp-rating-big">
                  <div className="wpp-rating-num">{avgRating.toFixed(1)}</div>
                  <Stars rating={avgRating} size={20} />
                  <div className="wpp-rating-cnt">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</div>
                </div>
                <div>
                  {ratingDist.map(({ star, count }) => (
                    <RatingBar key={star} label={star} count={count} total={reviewCount} />
                  ))}
                </div>
              </div>

              <div className="wpp-reviews">
                {reviews.map(r => (
                  <div key={r.id} className="wpp-review">
                    <div className="wpp-rev-top">
                      <div className="wpp-rev-av">{r.customer?.name?.[0] ?? 'C'}</div>
                      <div>
                        <div className="wpp-rev-name">{r.customer?.name}</div>
                        <div className="wpp-rev-job">{r.job?.title}</div>
                      </div>
                      <div className="wpp-rev-date">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </div>
                    </div>
                    <Stars rating={r.rating} size={14} />
                    {r.text && <div className="wpp-rev-text">"{r.text}"</div>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

      </div>
    </CustomerLayout>
  )
}