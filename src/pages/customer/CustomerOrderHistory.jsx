import { useState, useEffect, useRef } from 'react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'

function Receipt({ job, onClose }) {
  const ref = useRef()

  const print = () => {
    const content = ref.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Receipt - SmartTalent</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 500px; margin: 0 auto; }
        h2 { color: #1a6b4a; } hr { border: 1px solid #eee; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total { font-weight: bold; font-size: 16px; border-top: 2px solid #333; padding-top: 10px; }
        .badge { background: #dcfce7; color: #166534; padding: 4px 12px; border-radius: 20px; font-size: 12px; }
      </style></head>
      <body>${content}</body></html>
    `)
    win.document.close()
    win.print()
  }

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
        <button className="receipt-close" onClick={onClose}>✕</button>
        <div ref={ref}>
          <div className="receipt-header">
            <h2>SmartTalent</h2>
            <p style={{ color: '#6b7280', fontSize: 13 }}>Job Receipt</p>
          </div>
          <hr />
          <div className="receipt-rows">
            <div className="receipt-row"><span>Job</span><strong>{job.title}</strong></div>
            <div className="receipt-row"><span>Worker</span><strong>{job.worker?.user?.name}</strong></div>
            <div className="receipt-row"><span>Date</span><strong>{new Date(job.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
            <div className="receipt-row"><span>Address</span><strong>{job.address}</strong></div>
            <div className="receipt-row"><span>Urgency</span><strong>{job.urgency}</strong></div>
            <div className="receipt-row"><span>Status</span><strong><span className="receipt-badge">Completed</span></strong></div>
          </div>
          <hr />
          <div className="receipt-row receipt-total">
            <span>Amount paid</span>
            <strong>₹{job.budget || 'As agreed'}</strong>
          </div>
          {job.review && (
            <>
              <hr />
              <div className="receipt-row">
                <span>Your rating</span>
                <strong>{'★'.repeat(job.review.rating)}{'☆'.repeat(5 - job.review.rating)}</strong>
              </div>
            </>
          )}
        </div>
        <button className="receipt-print-btn" onClick={print}>🖨️ Print receipt</button>
      </div>
    </div>
  )
}

export default function CustomerOrderHistory() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = {
    COMPLETED:   { bg: '#dcfce7', color: '#166534', label: 'Completed' },
    ACCEPTED:    { bg: '#dbeafe', color: '#1e40af', label: 'Accepted'  },
    IN_PROGRESS: { bg: '#dbeafe', color: '#1e40af', label: 'In progress' },
    PENDING:     { bg: '#fef3c7', color: '#92400e', label: 'Pending'   },
    CANCELLED:   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
  }

  const filtered = orders.filter((o) => filter === 'all' || o.status === filter)
  const totalSpent = orders.filter((o) => o.status === 'COMPLETED').reduce((a, o) => a + (o.budget || 0), 0)
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length

  return (
    <CustomerLayout>
      <div className="coh-page">

        <div className="coh-header">
          <h1 className="coh-title">Order history</h1>
          <p className="coh-sub">All your job requests and receipts</p>
        </div>

        {/* Summary */}
        <div className="coh-summary">
          <div className="coh-sum-card">
            <div className="coh-sum-icon">📋</div>
            <div className="coh-sum-val">{orders.length}</div>
            <div className="coh-sum-label">Total requests</div>
          </div>
          <div className="coh-sum-card">
            <div className="coh-sum-icon">✅</div>
            <div className="coh-sum-val">{completedCount}</div>
            <div className="coh-sum-label">Completed</div>
          </div>
          <div className="coh-sum-card">
            <div className="coh-sum-icon">💰</div>
            <div className="coh-sum-val">₹{totalSpent.toLocaleString()}</div>
            <div className="coh-sum-label">Total spent</div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="coh-tabs">
          {['all','PENDING','ACCEPTED','COMPLETED','CANCELLED'].map((tab) => (
            <button key={tab}
              className={`coh-tab ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}>
              {tab === 'all' ? 'All' : STATUS_COLOR[tab]?.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="coh-empty"><div style={{ fontSize: 28 }}>⏳</div><p>Loading orders…</p></div>
        ) : filtered.length === 0 ? (
          <div className="coh-empty"><div style={{ fontSize: 28 }}>📭</div><p>No orders found.</p></div>
        ) : (
          <div className="coh-list">
            {filtered.map((order) => {
              const sc = STATUS_COLOR[order.status] || STATUS_COLOR.PENDING
              const workerName = order.worker?.user?.name ?? 'Worker'
              return (
                <div key={order.id} className="coh-card">
                  <div className="coh-card-left">
                    <div className="coh-worker-avatar">{workerName[0]}</div>
                    <div>
                      <div className="coh-job-title">{order.title}</div>
                      <div className="coh-worker-name">👷 {workerName}</div>
                      <div className="coh-card-meta">
                        <span>📅 {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        <span>📍 {order.address?.split(',')[0]}</span>
                        {order.budget && <span>💰 ₹{order.budget}</span>}
                      </div>
                      {order.review && (
                        <div className="coh-review-row">
                          <span style={{ color: '#f59e0b' }}>{'★'.repeat(order.review.rating)}</span>
                          {order.review.text && <em style={{ fontSize: 12, color: '#6b7280' }}>"{order.review.text}"</em>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="coh-card-right">
                    <span className="coh-status-badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                    {order.status === 'COMPLETED' && (
                      <button className="coh-receipt-btn" onClick={() => setSelected(order)}>
                        🧾 Receipt
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selected && <Receipt job={selected} onClose={() => setSelected(null)} />}
    </CustomerLayout>
  )
}