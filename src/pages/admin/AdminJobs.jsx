import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { MOCK_JOBS } from '../../lib/mockAdmin'

const STATUS_META = {
  completed: { bg: '#dcfce7', color: '#166534' },
  active:    { bg: '#dbeafe', color: '#1e40af' },
  pending:   { bg: '#fef3c7', color: '#92400e' },
  cancelled: { bg: '#fee2e2', color: '#991b1b' },
}

export default function AdminJobs() {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = MOCK_JOBS.filter(j => {
    const matchFilter = filter === 'all' || j.status === filter
    const matchSearch = !search ||
      j.customer.toLowerCase().includes(search.toLowerCase()) ||
      j.worker.toLowerCase().includes(search.toLowerCase()) ||
      j.job.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const total    = MOCK_JOBS.reduce((a, j) => a + (j.amount || 0), 0)
  const counts   = { all: MOCK_JOBS.length }
  ;['completed','active','pending','cancelled'].forEach(s => {
    counts[s] = MOCK_JOBS.filter(j => j.status === s).length
  })

  return (
    <AdminLayout>
      <div className="aj-page">

        <div className="aj-header">
          <div>
            <h1 className="aj-title">All jobs</h1>
            <p className="aj-sub">Total platform transactions: ₹{total.toLocaleString()}</p>
          </div>
          <input
            className="aj-search"
            placeholder="Search jobs…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="aj-tabs">
          {Object.entries(counts).map(([tab, count]) => (
            <button
              key={tab}
              className={`aj-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="aj-count">{count}</span>
            </button>
          ))}
        </div>

        <div className="aj-table-wrap">
          <table className="aj-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Worker</th>
                <th>Job</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(job => {
                const sc = STATUS_META[job.status]
                return (
                  <tr key={job.id}>
                    <td className="aj-id">#{job.id}</td>
                    <td>{job.customer}</td>
                    <td>{job.worker}</td>
                    <td className="aj-job-name">{job.job}</td>
                    <td className="aj-muted">{job.date}</td>
                    <td className="aj-amount">{job.amount ? '₹'+job.amount : '—'}</td>
                    <td className="aj-rating">{job.rating ? '⭐'.repeat(job.rating) : '—'}</td>
                    <td>
                      <span className="aj-status-pill" style={{ background: sc.bg, color: sc.color }}>
                        {job.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="aj-empty">No jobs found.</div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}