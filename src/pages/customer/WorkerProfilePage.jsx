import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getWorkerAPI } from '../../lib/api'

export default function WorkerProfilePage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [worker, setWorker]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    getWorkerAPI(id)
      .then(({ data }) => setWorker(data))
      .catch(() => setError('Worker not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <CustomerLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading profile…</div>
    </CustomerLayout>
  )

  if (error || !worker) return (
    <CustomerLayout>
      <div style={{ padding: 40 }}>
        <p style={{ color: '#ef4444', marginBottom: 12 }}>{error || 'Worker not found.'}</p>
        <button onClick={() => navigate('/customer/search')} style={{ color: '#4f6ef7', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          ← Back to search
        </button>
      </div>
    </CustomerLayout>
  )

  const reviews = worker.reviews ?? []

  return (
    <CustomerLayout>
      <div className="cwp-page">
        <button className="cwp-back" onClick={() => navigate('/customer/search')}>← Back to search</button>

        {/* Hero */}
        <div className="cwp-hero">
          <div className="cwp-avatar-wrap">
            <div className="cwp-avatar">{worker.user?.name?.[0] ?? '?'}</div>
            <div className={`cwp-online-dot ${worker.isOnline ? 'on' : ''}`} />
          </div>

          <div className="cwp-hero-info">
            <div className="cwp-hero-top">
              <div>
                <h1 className="cwp-name">{worker.user?.name}</h1>
                <div className="cwp-skills">
                  {worker.skills?.map((s) => <span key={s} className="cwp-skill-tag">{s}</span>)}
                </div>
              </div>
              {worker.jobsDone === 0 && <div className="cwp-badge green">New worker</div>}
              {worker.reviewCount >= 10 && <div className="cwp-badge gold">Top Rated</div>}
            </div>

            <div className="cwp-meta-row">
              <div className="cwp-meta-item">
                <span className="cwp-meta-val">{worker.rating > 0 ? worker.rating.toFixed(1) : '—'} ⭐</span>
                <span className="cwp-meta-key">{worker.reviewCount} reviews</span>
              </div>
              <div className="cwp-meta-sep" />
              <div className="cwp-meta-item">
                <span className="cwp-meta-val">{worker.jobsDone}</span>
                <span className="cwp-meta-key">jobs done</span>
              </div>
              <div className="cwp-meta-sep" />
              <div className="cwp-meta-item">
                <span className="cwp-meta-val">{worker.experience || 'New'}</span>
                <span className="cwp-meta-key">experience</span>
              </div>
              <div className="cwp-meta-sep" />
              <div className="cwp-meta-item">
                <span className="cwp-meta-val">₹{worker.rate}/hr</span>
                <span className="cwp-meta-key">hourly rate</span>
              </div>
            </div>

            <div className="cwp-location">📍 {worker.area}</div>
            <div className={`cwp-avail ${worker.isOnline ? 'online' : 'offline'}`}>
              {worker.isOnline ? '● Available now' : '○ Currently offline'}
            </div>
          </div>
        </div>

        {/* Bio */}
        {worker.bio && (
          <div className="cwp-section">
            <h2 className="cwp-section-title">About</h2>
            <p className="cwp-bio">{worker.bio}</p>
          </div>
        )}

        {/* No bio yet */}
        {!worker.bio && (
          <div className="cwp-section">
            <h2 className="cwp-section-title">About</h2>
            <p className="cwp-bio" style={{ color: '#9ca3af', fontStyle: 'italic' }}>
              This worker hasn't added a bio yet.
            </p>
          </div>
        )}

        {/* Reviews */}
        <div className="cwp-section">
          <h2 className="cwp-section-title">Customer reviews</h2>
          {reviews.length === 0 ? (
            <p style={{ color: '#9ca3af', fontSize: 14, fontStyle: 'italic' }}>
              No reviews yet — be the first to hire and review this worker!
            </p>
          ) : (
            <div className="cwp-reviews">
              {reviews.map((r) => (
                <div className="cwp-review-card" key={r.id}>
                  <div className="cwp-review-top">
                    <div className="cwp-review-avatar">{r.customer?.name?.[0]}</div>
                    <div>
                      <div className="cwp-review-name">{r.customer?.name}</div>
                      <div className="cwp-review-date">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div className="cwp-review-stars">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                  {r.text && <p className="cwp-review-text">"{r.text}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky CTA */}
        <div className="cwp-sticky-cta">
          <div className="cwp-sticky-info">
            <span className="cwp-sticky-rate">₹{worker.rate}/hr</span>
            <span className={`cwp-sticky-avail ${worker.isOnline ? 'on' : ''}`}>
              {worker.isOnline ? '● Online' : '○ Offline'}
            </span>
          </div>
          <button
            className="cwp-request-btn"
            onClick={() => navigate(`/customer/request/${worker.id}`)}
            disabled={!worker.isOnline}
          >
            {worker.isOnline ? 'Send job request →' : 'Worker is offline'}
          </button>
        </div>

      </div>
    </CustomerLayout>
  )
}