import { useState, useEffect } from 'react'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyTransactionsAPI } from '../../lib/api'

const TYPE_META = {
  PAYMENT:      { icon:'💳', label:'Payment',      color:'#ef4444', bg:'#fee2e2', sign:'-' },
  PLATFORM_FEE: { icon:'📊', label:'Platform Fee', color:'#f59e0b', bg:'#fffbeb', sign:'-' },
  EARNING:      { icon:'💰', label:'Earning',       color:'#22c55e', bg:'#f0fdf4', sign:'+' },
  WITHDRAWAL:   { icon:'🏦', label:'Withdrawal',   color:'#7c3aed', bg:'#f5f3ff', sign:'-' },
  REFUND:       { icon:'↩️', label:'Refund',        color:'#06b6d4', bg:'#ecfeff', sign:'+' },
}

const STATUS_META = {
  COMPLETED: { bg:'#dcfce7', color:'#166534', label:'Completed' },
  PENDING:   { bg:'#fef3c7', color:'#92400e', label:'Pending'   },
  FAILED:    { bg:'#fee2e2', color:'#991b1b', label:'Failed'    },
  REFUNDED:  { bg:'#f3f4f6', color:'#6b7280', label:'Refunded'  },
}

export default function TransactionHistory() {
  const [txs, setTxs]         = useState([])
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState('')
  const [filter, setFilter]    = useState('all')

  useEffect(() => {
    getMyTransactionsAPI()
      .then(({ data }) => setTxs(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error(err)
        setError('Failed to load transactions. Please try again.')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = txs.filter(t =>
    filter === 'all' ? true : t.type === filter
  )

  const totalSpent = txs
    .filter(t => t.type === 'PAYMENT' && t.status === 'COMPLETED')
    .reduce((a, t) => a + (t.amount || 0), 0)

  const totalFees = txs
    .filter(t => t.type === 'PLATFORM_FEE' && t.status === 'COMPLETED')
    .reduce((a, t) => a + (t.amount || 0), 0)

  return (
    <CustomerLayout>
      <style>{`
        .txh-page  { display:flex; flex-direction:column; gap:20px; max-width:800px; }
        .txh-title { font-size:22px; font-weight:800; color:#111917; }
        .txh-sub   { font-size:13px; color:#9ca3af; margin-top:4px; }

        .txh-summary { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        @media(max-width:480px){ .txh-summary { grid-template-columns:repeat(3,1fr); gap:8px; } }
        .txh-sum   { background:#fff; border-radius:14px; border:1.5px solid #e8ede9; padding:16px 18px; }
        .txh-sum-val { font-size:20px; font-weight:800; color:#111917; }
        .txh-sum-lbl { font-size:12px; color:#9ca3af; margin-top:4px; }

        .txh-filters { display:flex; gap:6px; flex-wrap:wrap; }
        .txh-filter  { padding:7px 16px; border-radius:30px; border:1.5px solid #e8ede9; background:#fff; font-size:13px; font-weight:600; color:#6b7b72; cursor:pointer; transition:all .15s; }
        .txh-filter:hover { border-color:#4f6ef7; color:#4f6ef7; }
        .txh-filter.on { background:#4f6ef7; border-color:#4f6ef7; color:#fff; }

        .txh-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; overflow:hidden; }
        .txh-card-hdr { display:flex; align-items:center; justify-content:space-between; padding:16px 22px; border-bottom:1px solid #f0f4f1; }
        .txh-card-ttl { font-size:15px; font-weight:700; color:#111917; }
        .txh-card-cnt { font-size:12px; color:#9ca3af; background:#f8faf9; border:1px solid #e8ede9; border-radius:20px; padding:3px 10px; font-weight:600; }

        .txh-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:48px; color:#9ca3af; text-align:center; }
        .txh-empty-ic { font-size:40px; opacity:.3; }
        .txh-error { background:#fee2e2; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; font-size:13px; color:#991b1b; }

        .txh-row { display:flex; align-items:center; gap:14px; padding:14px 22px; border-bottom:1px solid #f8faf9; transition:background .12s; }
        .txh-row:last-child { border-bottom:none; }
        .txh-row:hover { background:#fafbfa; }
        .txh-ic { width:42px; height:42px; border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
        .txh-info { flex:1; min-width:0; }
        .txh-desc { font-size:14px; font-weight:600; color:#111917; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .txh-meta { font-size:12px; color:#9ca3af; margin-top:2px; }
        .txh-job  { font-size:11px; color:#9ca3af; margin-top:2px; }
        .txh-right { display:flex; flex-direction:column; align-items:flex-end; gap:4px; flex-shrink:0; }
        .txh-amt  { font-size:16px; font-weight:800; }
        .txh-badge { font-size:11px; font-weight:700; padding:2px 9px; border-radius:20px; }
      `}</style>

      <div className="txh-page">
        <div>
          <h1 className="txh-title">Transaction history</h1>
          <p className="txh-sub">All your payments, fees and refunds</p>
        </div>

        {error && <div className="txh-error">{error}</div>}

        {/* Summary */}
        <div className="txh-summary">
          <div className="txh-sum">
            <div className="txh-sum-val">₹{totalSpent.toLocaleString('en-IN')}</div>
            <div className="txh-sum-lbl">Total spent</div>
          </div>
          <div className="txh-sum">
            <div className="txh-sum-val">{txs.filter(t=>t.type==='PAYMENT').length}</div>
            <div className="txh-sum-lbl">Payments</div>
          </div>
          <div className="txh-sum">
            <div className="txh-sum-val">₹{totalFees.toLocaleString('en-IN')}</div>
            <div className="txh-sum-lbl">Fees paid</div>
          </div>
        </div>

        {/* Filters */}
        <div className="txh-filters">
          {[['all','All'],['PAYMENT','Payments'],['PLATFORM_FEE','Fees'],['REFUND','Refunds']].map(([v,l]) => (
            <button key={v} className={`txh-filter ${filter===v?'on':''}`} onClick={() => setFilter(v)}>{l}</button>
          ))}
        </div>

        <div className="txh-card">
          <div className="txh-card-hdr">
            <span className="txh-card-ttl">Transactions</span>
            <span className="txh-card-cnt">{filtered.length}</span>
          </div>

          {loading ? (
            <div className="txh-empty"><p>Loading transactions…</p></div>
          ) : filtered.length === 0 ? (
            <div className="txh-empty">
              <div className="txh-empty-ic">💳</div>
              <p>
                {txs.length === 0
                  ? 'No transactions yet. Pay for a job to see them here.'
                  : `No ${filter === 'all' ? '' : filter.replace('_',' ').toLowerCase()} transactions.`}
              </p>
            </div>
          ) : (
            filtered.map(tx => {
              const tm = TYPE_META[tx.type] || TYPE_META.PAYMENT
              const sm = STATUS_META[tx.status] || STATUS_META.COMPLETED
              const jobTitle = tx.job?.title

              return (
                <div key={tx.id} className="txh-row">
                  <div className="txh-ic" style={{ background: tm.bg }}>{tm.icon}</div>
                  <div className="txh-info">
                    <div className="txh-desc">{tx.description || tm.label}</div>
                    <div className="txh-meta">
                      {tm.label}
                      {tx.method ? ` · ${tx.method.toUpperCase()}` : ''}
                      {' · '}{new Date(tx.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                    </div>
                    {jobTitle && <div className="txh-job">Job: {jobTitle}</div>}
                  </div>
                  <div className="txh-right">
                    <div className="txh-amt" style={{ color: tm.sign==='+' ? '#16a34a' : '#ef4444' }}>
                      {tm.sign}₹{(tx.amount||0).toLocaleString('en-IN')}
                    </div>
                    <div className="txh-badge" style={{ background:sm.bg, color:sm.color }}>{sm.label}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </CustomerLayout>
  )
}