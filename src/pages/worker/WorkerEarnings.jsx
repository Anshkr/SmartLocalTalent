import { useState, useEffect } from 'react'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI, getWithdrawalsAPI, requestWithdrawalAPI } from '../../lib/api'
import useAuthStore from '../../store/authStore'

const WITHDRAW_METHODS = [
  { id: 'upi',   label: 'UPI',          icon: '📱', placeholder: 'yourname@upi' },
  { id: 'bank',  label: 'Bank Transfer', icon: '🏦', placeholder: 'ACCOUNT_NUMBER IFSC_CODE' },
  { id: 'paytm', label: 'Paytm Wallet', icon: '👛', placeholder: '10-digit mobile number' },
]

function StatCard({ icon, value, label, color, bg }) {
  return (
    <div className="we-kpi" style={{ background: bg, borderColor: color + '44' }}>
      <div className="we-kpi-icon">{icon}</div>
      <div className="we-kpi-value" style={{ color }}>{value}</div>
      <div className="we-kpi-label">{label}</div>
    </div>
  )
}

export default function WorkerEarnings() {
  const { user }   = useAuthStore()
  const profile    = user?.workerProfile

  const [jobs, setJobs]               = useState([])
  const [withdrawals, setWithdrawals] = useState([])
  const [loading, setLoading]         = useState(true)
  const [period, setPeriod]           = useState('all')
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [wMethod, setWMethod]         = useState('upi')
  const [wAmount, setWAmount]         = useState('')
  const [wAccount, setWAccount]       = useState('')
  const [wLoading, setWLoading]       = useState(false)
  const [wError, setWError]           = useState('')
  const [wSuccess, setWSuccess]       = useState('')

  useEffect(() => {
    Promise.all([getMyRequestsAPI(), getWithdrawalsAPI()])
      .then(([j, w]) => {
        setJobs(j.data.filter(x => x.status === 'COMPLETED'))
        setWithdrawals(w.data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Period filter
  const now = new Date()
  const filtered = jobs.filter(j => {
    const d = new Date(j.updatedAt)
    if (period === 'week')  return (now - d) < 7  * 86400000
    if (period === 'month') return (now - d) < 30 * 86400000
    return true
  })

  const totalEarned   = profile?.totalEarned    || 0
  const withdrawn     = profile?.withdrawnAmount || 0
  const available     = totalEarned - withdrawn
  const pendingJobs   = 0 // from active jobs
  const periodEarned  = filtered.reduce((a, j) => a + (j.budget || 0), 0)
  const periodJobs    = filtered.length
  const avgRating     = profile?.rating > 0 ? profile.rating.toFixed(1) : '—'

  // Monthly chart data
  const byMonth = {}
  jobs.forEach(j => {
    const key = new Date(j.updatedAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    byMonth[key] = (byMonth[key] || 0) + (j.budget || 0)
  })
  const monthData = Object.entries(byMonth).slice(-6)
  const maxMonth  = Math.max(...monthData.map(([, v]) => v), 1)

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setWError('')
    setWSuccess('')

    const amt = parseInt(wAmount)
    if (!amt || amt < 100) return setWError('Minimum withdrawal is ₹100')
    if (amt > available)   return setWError(`Max available is ₹${available}`)
    if (!wAccount.trim())  return setWError('Please enter your account details')

    setWLoading(true)
    try {
      await requestWithdrawalAPI({
        amount:         amt,
        method:         wMethod,
        accountDetails: wAccount.trim(),
      })
      setWSuccess(`Withdrawal request of ₹${amt} submitted! Admin will process within 24 hrs.`)
      setWAmount('')
      setWAccount('')
      // Refresh withdrawals
      const { data } = await getWithdrawalsAPI()
      setWithdrawals(data)
      setTimeout(() => { setShowWithdraw(false); setWSuccess('') }, 3000)
    } catch (err) {
      setWError(err.response?.data?.error || 'Failed to submit. Please try again.')
    } finally {
      setWLoading(false)
    }
  }

  const STATUS_COLOR = {
    PENDING:  { bg: '#fef3c7', color: '#92400e', label: 'Pending'  },
    APPROVED: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
    REJECTED: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  }

  return (
    <WorkerLayout>
      <div className="we-page">

        {/* Header */}
        <div className="we-header">
          <div>
            <h1 className="we-title">Earnings & Payments</h1>
            <p className="we-sub">Track your income and withdraw your earnings</p>
          </div>
          <div className="we-period-tabs">
            {[['week','This week'],['month','This month'],['all','All time']].map(([v, l]) => (
              <button key={v} className={`we-period-tab ${period === v ? 'active' : ''}`}
                onClick={() => setPeriod(v)}>{l}</button>
            ))}
          </div>
        </div>

        {/* Balance card - prominent */}
        <div className="wp-balance-card">
          <div className="wp-balance-left">
            <div className="wp-balance-label">Available balance</div>
            <div className="wp-balance-amount">₹{available.toLocaleString()}</div>
            <div className="wp-balance-sub">
              Total earned: ₹{totalEarned.toLocaleString()} · Withdrawn: ₹{withdrawn.toLocaleString()}
            </div>
          </div>
          <button
            className={`wp-withdraw-btn ${available < 100 ? 'disabled' : ''}`}
            onClick={() => available >= 100 && setShowWithdraw(true)}
            disabled={available < 100}
          >
            {available < 100 ? 'Min ₹100 to withdraw' : '💸 Withdraw'}
          </button>
        </div>

        {/* KPI stats */}
        <div className="we-kpis">
          <StatCard icon="💰" value={`₹${periodEarned.toLocaleString()}`} label="Earned this period" color="#1a6b4a" bg="#e6f4ee" />
          <StatCard icon="✅" value={periodJobs} label="Jobs completed" color="#4f6ef7" bg="#eef1fe" />
          <StatCard icon="⭐" value={avgRating}  label="Average rating"  color="#f59e0b" bg="#fffbeb" />
          <StatCard icon="💳" value={`₹${withdrawn.toLocaleString()}`} label="Total withdrawn" color="#7c3aed" bg="#f5f3ff" />
        </div>

        {/* Charts row */}
        {monthData.length > 0 && (
          <div className="we-charts-row">
            <div className="we-chart-card">
              <div className="we-chart-title">Monthly earnings</div>
              <div className="we-bar-chart">
                {monthData.map(([month, val]) => (
                  <div key={month} className="we-bar-col">
                    <div className="we-bar-val">
                      {val >= 1000 ? (val/1000).toFixed(1)+'k' : val > 0 ? val : ''}
                    </div>
                    <div className="we-bar-outer">
                      <div className="we-bar-inner" style={{ height: Math.max((val / maxMonth) * 100, 2) + '%' }} />
                    </div>
                    <div className="we-bar-label">{month}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="we-chart-card">
              <div className="we-chart-title">Earnings breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {[
                  { label: 'Total earned',   val: totalEarned,  color: '#1a6b4a' },
                  { label: 'Withdrawn',      val: withdrawn,    color: '#7c3aed' },
                  { label: 'Available',      val: available,    color: '#4f6ef7' },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#4b5a52' }}>
                      <span>{item.label}</span>
                      <strong style={{ color: item.color }}>₹{item.val.toLocaleString()}</strong>
                    </div>
                    <div style={{ height: 8, background: '#f0f4f1', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: totalEarned > 0 ? (item.val / totalEarned * 100) + '%' : '0%',
                        height: '100%', background: item.color, borderRadius: 4, transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Withdrawal history */}
        {withdrawals.length > 0 && (
          <div className="we-history-card">
            <div className="we-history-title">Withdrawal history</div>
            <div className="we-tx-list">
              {withdrawals.map(w => {
                const sc = STATUS_COLOR[w.status] || STATUS_COLOR.PENDING
                return (
                  <div key={w.id} className="we-tx-row">
                    <div className="we-tx-icon">
                      {w.method === 'upi' ? '📱' : w.method === 'bank' ? '🏦' : '👛'}
                    </div>
                    <div className="we-tx-info">
                      <div className="we-tx-name">Withdrawal via {w.method.toUpperCase()}</div>
                      <div className="we-tx-meta">
                        {w.accountDetails} · {new Date(w.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div className="we-tx-amount" style={{ color: w.status === 'APPROVED' ? '#1a6b4a' : '#9ca3af' }}>
                        {w.status === 'APPROVED' ? '-' : ''}₹{w.amount.toLocaleString()}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.color }}>
                        {sc.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Transaction history */}
        <div className="we-history-card">
          <div className="we-history-title">Job transactions</div>
          {loading ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💸</div>
              <p style={{ fontSize: 13 }}>No earnings yet. Complete jobs to see your income here.</p>
            </div>
          ) : (
            <div className="we-tx-list">
              {filtered.map(job => (
                <div key={job.id} className="we-tx-row">
                  <div className="we-tx-icon">✅</div>
                  <div className="we-tx-info">
                    <div className="we-tx-name">{job.title}</div>
                    <div className="we-tx-meta">
                      {job.customer?.name} · {new Date(job.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="we-tx-amount">+₹{job.budget || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Withdrawal modal */}
      {showWithdraw && (
        <div className="wdl-overlay" onClick={() => !wLoading && setShowWithdraw(false)}>
          <div className="wdl-modal" onClick={e => e.stopPropagation()}>
            <button className="wdl-close" onClick={() => !wLoading && setShowWithdraw(false)}>✕</button>

            <div className="wdl-header">
              <div className="wdl-title">Withdraw earnings</div>
              <div className="wdl-balance">
                Available: <strong>₹{available.toLocaleString()}</strong>
              </div>
            </div>

            {wSuccess ? (
              <div className="wdl-success">
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <p>{wSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="wdl-form">

                {/* Amount */}
                <div className="wdl-field">
                  <label>Amount to withdraw (₹)</label>
                  <div className="wdl-amount-row">
                    <input
                      type="number"
                      placeholder="Enter amount"
                      value={wAmount}
                      onChange={e => setWAmount(e.target.value)}
                      min="100"
                      max={available}
                      required
                    />
                    <button type="button" className="wdl-max-btn"
                      onClick={() => setWAmount(available.toString())}>
                      Max
                    </button>
                  </div>
                  <div className="wdl-hint">Min ₹100 · Max ₹{available.toLocaleString()}</div>
                </div>

                {/* Quick amounts */}
                <div className="wdl-quick-amounts">
                  {[500, 1000, 2000, 5000].filter(a => a <= available).map(a => (
                    <button key={a} type="button"
                      className={`wdl-quick-btn ${wAmount == a ? 'active' : ''}`}
                      onClick={() => setWAmount(a.toString())}>
                      ₹{a.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Method */}
                <div className="wdl-field">
                  <label>Payment method</label>
                  <div className="wdl-methods">
                    {WITHDRAW_METHODS.map(m => (
                      <button key={m.id} type="button"
                        className={`wdl-method-btn ${wMethod === m.id ? 'active' : ''}`}
                        onClick={() => { setWMethod(m.id); setWAccount('') }}>
                        <span>{m.icon}</span>
                        <span>{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Account details */}
                <div className="wdl-field">
                  <label>
                    {wMethod === 'upi'   ? 'UPI ID'   :
                     wMethod === 'bank'  ? 'Account number & IFSC' :
                     'Paytm mobile number'}
                  </label>
                  <input
                    placeholder={WITHDRAW_METHODS.find(m => m.id === wMethod)?.placeholder}
                    value={wAccount}
                    onChange={e => setWAccount(e.target.value)}
                    required
                  />
                </div>

                {wError && <div className="wdl-error">{wError}</div>}

                <button type="submit" className="wdl-submit" disabled={wLoading}>
                  {wLoading ? 'Submitting…' : `Request withdrawal of ₹${wAmount || '—'}`}
                </button>

                <p className="wdl-note">
                  ⏱ Withdrawals are processed within 24 hours by the admin.
                </p>
              </form>
            )}
          </div>
        </div>
      )}

    </WorkerLayout>
  )
}