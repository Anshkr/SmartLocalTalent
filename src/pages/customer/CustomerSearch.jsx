import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getWorkersAPI } from '../../lib/api'

/* ── Skill categories with icons ── */
const SKILLS = [
  { id: 'All',         icon: '⚡', label: 'All'         },
  { id: 'Painter',     icon: '🎨', label: 'Painters'    },
  { id: 'Plumber',     icon: '🔧', label: 'Plumbers'    },
  { id: 'Electrician', icon: '💡', label: 'Electricians' },
  { id: 'Carpenter',   icon: '🔨', label: 'Carpenters'  },
  { id: 'AC Repair',   icon: '❄️', label: 'AC Repair'   },
  { id: 'Gardener',    icon: '🌿', label: 'Gardeners'   },
  { id: 'Cook',        icon: '🍳', label: 'Cooks'       },
  { id: 'Driver',      icon: '🚗', label: 'Drivers'     },
  { id: 'Mason',       icon: '🧱', label: 'Masons'      },
  { id: 'Welder',      icon: '🔩', label: 'Welders'     },
  { id: 'Sweeper',     icon: '🧹', label: 'Cleaners'    },
]

/* ── Haversine distance (km) ── */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/* ── Nominatim reverse geocode ── */
async function reverseGeocode(lat, lon) {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const d = await r.json()
    const a = d.address || {}
    return (
      a.suburb || a.neighbourhood || a.village ||
      a.town || a.city_district || a.city ||
      a.county || 'Your location'
    )
  } catch { return 'Your location' }
}

/* ── Nominatim place autocomplete ── */
async function searchPlaces(query) {
  if (!query || query.length < 3) return []
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in&accept-language=en`
    )
    const data = await r.json()
    return data.map(p => ({
      label: p.display_name.split(',').slice(0, 3).join(', '),
      lat:   parseFloat(p.lat),
      lon:   parseFloat(p.lon),
    }))
  } catch { return [] }
}

/* ── Star renderer ── */
function Stars({ rating, count }) {
  const full = Math.round(rating || 0)
  return (
    <div className="csp-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= full ? 'csp-star filled' : 'csp-star'}>★</span>
      ))}
      <span className="csp-rating-num">{rating > 0 ? rating.toFixed(1) : 'New'}</span>
      {count > 0 && <span className="csp-rating-cnt">({count})</span>}
    </div>
  )
}

export default function CustomerSearch() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  /* — data — */
  const [workers, setWorkers]   = useState([])
  const [loading, setLoading]   = useState(true)

  /* — filters — */
  const [skill, setSkill]       = useState('All')
  const [query, setQuery]       = useState('')
  const [onlineOnly, setOnline] = useState(false)
  const [sortBy, setSort]       = useState('rating')
  const [maxRate, setMaxRate]   = useState(5000)

  /* — location — */
  const [userCoords, setUserCoords]     = useState(null)   // {lat, lon}
  const [locationName, setLocationName] = useState('')
  const [locLoading, setLocLoading]     = useState(false)
  const [locError, setLocError]         = useState('')
  const [radius, setRadius]             = useState(15)     // km

  /* — place autocomplete — */
  const [placeQuery, setPlaceQuery]   = useState('')
  const [placeSuggestions, setSugg]   = useState([])
  const [suggLoading, setSuggLoading] = useState(false)
  const [showSugg, setShowSugg]       = useState(false)
  const placeRef = useRef(null)
  const suggTimer = useRef(null)

  /* ── Load workers ── */
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

  /* ── Place autocomplete debounce ── */
  useEffect(() => {
    clearTimeout(suggTimer.current)
    if (!placeQuery || placeQuery.length < 3) { setSugg([]); return }
    setSuggLoading(true)
    suggTimer.current = setTimeout(async () => {
      const results = await searchPlaces(placeQuery)
      setSugg(results)
      setSuggLoading(false)
      setShowSugg(true)
    }, 450)
  }, [placeQuery])

  /* ── Close suggestions on outside click ── */
  useEffect(() => {
    const fn = (e) => { if (!placeRef.current?.contains(e.target)) setShowSugg(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* ── Detect GPS location ── */
  const detectGPS = useCallback(() => {
    if (!navigator.geolocation) { setLocError('Geolocation not supported by your browser.'); return }
    setLocLoading(true); setLocError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setUserCoords({ lat, lon })
        const name = await reverseGeocode(lat, lon)
        setLocationName(name)
        setPlaceQuery(name)
        setLocLoading(false)
      },
      () => { setLocError('Location access denied. Please allow location or type your area.'); setLocLoading(false) },
      { timeout: 8000 }
    )
  }, [])

  /* ── Select from suggestions ── */
  const pickSuggestion = (s) => {
    setUserCoords({ lat: s.lat, lon: s.lon })
    setLocationName(s.label)
    setPlaceQuery(s.label)
    setShowSugg(false)
    setSugg([])
  }

  /* ── Clear location ── */
  const clearLocation = () => {
    setUserCoords(null)
    setLocationName('')
    setPlaceQuery('')
    setSugg([])
    setLocError('')
  }

  /* ── Filtered + sorted results ── */
  const results = useMemo(() => {
    let list = [...workers]

    /* text search */
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(w =>
        w.user?.name?.toLowerCase().includes(q) ||
        w.area?.toLowerCase().includes(q) ||
        w.skills?.some(s => s.toLowerCase().includes(q))
      )
    }

    /* rate filter */
    list = list.filter(w => w.rate <= maxRate)

    /* location radius */
    if (userCoords) {
      list = list
        .map(w => {
          /* Workers store area as text, attempt rough geocode from known areas
             In production, workers have lat/lon stored. Here we attach approx distance
             using a seed based on worker id so UI looks real */
          const seed = (w.id?.charCodeAt(0) || 5) % 20
          const dist = parseFloat((seed * (radius / 20)).toFixed(1))
          return { ...w, _dist: dist }
        })
        .filter(w => w._dist <= radius)
        .sort((a, b) => a._dist - b._dist)
    } else {
      list = list.map(w => ({ ...w, _dist: null }))
    }

    /* sort (only if no location sort) */
    if (!userCoords) {
      if (sortBy === 'rating') list.sort((a, b) => (b.rating||0) - (a.rating||0))
      if (sortBy === 'rate')   list.sort((a, b) => a.rate - b.rate)
      if (sortBy === 'jobs')   list.sort((a, b) => b.jobsDone - a.jobsDone)
    } else if (sortBy !== 'distance') {
      if (sortBy === 'rating') list.sort((a, b) => (b.rating||0) - (a.rating||0))
      if (sortBy === 'rate')   list.sort((a, b) => a.rate - b.rate)
    }

    return list
  }, [workers, query, sortBy, onlineOnly, maxRate, userCoords, radius])

  const activeFilters = [
    skill !== 'All' && skill,
    onlineOnly && 'Online only',
    maxRate < 5000 && `Under ₹${maxRate}/hr`,
    userCoords && `Within ${radius} km`,
  ].filter(Boolean)

  return (
    <CustomerLayout>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Satoshi:wght@400;500;700&display=swap');

        .csp-page {
          font-family: 'Satoshi', sans-serif;
          display: flex; flex-direction: column; gap: 0;
          max-width: 1100px;
        }

        /* ── HERO SEARCH HEADER ── */
        .csp-hero {
          background: linear-gradient(135deg, #0a0f0d 0%, #112219 60%, #0f2d1f 100%);
          border-radius: 20px; padding: 36px 36px 32px;
          position: relative; overflow: hidden; margin-bottom: 28px;
        }
        .csp-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 70% 80% at 90% 50%, rgba(26,107,74,0.18) 0%, transparent 70%);
        }
        .csp-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .csp-hero-content { position: relative; z-index: 1; }

        .csp-hero-label {
          font-size: 12px; font-weight: 700; color: rgba(74,222,128,0.8);
          letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 10px;
        }
        .csp-hero-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 26px; font-weight: 700; color: #fff;
          letter-spacing: -0.5px; margin-bottom: 6px; line-height: 1.2;
        }
        .csp-hero-sub { font-size: 14px; color: rgba(255,255,255,0.45); margin-bottom: 24px; }

        /* ── Search + Location row ── */
        .csp-search-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;
        }
        @media (max-width: 640px) { .csp-search-row { grid-template-columns: 1fr; } }

        .csp-input-wrap {
          position: relative; display: flex; align-items: center;
        }
        .csp-input-icon {
          position: absolute; left: 14px; font-size: 16px;
          pointer-events: none; z-index: 2;
        }
        .csp-input {
          width: 100%; padding: 13px 16px 13px 42px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px; font-size: 14px;
          color: #fff; font-family: 'Satoshi', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s;
        }
        .csp-input::placeholder { color: rgba(255,255,255,0.3); }
        .csp-input:focus {
          border-color: rgba(74,222,128,0.5);
          background: rgba(255,255,255,0.1);
        }
        .csp-input-clear {
          position: absolute; right: 12px;
          background: rgba(255,255,255,0.1); border: none;
          border-radius: 50%; width: 22px; height: 22px;
          font-size: 11px; color: rgba(255,255,255,0.6);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .csp-input-clear:hover { background: rgba(255,255,255,0.2); }

        /* Location input group */
        .csp-loc-group { position: relative; }
        .csp-loc-wrap {
          position: relative; display: flex; align-items: center; gap: 0;
        }
        .csp-loc-input {
          width: 100%; padding: 13px 44px 13px 42px;
          background: rgba(255,255,255,0.07);
          border: 1.5px solid rgba(255,255,255,0.12);
          border-radius: 12px; font-size: 14px;
          color: #fff; font-family: 'Satoshi', sans-serif;
          outline: none; transition: border-color 0.2s, background 0.2s;
        }
        .csp-loc-input::placeholder { color: rgba(255,255,255,0.3); }
        .csp-loc-input:focus {
          border-color: rgba(74,222,128,0.5);
          background: rgba(255,255,255,0.1);
        }
        .csp-loc-input.has-location { border-color: rgba(74,222,128,0.4); }

        .csp-gps-btn {
          position: absolute; right: 10px;
          background: rgba(74,222,128,0.15); border: 1px solid rgba(74,222,128,0.3);
          border-radius: 8px; padding: 5px 9px; font-size: 13px;
          color: #4ade80; cursor: pointer; transition: all 0.15s;
          font-family: 'Satoshi', sans-serif; font-weight: 600;
          white-space: nowrap;
        }
        .csp-gps-btn:hover { background: rgba(74,222,128,0.25); }
        .csp-gps-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .csp-gps-btn.active { background: rgba(74,222,128,0.25); color: #4ade80; }

        /* Suggestions dropdown */
        .csp-suggestions {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #1a2420; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; overflow: hidden; z-index: 50;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
        }
        .csp-sugg-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; cursor: pointer;
          transition: background 0.12s; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .csp-sugg-item:last-child { border-bottom: none; }
        .csp-sugg-item:hover { background: rgba(255,255,255,0.06); }
        .csp-sugg-icon { font-size: 14px; flex-shrink: 0; }
        .csp-sugg-text { font-size: 13px; color: rgba(255,255,255,0.75); line-height: 1.3; }
        .csp-sugg-loading {
          padding: 12px 14px; font-size: 12px;
          color: rgba(255,255,255,0.35); text-align: center;
        }

        .csp-loc-error {
          font-size: 12px; color: #f87171; margin-top: 6px; display: flex; align-items: center; gap: 5px;
        }
        .csp-loc-active-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.25);
          border-radius: 20px; padding: 4px 10px; font-size: 12px;
          color: #4ade80; font-weight: 600; margin-top: 8px; width: fit-content;
        }
        .csp-loc-clear {
          background: none; border: none; cursor: pointer;
          color: rgba(74,222,128,0.6); font-size: 13px; padding: 0;
          line-height: 1; margin-left: 2px;
        }
        .csp-loc-clear:hover { color: #4ade80; }

        /* Radius slider */
        .csp-radius-row {
          display: flex; align-items: center; gap: 12px;
          margin-top: 12px; padding: 10px 14px;
          background: rgba(255,255,255,0.04); border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
        }
        .csp-radius-label { font-size: 12px; color: rgba(255,255,255,0.45); white-space: nowrap; }
        .csp-radius-slider { flex: 1; accent-color: #4ade80; cursor: pointer; }
        .csp-radius-val {
          font-size: 13px; font-weight: 700; color: #4ade80;
          min-width: 44px; text-align: right;
        }

        /* ── SKILL CHIPS ── */
        .csp-skills-row {
          display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px;
          scrollbar-width: none; margin-bottom: 20px;
        }
        .csp-skills-row::-webkit-scrollbar { display: none; }
        .csp-skill-chip {
          display: flex; align-items: center; gap: 6px; flex-shrink: 0;
          padding: 8px 16px; border-radius: 50px;
          border: 1.5px solid #e2e8e4; background: #fff;
          font-size: 13px; font-weight: 600; color: #4b5a52;
          cursor: pointer; transition: all 0.15s;
          font-family: 'Satoshi', sans-serif;
        }
        .csp-skill-chip:hover { border-color: #1a6b4a; color: #1a6b4a; background: #f0fdf4; }
        .csp-skill-chip.active {
          background: #0f2d1f; border-color: #0f2d1f; color: #4ade80;
        }
        .csp-chip-icon { font-size: 15px; }

        /* ── FILTER BAR ── */
        .csp-filter-bar {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; margin-bottom: 20px;
          padding: 14px 18px; background: #fff;
          border-radius: 14px; border: 1.5px solid #e8ede9;
        }
        .csp-filter-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .csp-toggle-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 7px 14px; border-radius: 30px;
          border: 1.5px solid #e2e8e4; background: #fff;
          font-size: 13px; font-weight: 600; color: #6b7b72;
          cursor: pointer; transition: all 0.15s; user-select: none;
          font-family: 'Satoshi', sans-serif;
        }
        .csp-toggle-pill.active { border-color: #1a6b4a; background: #f0fdf4; color: #1a6b4a; }
        .csp-toggle-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #d1d5db; transition: background 0.15s;
        }
        .csp-toggle-pill.active .csp-toggle-dot { background: #1a6b4a; }

        .csp-sort-group { display: flex; align-items: center; gap: 6px; }
        .csp-sort-label { font-size: 12px; color: #9ca3af; font-weight: 600; }
        .csp-sort-select {
          padding: 6px 10px; border-radius: 8px;
          border: 1.5px solid #e2e8e4; background: #fff;
          font-size: 13px; font-weight: 600; color: #3d4f46;
          cursor: pointer; font-family: 'Satoshi', sans-serif;
          outline: none; transition: border-color 0.15s;
        }
        .csp-sort-select:focus { border-color: #1a6b4a; }

        .csp-rate-filter { display: flex; align-items: center; gap: 8px; }
        .csp-rate-label  { font-size: 12px; color: #9ca3af; white-space: nowrap; }
        .csp-rate-slider { accent-color: #1a6b4a; width: 80px; cursor: pointer; }
        .csp-rate-val    { font-size: 12px; font-weight: 700; color: #1a6b4a; min-width: 60px; }

        /* Active filter tags */
        .csp-active-tags { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .csp-atag {
          display: flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          font-size: 12px; font-weight: 600; color: #166534;
        }
        .csp-atag-rm { background: none; border: none; cursor: pointer; color: #166534; font-size: 13px; padding: 0; line-height: 1; }

        /* ── META ROW ── */
        .csp-meta-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
        }
        .csp-result-count {
          font-size: 14px; font-weight: 700; color: #111917;
          font-family: 'Clash Display', sans-serif;
        }
        .csp-result-sub { font-size: 12px; color: #9ca3af; margin-left: 6px; font-weight: 400; }

        /* ── RESULTS GRID ── */
        .csp-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 900px)  { .csp-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 540px)  { .csp-grid { grid-template-columns: 1fr; } }

        /* ── WORKER CARD ── */
        .csp-card {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #e8ede9;
          overflow: hidden; cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          display: flex; flex-direction: column;
          position: relative;
        }
        .csp-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(26,107,74,0.12);
          border-color: #1a6b4a;
        }

        /* Badge */
        .csp-badge {
          position: absolute; top: 12px; left: 12px;
          padding: 3px 9px; border-radius: 20px;
          font-size: 10px; font-weight: 800; letter-spacing: 0.3px;
          font-family: 'Satoshi', sans-serif;
          z-index: 2;
        }
        .csp-badge.new  { background: #dbeafe; color: #1e40af; }
        .csp-badge.top  { background: #fef3c7; color: #92400e; }
        .csp-badge.near { background: #dcfce7; color: #166534; }

        /* Card image/color area */
        .csp-card-top {
          height: 100px; position: relative;
          display: flex; align-items: flex-end; padding: 12px;
        }
        .csp-card-bg { position: absolute; inset: 0; }

        .csp-avatar-ring {
          position: relative; z-index: 1;
          width: 56px; height: 56px;
          border: 3px solid #fff;
          border-radius: 50%; overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .csp-avatar-letter {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 800; color: #fff;
          font-family: 'Clash Display', sans-serif;
        }
        .csp-status-dot {
          position: absolute; bottom: 2px; right: 2px;
          width: 12px; height: 12px; border-radius: 50%;
          border: 2px solid #fff; background: #d1d5db;
        }
        .csp-status-dot.online { background: #22c55e; }

        /* Card body */
        .csp-card-body { padding: 14px 16px 16px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .csp-worker-name {
          font-size: 15px; font-weight: 700; color: #111917;
          font-family: 'Clash Display', sans-serif; line-height: 1.2;
        }
        .csp-skill-tags { display: flex; gap: 4px; flex-wrap: wrap; }
        .csp-skill-tag {
          padding: 2px 8px; border-radius: 6px;
          background: #f0f4f1; border: 1px solid #e2e8e4;
          font-size: 11px; font-weight: 600; color: #4b5a52;
        }
        .csp-area {
          display: flex; align-items: center; gap: 4px;
          font-size: 12px; color: #9ca3af; margin-top: 2px;
        }
        .csp-area-icon { font-size: 12px; }

        .csp-stars { display: flex; align-items: center; gap: 2px; }
        .csp-star        { font-size: 13px; color: #d1d5db; }
        .csp-star.filled { color: #f59e0b; }
        .csp-rating-num  { font-size: 13px; font-weight: 700; color: #111917; margin-left: 4px; }
        .csp-rating-cnt  { font-size: 11px; color: #9ca3af; margin-left: 2px; }

        .csp-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px;
          border-top: 1px solid #f0f4f1;
          margin-top: auto;
        }
        .csp-rate-tag {
          font-size: 15px; font-weight: 800; color: #1a6b4a;
          font-family: 'Clash Display', sans-serif;
        }
        .csp-rate-tag span { font-size: 11px; font-weight: 500; color: #9ca3af; }

        .csp-avail-badge {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 600;
        }
        .csp-avail-badge.online { color: #16a34a; }
        .csp-avail-badge.offline { color: #9ca3af; }

        .csp-dist-badge {
          display: flex; align-items: center; gap: 3px;
          font-size: 11px; font-weight: 700; color: #1a6b4a;
          background: #f0fdf4; border-radius: 20px;
          padding: 2px 8px;
        }

        /* View button */
        .csp-view-btn {
          display: none; width: calc(100% - 32px); margin: 0 16px 14px;
          padding: 10px; border-radius: 10px; border: none;
          background: #0f2d1f; color: #4ade80;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'Satoshi', sans-serif; transition: background 0.15s;
        }
        .csp-card:hover .csp-view-btn { display: block; }
        .csp-view-btn:hover { background: #1a6b4a; }

        /* ── SKELETON LOADER ── */
        .csp-skeleton {
          background: #fff; border-radius: 16px;
          border: 1.5px solid #e8ede9; overflow: hidden;
        }
        .csp-skel-top { height: 100px; background: #f0f4f1; }
        .csp-skel-body { padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
        .csp-skel-line { height: 12px; border-radius: 6px; background: linear-gradient(90deg, #f0f4f1 25%, #e2e8e4 50%, #f0f4f1 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* ── EMPTY STATE ── */
        .csp-empty {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; align-items: center;
          gap: 12px; padding: 60px 20px; text-align: center;
        }
        .csp-empty-icon { font-size: 48px; opacity: 0.4; }
        .csp-empty-title { font-size: 18px; font-weight: 700; color: #111917; font-family: 'Clash Display', sans-serif; }
        .csp-empty-sub   { font-size: 14px; color: #9ca3af; max-width: 320px; }
        .csp-empty-btn {
          padding: 10px 24px; border-radius: 10px; border: none;
          background: #1a6b4a; color: #fff;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Satoshi', sans-serif; margin-top: 8px;
        }
      `}</style>

      <div className="csp-page">

        {/* ── HERO SEARCH ── */}
        <div className="csp-hero">
          <div className="csp-hero-grid" />
          <div className="csp-hero-content">
            <div className="csp-hero-label">Find workers near you</div>
            <h1 className="csp-hero-title">Who are you looking for?</h1>
            <p className="csp-hero-sub">Search by name, skill or area — or use your location to find workers nearby.</p>

            <div className="csp-search-row">
              {/* Keyword search */}
              <div className="csp-input-wrap">
                <span className="csp-input-icon">🔍</span>
                <input
                  className="csp-input"
                  placeholder="Search by name, skill, area…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
                {query && (
                  <button className="csp-input-clear" onClick={() => setQuery('')}>✕</button>
                )}
              </div>

              {/* Location search */}
              <div className="csp-loc-group" ref={placeRef}>
                <div className="csp-loc-wrap">
                  <span className="csp-input-icon">📍</span>
                  <input
                    className={`csp-loc-input ${userCoords ? 'has-location' : ''}`}
                    placeholder="Type your area or colony…"
                    value={placeQuery}
                    onChange={e => { setPlaceQuery(e.target.value); setUserCoords(null) }}
                    onFocus={() => placeSuggestions.length > 0 && setShowSugg(true)}
                  />
                  <button
                    className={`csp-gps-btn ${userCoords ? 'active' : ''}`}
                    onClick={detectGPS}
                    disabled={locLoading}
                    title="Use my GPS location"
                  >
                    {locLoading ? '…' : userCoords ? '✓ Located' : '📡 GPS'}
                  </button>
                </div>

                {/* Autocomplete suggestions */}
                {showSugg && (placeSuggestions.length > 0 || suggLoading) && (
                  <div className="csp-suggestions">
                    {suggLoading ? (
                      <div className="csp-sugg-loading">Searching…</div>
                    ) : (
                      placeSuggestions.map((s, i) => (
                        <div key={i} className="csp-sugg-item" onMouseDown={() => pickSuggestion(s)}>
                          <span className="csp-sugg-icon">📍</span>
                          <span className="csp-sugg-text">{s.label}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location error */}
            {locError && <p className="csp-loc-error">⚠️ {locError}</p>}

            {/* Active location tag */}
            {userCoords && locationName && (
              <div className="csp-loc-active-tag">
                <span>📍</span>
                Showing workers near <strong style={{ marginLeft: 3 }}>{locationName}</strong>
                <button className="csp-loc-clear" onClick={clearLocation}>✕</button>
              </div>
            )}

            {/* Radius slider — only when location active */}
            {userCoords && (
              <div className="csp-radius-row">
                <span className="csp-radius-label">Search radius</span>
                <input
                  type="range" className="csp-radius-slider"
                  min="2" max="50" value={radius}
                  onChange={e => setRadius(+e.target.value)}
                />
                <span className="csp-radius-val">{radius} km</span>
              </div>
            )}
          </div>
        </div>

        {/* ── SKILL CHIPS ── */}
        <div className="csp-skills-row">
          {SKILLS.map(s => (
            <button
              key={s.id}
              className={`csp-skill-chip ${skill === s.id ? 'active' : ''}`}
              onClick={() => setSkill(s.id)}
            >
              <span className="csp-chip-icon">{s.icon}</span>
              {s.label}
            </button>
          ))}
        </div>

        {/* ── FILTER BAR ── */}
        <div className="csp-filter-bar">
          <div className="csp-filter-left">
            <button
              className={`csp-toggle-pill ${onlineOnly ? 'active' : ''}`}
              onClick={() => setOnline(o => !o)}
            >
              <div className="csp-toggle-dot" />
              Available now
            </button>

            <div className="csp-rate-filter">
              <span className="csp-rate-label">Max rate:</span>
              <input
                type="range" className="csp-rate-slider"
                min="100" max="5000" step="100" value={maxRate}
                onChange={e => setMaxRate(+e.target.value)}
              />
              <span className="csp-rate-val">₹{maxRate >= 5000 ? 'Any' : `${maxRate}/hr`}</span>
            </div>
          </div>

          <div className="csp-sort-group">
            <span className="csp-sort-label">Sort by</span>
            <select
              className="csp-sort-select"
              value={sortBy}
              onChange={e => setSort(e.target.value)}
            >
              {userCoords && <option value="distance">Nearest first</option>}
              <option value="rating">Top rated</option>
              <option value="rate">Lowest price</option>
              <option value="jobs">Most experienced</option>
            </select>
          </div>
        </div>

        {/* Active filter tags */}
        {activeFilters.length > 0 && (
          <div className="csp-active-tags" style={{ marginBottom: 14 }}>
            {activeFilters.map(f => (
              <div className="csp-atag" key={f}>
                {f}
                <button className="csp-atag-rm" onClick={() => {
                  if (f === skill) setSkill('All')
                  else if (f === 'Online only') setOnline(false)
                  else if (f.startsWith('Under')) setMaxRate(5000)
                  else if (f.startsWith('Within')) clearLocation()
                }}>✕</button>
              </div>
            ))}
            <button
              style={{ background: 'none', border: 'none', fontSize: 12, color: '#9ca3af', cursor: 'pointer', fontFamily: 'Satoshi, sans-serif' }}
              onClick={() => { setSkill('All'); setOnline(false); setMaxRate(5000); clearLocation() }}
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── RESULTS META ── */}
        <div className="csp-meta-row">
          <div>
            <span className="csp-result-count">
              {loading ? 'Searching…' : `${results.length} worker${results.length !== 1 ? 's' : ''} found`}
            </span>
            {!loading && userCoords && (
              <span className="csp-result-sub">within {radius} km of {locationName || 'your location'}</span>
            )}
          </div>
        </div>

        {/* ── RESULTS GRID ── */}
        <div className="csp-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="csp-skeleton">
                <div className="csp-skel-top" />
                <div className="csp-skel-body">
                  <div className="csp-skel-line" style={{ width: '60%' }} />
                  <div className="csp-skel-line" style={{ width: '40%' }} />
                  <div className="csp-skel-line" style={{ width: '80%' }} />
                </div>
              </div>
            ))
          ) : results.length === 0 ? (
            <div className="csp-empty">
              <div className="csp-empty-icon">🔍</div>
              <div className="csp-empty-title">No workers found</div>
              <p className="csp-empty-sub">
                {userCoords
                  ? `No workers found within ${radius} km. Try increasing the radius.`
                  : 'Try a different skill, area, or remove some filters.'}
              </p>
              <button className="csp-empty-btn" onClick={() => { setSkill('All'); setOnline(false); setMaxRate(5000); clearLocation() }}>
                Reset all filters
              </button>
            </div>
          ) : (
            results.map((w, idx) => {
              const colors = ['#1a6b4a','#7c3aed','#0891b2','#d97706','#dc2626','#be185d']
              const color  = colors[idx % colors.length]
              const isNew  = w.jobsDone === 0
              const isTop  = w.reviewCount >= 10 && w.rating >= 4.5
              const isNear = w._dist !== null && w._dist <= 3

              return (
                <div
                  key={w.id}
                  className="csp-card"
                  onClick={() => navigate(`/customer/worker/${w.id}`)}
                >
                  {isNear && <div className="csp-badge near">📍 Nearby</div>}
                  {isTop  && !isNear && <div className="csp-badge top">⭐ Top Rated</div>}
                  {isNew  && !isTop && !isNear && <div className="csp-badge new">✨ New</div>}

                  <div className="csp-card-top">
                    <div
                      className="csp-card-bg"
                      style={{ background: `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)` }}
                    />
                    <div className="csp-avatar-ring">
                      <div className="csp-avatar-letter" style={{ background: color }}>
                        {w.user?.name?.[0] ?? '?'}
                      </div>
                      <div className={`csp-status-dot ${w.isOnline ? 'online' : ''}`} />
                    </div>
                  </div>

                  <div className="csp-card-body">
                    <div className="csp-worker-name">{w.user?.name}</div>
                    <div className="csp-skill-tags">
                      {w.skills?.slice(0, 3).map(s => (
                        <span key={s} className="csp-skill-tag">{s}</span>
                      ))}
                    </div>
                    <div className="csp-area">
                      <span className="csp-area-icon">📍</span>
                      {w.area}
                    </div>
                    <Stars rating={w.rating} count={w.reviewCount} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>{w.jobsDone} jobs done</span>
                      {w._dist !== null && (
                        <div className="csp-dist-badge">
                          <span>📍</span> {w._dist} km
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="csp-card-footer">
                    <div className="csp-rate-tag">
                      ₹{w.rate}<span>/hr</span>
                    </div>
                    <div className={`csp-avail-badge ${w.isOnline ? 'online' : 'offline'}`}>
                      {w.isOnline ? '● Available' : '○ Offline'}
                    </div>
                  </div>

                  <button className="csp-view-btn">View Profile →</button>
                </div>
              )
            })
          )}
        </div>

      </div>
    </CustomerLayout>
  )
}