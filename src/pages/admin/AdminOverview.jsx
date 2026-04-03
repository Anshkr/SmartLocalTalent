import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminStatsAPI, getAdminJobsAPI } from '../../lib/api'

const STATUS_COLOR = {
  COMPLETED:   { bg: '#dcfce7', text: '#166534' },
  ACCEPTED:    { bg: '#dbeafe', text: '#1e40af' },
  IN_PROGRESS: { bg: '#dbeafe', text: '#1e40af' },
  PENDING:     { bg: '#fef3c7', text: '#92400e' },
  CANCELLED:   { bg: '#fee2e2', text: '#991b1b' },
}

export default function AdminOverview() {
  const navigate = useNavigate()
  const [stats, setStats]     = useState(null)
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    Promise.all([getAdminStatsAPI(), getAdminJobsAPI()])
      .then(([s, j]) => { setStats(s.data); setJobs(j.data.slice(0, 8)) })
      .catch(() => setError('Failed to load data. Check your backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const isEmpty = stats && stats.totalWorkers === 0 && stats.totalCustomers === 0 && stats.totalJobs === 0

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <p>Loading dashboard…</p>
      </div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <div style={{ padding: 40, background: '#fee2e2', borderRadius: 12, color: '#991b1b', fontSize: 14 }}>
        ⚠️ {error}
      </div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="ao-page">

        <div className="ao-header">
          <div>
            <h1 className="ao-title">Platform overview</h1>
            <p className="ao-sub">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>

          {/* Alert banners — only show if there's something to alert */}
          {stats && (stats.openDisputes > 0 || stats.pendingWorkers > 0) && (
            <div className="ao-alerts">
              {stats.pendingWorkers > 0 && (
                <div className="ao-alert amber" onClick={() => navigate('/admin/workers')}>
                  ⚠️ {stats.pendingWorkers} worker{stats.pendingWorkers > 1 ? 's' : ''} awaiting approval
                </div>
              )}
              {stats.openDisputes > 0 && (
                <div className="ao-alert red" onClick={() => navigate('/admin/disputes')}>
                  🚨 {stats.openDisputes} open dispute{stats.openDisputes > 1 ? 's' : ''}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty state — brand new platform */}
        {isEmpty && (
          <div className="ao-empty-state">
            <div className="ao-empty-icon">🚀</div>
            <h2 className="ao-empty-title">Platform is ready!</h2>
            <p className="ao-empty-sub">No users or jobs yet. Share your platform link to get started.</p>
            <div className="ao-empty-actions">
              <button className="ao-empty-btn" onClick={() => navigate('/admin/workers')}>View workers</button>
              <button className="ao-empty-btn outline" onClick={() => navigate('/admin/settings')}>Settings</button>
            </div>
          </div>
        )}

        {/* KPI cards — always show even if 0 */}
        {!isEmpty && stats && (
          <>
            <div className="ao-kpis">
              {[
                { label: 'Total workers',    value: stats.totalWorkers,   change: stats.pendingWorkers > 0 ? `${stats.pendingWorkers} pending approval` : 'All approved', color: '#4f6ef7', bg: '#eef1fe', icon: '👷' },
                { label: 'Total customers',  value: stats.totalCustomers, change: 'Registered users',   color: '#1a6b4a', bg: '#e6f4ee', icon: '👤' },
                { label: 'Jobs completed',   value: stats.completedJobs,  change: `${stats.totalJobs} total jobs`, color: '#f59e0b', bg: '#fffbeb', icon: '✅' },
                { label: 'Platform revenue', value: `₹${(stats.platformRevenue || 0).toLocaleString()}`, change: '10% commission', color: '#7c3aed', bg: '#f5f3ff', icon: '💰' },
              ].map(k => (
                <div className="ao-kpi-card" key={k.label} style={{ '--kcolor': k.color, '--kbg': k.bg }}>
                  <div className="ao-kpi-icon">{k.icon}</div>
                  <div className="ao-kpi-value">{k.value}</div>
                  <div className="ao-kpi-label">{k.label}</div>
                  <div className="ao-kpi-change">{k.change}</div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="ao-quick-row">
              <div className="ao-quick-card" onClick={() => navigate('/admin/workers')}>
                <div className="ao-quick-num" style={{ color: '#1a6b4a' }}>{stats.totalWorkers - (stats.pendingWorkers || 0)}</div>
                <div className="ao-quick-label">Active workers</div>
              </div>
              <div className="ao-quick-card" onClick={() => navigate('/admin/workers')}>
                <div className="ao-quick-num" style={{ color: '#f59e0b' }}>{stats.pendingWorkers || 0}</div>
                <div className="ao-quick-label">Pending approval</div>
              </div>
              <div className="ao-quick-card" onClick={() => navigate('/admin/disputes')}>
                <div className="ao-quick-num" style={{ color: '#ef4444' }}>{stats.openDisputes || 0}</div>
                <div className="ao-quick-label">Open disputes</div>
              </div>
              <div className="ao-quick-card">
                <div className="ao-quick-num" style={{ color: '#4f6ef7' }}>
                  {stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0}%
                </div>
                <div className="ao-quick-label">Completion rate</div>
              </div>
            </div>

            {/* Recent jobs — only if there are jobs */}
            {jobs.length > 0 && (
              <div className="ao-section-card">
                <div className="ao-section-header">
                  <h2 className="ao-section-title">Recent jobs</h2>
                  <button className="ao-see-all" onClick={() => navigate('/admin/jobs')}>See all →</button>
                </div>
                <div className="ao-table-wrap">
                  <table className="ao-table">
                    <thead>
                      <tr><th>Customer</th><th>Worker</th><th>Job</th><th>Date</th><th>Amount</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      {jobs.map(job => {
                        const sc = STATUS_COLOR[job.status] || STATUS_COLOR.PENDING
                        return (
                          <tr key={job.id}>
                            <td>{job.customer?.name}</td>
                            <td>{job.worker?.user?.name}</td>
                            <td className="ao-job-name">{job.title}</td>
                            <td className="ao-muted">{new Date(job.createdAt).toLocaleDateString('en-IN')}</td>
                            <td className="ao-amount">{job.budget ? `₹${job.budget}` : '—'}</td>
                            <td><span className="ao-status-pill" style={{ background: sc.bg, color: sc.text }}>{job.status}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {jobs.length === 0 && (
              <div className="ao-section-card">
                <div className="ao-section-header">
                  <h2 className="ao-section-title">Recent jobs</h2>
                </div>
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📋</div>
                  <p style={{ fontSize: 13 }}>No jobs yet. They will appear here once customers start sending requests.</p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </AdminLayout>
  )
}