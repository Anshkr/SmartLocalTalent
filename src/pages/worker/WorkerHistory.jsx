import { useState, useEffect } from 'react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI } from '../../lib/api'

export default function WorkerHistory() {
  const [jobs, setJobs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setJobs(data.filter((r) => r.status === 'COMPLETED')))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalEarned = jobs.reduce((a, j) => a + (j.budget || 0), 0)
  const avgRating   = jobs.length
    ? (jobs.reduce((a, j) => a + (j.review?.rating || 0), 0) / jobs.filter(j => j.review).length || 0)
    : 0

  return (
    <WorkerLayout>
      <div className="wh-page">
        <div className="wh-header">
          <h1 className="wh-title">Earnings & history</h1>
          <p className="wh-sub">Your completed jobs and reviews</p>
        </div>

        {/* Summary */}
        <div className="wh-summary">
          <div className="wh-sum-card green">
            <div className="wh-sum-label">Total earned</div>
            <div className="wh-sum-value">₹{totalEarned.toLocaleString()}</div>
            <div className="wh-sum-note">{jobs.length} jobs completed</div>
          </div>
          <div className="wh-sum-card amber">
            <div className="wh-sum-label">Avg rating</div>
            <div className="wh-sum-value">{avgRating > 0 ? avgRating.toFixed(1) + ' ⭐' : '—'}</div>
            <div className="wh-sum-note">From {jobs.filter(j => j.review).length} reviews</div>
          </div>
          <div className="wh-sum-card purple">
            <div className="wh-sum-label">All time jobs</div>
            <div className="wh-sum-value">{jobs.length}</div>
            <div className="wh-sum-note">Since joining</div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Loading history…</div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📁</div>
            <p>No completed jobs yet. Accept requests to build your history!</p>
          </div>
        ) : (
          <div className="wh-list">
            {jobs.map((job) => (
              <div className="wh-job-card" key={job.id}>
                <div className="wh-job-top">
                  <div className="wh-job-avatar">{job.customer?.name?.[0] ?? '?'}</div>
                  <div className="wh-job-info">
                    <div className="wh-job-customer">{job.customer?.name}</div>
                    <div className="wh-job-name">{job.title}</div>
                    <div className="wh-job-date">
                      📅 {new Date(job.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="wh-job-right">
                    <div className="wh-job-earned">{job.budget ? `+₹${job.budget}` : '—'}</div>
                    {job.review && (
                      <div className="wh-stars">
                        {'★'.repeat(job.review.rating)}{'☆'.repeat(5 - job.review.rating)}
                      </div>
                    )}
                  </div>
                </div>
                {job.review?.text && (
                  <div className="wh-review">
                    <span className="wh-review-icon">💬</span>
                    <em>"{job.review.text}"</em>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkerLayout>
  )
}