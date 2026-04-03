import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { updateWithdrawalAPI } from '../../lib/api'
import API from '../../lib/api'

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')
  const [acting, setActing]           = useState(null)

  useEffect(() => {
    API.get('/admin/withdrawals')
      .then(({ data }) => setWithdrawals(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const act = async (id, status) => {
    setActing(id)
    try {
      await updateWithdrawalAPI(id, status)
      setWithdrawals(ws => ws.map(w => w.id === id ? { ...w, status } : w))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update')
    } finally {
      setActing(null)
    }
  }

  const filtered = withdrawals.filter(w =>
    filter === 'all' || w.status === filter.toUpperCase()
  )

  const pendingCount  = withdrawals.filter(w => w.status === 'PENDING').length
  const totalPending  = withdrawals.filter(w => w.status === 'PENDING').reduce((a, w) => a + w.amount, 0)
  const totalApproved = withdrawals.filter(w => w.status === 'APPROVED').reduce((a, w) => a + w.amount, 0)

  const STATUS_COLOR = {
    PENDING:  { bg: '#fef3c7', color: '#92400e', label: 'Pending'  },
    APPROVED: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  }

  return (
    <AdminLayout>
      <div className="adw-page">

        <div className="adw-header">
          <div>
            <h1 className="adw-title">Withdrawals</h1>
            <p className="adw-sub">
              {pendingCount > 0
                ? `${pendingCount} withdrawal${pendingCount > 1 ? 's' : ''} pending — ₹${totalPending.toLocaleString()} to process`
                : 'All withdrawals processed'}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="adw-summary">
          <div className="adw-sum-card amber">
            <div className="adw-sum-icon">⏳</div>
            <div className="adw-sum-val">{pendingCount}</div>
            <div className="adw-sum-label">Pending</div>
            <div className="adw-sum-amount">₹{totalPending.toLocaleString()}</div>
          </div>
          <div className="adw-sum-card green">
            <div className="adw-sum-icon">✅</div>
            <div className="adw-sum-val">{withdrawals.filter(w => w.status === 'APPROVED').length}</div>
            <div className="adw-sum-label">Approved</div>
            <div className="adw-sum-amount">₹{totalApproved.toLocaleString()}</div>
          </div>
          <div className="adw-sum-card red">
            <div className="adw-sum-icon">✕</div>
            <div className="adw-sum-val">{withdrawals.filter(w => w.status === 'REJECTED').length}</div>
            <div className="adw-sum-label">Rejected</div>
            <div className="adw-sum-amount">—</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="adw-tabs">
          {['all','pending','approved','rejected'].map(tab => (
            <button key={tab}
              className={`adw-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && pendingCount > 0 && (
                <span className="adw-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="adw-empty"><div style={{ fontSize: 28 }}>⏳</div><p>Loading withdrawals…</p></div>
        ) : filtered.length === 0 ? (
          <div className="adw-empty"><div style={{ fontSize: 28 }}>📭</div><p>No {filter === 'all' ? '' : filter} withdrawals.</p></div>
        ) : (
          <div className="adw-list">
            {filtered.map(w => {
              const sc = STATUS_COLOR[w.status] || STATUS_COLOR.PENDING
              const methodIcon = w.method === 'upi' ? '📱' : w.method === 'bank' ? '🏦' : '👛'
              return (
                <div key={w.id} className={`adw-card ${w.status.toLowerCase()}`}>
                  <div className="adw-card-left">
                    <div className="adw-method-icon">{methodIcon}</div>
                    <div className="adw-card-info">
                      <div className="adw-worker-name">{w.worker?.user?.name}</div>
                      <div className="adw-account">{w.method.toUpperCase()} · {w.accountDetails}</div>
                      <div className="adw-date">
                        📅 Requested {new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {w.processedAt && ` · Processed ${new Date(w.processedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                      </div>
                    </div>
                  </div>

                  <div className="adw-card-right">
                    <div className="adw-amount">₹{w.amount.toLocaleString()}</div>
                    <span className="adw-status-badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    {w.status === 'PENDING' && (
                      <div className="adw-actions">
                        <button
                          className="adw-btn approve"
                          disabled={acting === w.id}
                          onClick={() => act(w.id, 'APPROVED')}
                        >
                          {acting === w.id ? '…' : '✅ Approve'}
                        </button>
                        <button
                          className="adw-btn reject"
                          disabled={acting === w.id}
                          onClick={() => act(w.id, 'REJECTED')}
                        >
                          {acting === w.id ? '…' : '✕ Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}