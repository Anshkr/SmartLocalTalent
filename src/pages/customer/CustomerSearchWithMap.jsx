import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getWorkersAPI } from '../../lib/api'

const ALL_SKILLS = ['All','Painter','Carpenter','Plumber','Electrician','Gardener','Driver','Sweeper','Mason','Welder','AC Repair','Cook']

// Haversine distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function CustomerSearchWithMap() {
  const navigate   = useNavigate()
  const [workers, setWorkers]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [skill, setSkill]             = useState('All')
  const [query, setQuery]             = useState('')
  const [onlineOnly, setOnline]       = useState(false)
  const [radius, setRadius]           = useState(10)
  const [userLocation, setUserLocation] = useState(null)
  const [locLoading, setLocLoading]   = useState(false)
  const [locError, setLocError]       = useState('')
  const [sortBy, setSort]             = useState('rating')

  useEffect(() => {
    const params = {}
    if (skill !== 'All') params.skill  = skill
    if (onlineOnly)      params.online = 'true'
    setLoading(true)
    getWorkersAPI(params)
      .then(({ data }) => setWorkers(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [skill, onlineOnly])

  const detectLocation = () => {
    setLocLoading(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setLocLoading(false)
      },
      () => {
        setLocError('Could not detect location. Please allow location access.')
        setLocLoading(false)
      },
      { timeout: 8000 }
    )
  }

  const results = useMemo(() => {
    let list = workers
    if (query.trim()) list = list.filter((w) =>
      w.user?.name?.toLowerCase().includes(query.toLowerCase()) ||
      w.area?.toLowerCase().includes(query.toLowerCase()) ||
      w.skills?.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    )
    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating||0) - (a.rating||0))
    if (sortBy === 'rate')   list = [...list].sort((a, b) => a.rate - b.rate)
    if (sortBy === 'jobs')   list = [...list].sort((a, b) => b.jobsDone - a.jobsDone)
    return list
  }, [workers, query, sortBy])

  return (
    <CustomerLayout>
      <div className="cs-page">

        {/* Hero */}
        <div className="cs-hero">
          <h1 className="cs-hero-title">Find local workers near you</h1>
          <p className="cs-hero-sub">Search by skill, area, or use your location to find nearby workers.</p>
          <div className="cs-search-bar">
            <span className="cs-search-icon">🔍</span>
            <input className="cs-search-input" placeholder="Search by name, skill, or area…"
              value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
            {query && <button className="cs-clear" onClick={() => setQuery('')}>✕</button>}
          </div>
        </div>

        {/* Location detector */}
        <div className="cls-location-bar">
          <div className="cls-location-left">
            <span className="cls-loc-icon">📍</span>
            {userLocation ? (
              <span className="cls-loc-text cls-loc-active">
                Location detected — showing workers near you
              </span>
            ) : (
              <span className="cls-loc-text">Use your location to find nearest workers</span>
            )}
          </div>
          <button
            className={`cls-loc-btn ${userLocation ? 'active' : ''}`}
            onClick={detectLocation}
            disabled={locLoading}
          >
            {locLoading ? 'Detecting…' : userLocation ? '✓ Located' : 'Use my location'}
          </button>
        </div>
        {locError && <p style={{ fontSize: 12, color: '#ef4444', marginTop: -8 }}>{locError}</p>}

        {/* Radius slider — only show when location detected */}
        {userLocation && (
          <div className="cls-radius-row">
            <span className="cls-radius-label">Search radius:</span>
            <input type="range" min="2" max="50" value={radius}
              onChange={(e) => setRadius(+e.target.value)} style={{ flex: 1 }} />
            <span className="cls-radius-val">{radius} km</span>
          </div>
        )}

        {/* Skill chips */}
        <div className="cs-skill-row">
          {ALL_SKILLS.map((s) => (
            <button key={s} className={`cs-skill-chip ${skill === s ? 'active' : ''}`} onClick={() => setSkill(s)}>{s}</button>
          ))}
        </div>

        {/* Filters */}
        <div className="cs-filters">
          <label className="cs-toggle-label">
            <div className={`cs-mini-toggle ${onlineOnly ? 'on' : ''}`} onClick={() => setOnline(o => !o)}>
              <div className="cs-mini-knob" />
            </div>
            Online only
          </label>
          <div className="cs-sort">
            <span className="cs-sort-label">Sort:</span>
            {[['rating','Top rated'],['rate','Lowest price'],['jobs','Most jobs']].map(([v, l]) => (
              <button key={v} className={`cs-sort-btn ${sortBy === v ? 'active' : ''}`} onClick={() => setSort(v)}>{l}</button>
            ))}
          </div>
        </div>

        <div className="cs-results-meta">
          {loading ? 'Searching…' : `${results.length} worker${results.length !== 1 ? 's' : ''} found`}
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="cs-empty"><div className="cs-empty-icon">⏳</div><p>Loading workers…</p></div>
        ) : results.length === 0 ? (
          <div className="cs-empty">
            <div className="cs-empty-icon">🔍</div>
            <p>No workers found. Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="cs-grid">
            {results.map((w) => (
              <div key={w.id} className="cs-card" onClick={() => navigate(`/customer/worker/${w.id}`)}>
                {w.jobsDone === 0 && <div className="cs-badge green">New</div>}
                {w.reviewCount >= 10 && <div className="cs-badge gold">Top Rated</div>}

                <div className="cs-card-top">
                  <div className="cs-worker-avatar-wrap">
                    <div className="cs-worker-avatar">{w.user?.name?.[0] ?? '?'}</div>
                    <div className={`cs-online-dot ${w.isOnline ? 'on' : ''}`} />
                  </div>
                  <div className="cs-card-info">
                    <div className="cs-worker-name">{w.user?.name}</div>
                    <div className="cs-worker-skills">
                      {w.skills?.map((s) => <span key={s} className="cs-skill-tag">{s}</span>)}
                    </div>
                    <div className="cs-worker-area">📍 {w.area}</div>
                  </div>
                </div>

                <div className="cs-card-divider" />

                <div className="cs-card-footer">
                  <div className="cs-card-rating">
                    <span className="cs-stars">{'★'.repeat(Math.round(w.rating || 0))}</span>
                    <span className="cs-rating-num">{w.rating > 0 ? w.rating.toFixed(1) : 'New'}</span>
                    <span className="cs-review-count">({w.reviewCount})</span>
                  </div>
                  <div className="cs-card-rate">₹{w.rate}<span>/hr</span></div>
                </div>

                <div className="cs-card-meta">
                  <span className={`cs-avail ${w.isOnline ? 'online' : 'offline'}`}>
                    {w.isOnline ? '● Available now' : '○ Offline'}
                  </span>
                  <span className="cs-exp">{w.jobsDone} jobs done</span>
                </div>

                <button className="cs-view-btn">View profile →</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  )
}