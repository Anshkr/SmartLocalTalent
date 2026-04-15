import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/admin/AdminLayout'
import { getAdminStatsAPI, getAdminJobsAPI } from '../../lib/api'

const JOB_STATUS = {
  COMPLETED:   { bg:'#dcfce7', text:'#166534', label:'Completed'   },
  ACCEPTED:    { bg:'#dbeafe', text:'#1e40af', label:'Accepted'     },
  IN_PROGRESS: { bg:'#dbeafe', text:'#1e40af', label:'In Progress'  },
  PENDING:     { bg:'#fef3c7', text:'#92400e', label:'Pending'      },
  CANCELLED:   { bg:'#fee2e2', text:'#991b1b', label:'Cancelled'    },
}

export default function AdminOverview() {
  const navigate = useNavigate()
  const [stats,   setStats]   = useState(null)
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAdminStatsAPI(), getAdminJobsAPI()])
      .then(([s,j]) => { setStats(s.data); setJobs(j.data.slice(0,8)) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const KPI = stats ? [
    { label:'Total workers',    value:stats.totalWorkers,   color:'#4f6ef7', bg:'#eef1fe', icon:'👷', click:'/admin/workers'   },
    { label:'Total customers',  value:stats.totalCustomers, color:'#1a6b4a', bg:'#f0fdf4', icon:'👤', click:'/admin/customers' },
    { label:'Jobs completed',   value:stats.completedJobs,  color:'#f59e0b', bg:'#fffbeb', icon:'✅', click:'/admin/jobs'      },
    { label:'Platform revenue', value:`₹${(stats.platformRevenue||0).toLocaleString('en-IN')}`, color:'#7c3aed', bg:'#f5f3ff', icon:'💰', click:null },
  ] : []

  return (
    <AdminLayout>
      <div className="ao-page">

        <div className="ao-header">
          <div>
            <h1 className="ao-title">Platform overview</h1>
            <p className="ao-sub">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</p>
          </div>
          {stats && (
            <div className="ao-alerts">
              {stats.pendingWorkers > 0 && (
                <div className="ao-alert amber" onClick={() => navigate('/admin/workers')}>
                  ⚠️ {stats.pendingWorkers} worker{stats.pendingWorkers>1?'s':''} awaiting approval
                </div>
              )}
              {stats.openDisputes > 0 && (
                <div className="ao-alert red" onClick={() => navigate('/admin/disputes')}>
                  🚨 {stats.openDisputes} open dispute{stats.openDisputes>1?'s':''}
                </div>
              )}
              {stats.pendingWithdrawals > 0 && (
                <div className="ao-alert blue" onClick={() => navigate('/admin/withdrawals')} style={{ background:'#dbeafe', color:'#1e40af', borderColor:'#bfdbfe' }}>
                  💸 {stats.pendingWithdrawals} pending withdrawal{stats.pendingWithdrawals>1?'s':''}
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ padding:60, textAlign:'center', color:'#9ca3af' }}>Loading platform data…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="ao-kpis">
              {KPI.map(k => (
                <div key={k.label} className="ao-kpi-card"
                  style={{ cursor:k.click?'pointer':'default' }}
                  onClick={() => k.click && navigate(k.click)}>
                  <div className="ao-kpi-icon" style={{ background:k.bg, color:k.color }}>{k.icon}</div>
                  <div className="ao-kpi-value" style={{ color:k.color }}>{k.value}</div>
                  <div className="ao-kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Quick stats row */}
            <div className="ao-quick-row">
              {[
                { num:stats.totalWorkers-(stats.pendingWorkers||0), lbl:'Active workers',   color:'#1a6b4a', path:'/admin/workers'   },
                { num:stats.pendingWorkers||0,                      lbl:'Pending approval', color:'#f59e0b', path:'/admin/workers'   },
                { num:stats.openDisputes||0,                        lbl:'Open disputes',    color:'#ef4444', path:'/admin/disputes'  },
                { num:stats.totalJobs>0?Math.round((stats.completedJobs/stats.totalJobs)*100)+'%':'0%', lbl:'Completion rate', color:'#4f6ef7', path:null },
              ].map(q => (
                <div key={q.lbl} className="ao-quick-card"
                  style={{ cursor:q.path?'pointer':'default' }}
                  onClick={() => q.path && navigate(q.path)}>
                  <div className="ao-quick-num" style={{ color:q.color }}>{q.num}</div>
                  <div className="ao-quick-label">{q.lbl}</div>
                </div>
              ))}
            </div>

            {/* Recent jobs */}
            <div className="ao-section-card">
              <div className="ao-section-header">
                <h2 className="ao-section-title">Recent jobs</h2>
                <button className="ao-see-all" onClick={() => navigate('/admin/jobs')}>See all →</button>
              </div>
              <div className="ao-table-wrap">
                <table className="ao-table">
                  <thead>
                    <tr>
                      <th>Job</th>
                      <th>Customer</th>
                      <th>Worker</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => {
                      const sm = JOB_STATUS[job.status] || JOB_STATUS.PENDING
                      return (
                        <tr key={job.id}>
                          <td style={{ fontWeight:600 }}>{job.title}</td>
                          <td>{job.customer?.name}</td>
                          <td>{job.worker?.user?.name || '—'}</td>
                          <td>{job.budget ? `₹${job.budget.toLocaleString('en-IN')}` : '—'}</td>
                          <td>
                            <span style={{ background:sm.bg, color:sm.text, padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>
                              {sm.label}
                            </span>
                          </td>
                          <td style={{ color:'#9ca3af', fontSize:12 }}>
                            {new Date(job.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}