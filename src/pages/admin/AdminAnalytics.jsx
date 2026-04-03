import { useState, useEffect, useRef } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminStatsAPI, getAdminJobsAPI, getAdminWorkersAPI } from '../../lib/api'

function BarChart({ data, color = '#4f6ef7' }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="ac-bar-chart">
      {data.map((d) => (
        <div key={d.label} className="ac-bar-col">
          <div className="ac-bar-val">
            {d.value >= 1000 ? (d.value / 1000).toFixed(1) + 'k' : d.value}
          </div>
          <div className="ac-bar-outer">
            <div
              className="ac-bar-inner"
              style={{ height: Math.max((d.value / max) * 100, 2) + '%', background: color }}
            />
          </div>
          <div className="ac-bar-label">{d.label}</div>
        </div>
      ))}
    </div>
  )
}

function DonutChart({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0)
  const COLORS = ['#4f6ef7','#1a6b4a','#f59e0b','#7c3aed','#ef4444']
  let angle = -Math.PI / 2
  const cx = 60, cy = 60, r = 50

  return (
    <div className="ac-donut-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        {data.map((d, i) => {
          if (total === 0) return null
          const sweep = (d.value / total) * Math.PI * 2
          const x1 = cx + r * Math.cos(angle)
          const y1 = cy + r * Math.sin(angle)
          angle += sweep
          const x2 = cx + r * Math.cos(angle)
          const y2 = cy + r * Math.sin(angle)
          const large = sweep > Math.PI ? 1 : 0
          return (
            <path key={i}
              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`}
              fill={COLORS[i % COLORS.length]}
              stroke="#fff" strokeWidth="2"
            />
          )
        })}
        <circle cx={cx} cy={cy} r={32} fill="white" />
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#888">total</text>
      </svg>
      <div className="ac-donut-legend">
        {data.map((d, i) => (
          <div key={d.label} className="ac-legend-item">
            <div className="ac-legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
            <span>{d.label}</span>
            <strong>{d.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminAnalytics() {
  const [stats, setStats]     = useState(null)
  const [jobs, setJobs]       = useState([])
  const [workers, setWorkers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStatsAPI(), getAdminJobsAPI(), getAdminWorkersAPI()])
      .then(([s, j, w]) => {
        setStats(s.data)
        setJobs(j.data)
        setWorkers(w.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Build monthly jobs chart data
  const monthlyJobs = (() => {
    const map = {}
    jobs.forEach((j) => {
      const key = new Date(j.createdAt).toLocaleDateString('en-IN', { month: 'short' })
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).slice(-6).map(([label, value]) => ({ label, value }))
  })()

  // Build monthly revenue chart
  const monthlyRevenue = (() => {
    const map = {}
    jobs.filter(j => j.status === 'COMPLETED').forEach((j) => {
      const key = new Date(j.createdAt).toLocaleDateString('en-IN', { month: 'short' })
      map[key] = (map[key] || 0) + Math.round((j.budget || 0) * 0.1)
    })
    return Object.entries(map).slice(-6).map(([label, value]) => ({ label, value }))
  })()

  // Job status breakdown
  const statusBreakdown = [
    { label: 'Completed',   value: jobs.filter(j => j.status === 'COMPLETED').length },
    { label: 'Active',      value: jobs.filter(j => j.status === 'ACCEPTED' || j.status === 'IN_PROGRESS').length },
    { label: 'Pending',     value: jobs.filter(j => j.status === 'PENDING').length },
    { label: 'Cancelled',   value: jobs.filter(j => j.status === 'CANCELLED').length },
  ].filter(d => d.value > 0)

  // Worker skill breakdown
  const skillBreakdown = (() => {
    const map = {}
    workers.forEach((w) => w.skills?.forEach((s) => { map[s] = (map[s] || 0) + 1 }))
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([label, value]) => ({ label, value }))
  })()

  // Top workers by jobs
  const topWorkers = [...workers]
    .sort((a, b) => b.jobsDone - a.jobsDone)
    .slice(0, 5)

  return (
    <AdminLayout>
      <div className="ac-page">
        <div className="ac-header">
          <h1 className="ac-title">Analytics</h1>
          <p className="ac-sub">Real-time platform performance data</p>
        </div>

        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading analytics…</div>
        ) : (
          <>
            {/* KPI row */}
            <div className="ac-kpis">
              {[
                { label: 'Total revenue',   value: `₹${((stats?.platformRevenue || 0)).toLocaleString()}`, icon: '💰', color: '#1a6b4a' },
                { label: 'Completion rate', value: stats?.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) + '%' : '0%', icon: '📈', color: '#4f6ef7' },
                { label: 'Active workers',  value: workers.filter(w => w.status === 'ACTIVE').length, icon: '👷', color: '#f59e0b' },
                { label: 'Avg rating',      value: workers.length ? (workers.reduce((a, w) => a + (w.rating || 0), 0) / workers.length).toFixed(1) + '⭐' : '—', icon: '⭐', color: '#7c3aed' },
              ].map((k) => (
                <div key={k.label} className="ac-kpi-card">
                  <div className="ac-kpi-icon" style={{ color: k.color }}>{k.icon}</div>
                  <div className="ac-kpi-value" style={{ color: k.color }}>{k.value}</div>
                  <div className="ac-kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="ac-charts-grid">
              <div className="ac-chart-card">
                <div className="ac-chart-title">Jobs per month</div>
                {monthlyJobs.length > 0 ? <BarChart data={monthlyJobs} color="#4f6ef7" /> : <div className="ac-no-data">No data yet</div>}
              </div>

              <div className="ac-chart-card">
                <div className="ac-chart-title">Revenue per month (10% commission)</div>
                {monthlyRevenue.length > 0 ? <BarChart data={monthlyRevenue} color="#1a6b4a" /> : <div className="ac-no-data">No data yet</div>}
              </div>

              <div className="ac-chart-card">
                <div className="ac-chart-title">Job status breakdown</div>
                {statusBreakdown.length > 0 ? <DonutChart data={statusBreakdown} /> : <div className="ac-no-data">No jobs yet</div>}
              </div>

              <div className="ac-chart-card">
                <div className="ac-chart-title">Workers by skill</div>
                {skillBreakdown.length > 0 ? <DonutChart data={skillBreakdown} /> : <div className="ac-no-data">No workers yet</div>}
              </div>
            </div>

            {/* Top workers table */}
            <div className="ac-table-card">
              <div className="ac-table-title">Top workers by jobs completed</div>
              <table className="ac-table">
                <thead>
                  <tr><th>Worker</th><th>Skills</th><th>Area</th><th>Jobs done</th><th>Rating</th><th>Earnings</th></tr>
                </thead>
                <tbody>
                  {topWorkers.map((w) => (
                    <tr key={w.id}>
                      <td><strong>{w.user?.name}</strong></td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{w.skills?.slice(0,2).join(', ')}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{w.area}</td>
                      <td><strong>{w.jobsDone}</strong></td>
                      <td>{w.rating > 0 ? `⭐ ${w.rating.toFixed(1)}` : '—'}</td>
                      <td style={{ color: '#1a6b4a', fontWeight: 700 }}>₹{(w.totalEarned || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {topWorkers.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: '#9ca3af', padding: 24 }}>No workers yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}