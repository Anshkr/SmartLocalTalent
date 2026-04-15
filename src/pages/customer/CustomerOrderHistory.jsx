import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'

function Receipt({ job, onClose }) {
  const fee   = Math.round((job.budget||0) * 0.05)
  const total = (job.budget||0) + fee
  const txId  = 'STP' + job.id.slice(-8).toUpperCase()

  const print = () => {
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html><head><title>Receipt - SmartTalent</title>
    <style>
      body{font-family:Arial,sans-serif;padding:40px;max-width:480px;margin:0 auto;color:#111}
      .logo{font-size:22px;font-weight:900;color:#1a6b4a;margin-bottom:4px}
      .logo-sub{font-size:13px;color:#9ca3af;margin-bottom:24px}
      h3{color:#1a6b4a;font-size:16px;margin-bottom:12px;border-bottom:2px solid #e8ede9;padding-bottom:8px}
      .row{display:flex;justify-content:space-between;padding:7px 0;font-size:14px;border-bottom:1px solid #f5f5f5}
      .row-lbl{color:#6b7280}.row-val{font-weight:600}
      .total-row{display:flex;justify-content:space-between;padding:12px 0;font-size:16px;font-weight:800;border-top:2px solid #111;margin-top:8px}
      .stars{color:#f59e0b;letter-spacing:2px}
      .tx{font-size:11px;color:#9ca3af;text-align:center;margin-top:20px}
      .badge{background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700}
      @media print{button{display:none}}
    </style></head><body>
    <div class="logo">SmartTalent</div>
    <div class="logo-sub">Local talent marketplace · Receipt</div>
    <h3>Job details</h3>
    <div class="row"><span class="row-lbl">Job</span><span class="row-val">${job.title}</span></div>
    <div class="row"><span class="row-lbl">Worker</span><span class="row-val">${job.worker?.user?.name||'—'}</span></div>
    <div class="row"><span class="row-lbl">Address</span><span class="row-val">${job.address}</span></div>
    <div class="row"><span class="row-lbl">Date</span><span class="row-val">${new Date(job.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</span></div>
    <div class="row"><span class="row-lbl">Status</span><span class="row-val"><span class="badge">✓ Completed</span></span></div>
    <h3 style="margin-top:20px">Payment summary</h3>
    <div class="row"><span class="row-lbl">Job amount</span><span class="row-val">₹${(job.budget||0).toLocaleString('en-IN')}</span></div>
    <div class="row"><span class="row-lbl">Platform fee (5%)</span><span class="row-val">₹${fee.toLocaleString('en-IN')}</span></div>
    <div class="total-row"><span>Total paid</span><span>₹${total.toLocaleString('en-IN')}</span></div>
    ${job.paymentMethod ? `<div class="row"><span class="row-lbl">Payment via</span><span class="row-val">${job.paymentMethod.toUpperCase()}</span></div>` : ''}
    ${job.review ? `<div class="row"><span class="row-lbl">Your rating</span><span class="row-val"><span class="stars">${'★'.repeat(job.review.rating)}</span></span></div>` : ''}
    <div class="tx">Transaction ID: ${txId}</div>
    </body></html>`)
    win.document.close()
    win.print()
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.6)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999, padding:20 }}
      onClick={onClose}>
      <div style={{ background:'#fff', borderRadius:20, maxWidth:480, width:'100%', maxHeight:'90vh', overflowY:'auto', padding:28, boxShadow:'0 32px 80px rgba(0,0,0,.25)', position:'relative', animation:'rcptIn .25s cubic-bezier(.34,1.56,.64,1)' }}
        onClick={e => e.stopPropagation()}>
        <style>{`@keyframes rcptIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>

        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, width:28, height:28, borderRadius:'50%', background:'#f0f4f1', border:'none', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

        <div style={{ fontFamily:'system-ui,sans-serif' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:40, height:40, background:'#1a6b4a', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:18 }}>S</div>
            <div>
              <div style={{ fontWeight:800, fontSize:16, color:'#111917' }}>SmartTalent</div>
              <div style={{ fontSize:12, color:'#9ca3af' }}>Job receipt</div>
            </div>
            <div style={{ marginLeft:'auto', background:'#dcfce7', color:'#166534', border:'1px solid #bbf7d0', borderRadius:20, padding:'4px 12px', fontSize:12, fontWeight:700 }}>✓ Completed</div>
          </div>

          {[
            ['Job',      job.title],
            ['Worker',   job.worker?.user?.name||'—'],
            ['Address',  job.address],
            ['Date',     new Date(job.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
            ['Urgency',  job.urgency],
          ].map(([l,v]) => (
            <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid #f5f5f5', fontSize:14 }}>
              <span style={{ color:'#6b7280' }}>{l}</span>
              <span style={{ fontWeight:600, color:'#111917', textAlign:'right', maxWidth:'60%' }}>{v}</span>
            </div>
          ))}

          <div style={{ background:'#f8faf9', borderRadius:12, padding:'14px 16px', marginTop:16, marginBottom:16 }}>
            {[
              ['Job amount', `₹${(job.budget||0).toLocaleString('en-IN')}`],
              ['Platform fee (5%)', `₹${fee.toLocaleString('en-IN')}`],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:8 }}>
                <span style={{ color:'#6b7280' }}>{l}</span>
                <span style={{ fontWeight:600 }}>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:17, fontWeight:800, paddingTop:10, borderTop:'1.5px solid #e8ede9' }}>
              <span>Total paid</span>
              <span style={{ color:'#1a6b4a' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {job.review && (
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:14, marginBottom:12 }}>
              <span style={{ color:'#6b7280' }}>Your rating</span>
              <span>{[1,2,3,4,5].map(n=><span key={n} style={{ color:n<=job.review.rating?'#f59e0b':'#e5e7eb', fontSize:16 }}>★</span>)}</span>
            </div>
          )}

          <div style={{ fontSize:11, color:'#9ca3af', textAlign:'center', marginBottom:16 }}>
            Transaction ID: {txId}
          </div>

          <button onClick={print} style={{ width:'100%', padding:13, background:'#1a6b4a', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>
            🖨️ Print receipt
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CustomerOrderHistory() {
  const navigate = useNavigate()
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState(null)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => setOrders(data.filter(r => r.status === 'COMPLETED')))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o =>
    !search || o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.worker?.user?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalSpent = orders.reduce((a,o) => a+(o.budget||0), 0)
  const COLORS = ['#1a6b4a','#7c3aed','#0891b2','#d97706','#dc2626','#be185d']

  return (
    <CustomerLayout>
      <style>{`
        .coh-page { display:flex; flex-direction:column; gap:20px; max-width:820px; }
        .coh-hdr  { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .coh-title { font-size:22px; font-weight:800; color:#111917; }
        .coh-sub   { font-size:13px; color:#9ca3af; margin-top:4px; }
        .coh-search { padding:10px 14px; border:1.5px solid #e8ede9; border-radius:10px; font-size:14px; outline:none; transition:border-color .15s; }
        .coh-search:focus { border-color:#1a6b4a; }
        .coh-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .coh-stat  { background:#fff; border-radius:14px; border:1.5px solid #e8ede9; padding:16px 18px; }
        .coh-stat-val { font-size:22px; font-weight:800; color:#111917; }
        .coh-stat-lbl { font-size:12px; color:#9ca3af; margin-top:4px; }
        .coh-list { display:flex; flex-direction:column; gap:12px; }
        .coh-empty { display:flex; flex-direction:column; align-items:center; gap:10px; padding:60px 20px; color:#9ca3af; text-align:center; }
        .coh-empty-ic { font-size:44px; opacity:.3; }
        .coh-find-btn { padding:11px 24px; background:#1a6b4a; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; margin-top:4px; }
        .coh-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:18px 20px; display:flex; align-items:flex-start; gap:14px; transition:all .2s; }
        .coh-card:hover { border-color:#1a6b4a; box-shadow:0 4px 16px rgba(26,107,74,.08); }
        .coh-av { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:800; color:#fff; flex-shrink:0; }
        .coh-info { flex:1; min-width:0; }
        .coh-job-title  { font-size:15px; font-weight:700; color:#111917; }
        .coh-worker     { font-size:13px; color:#6b7280; margin-top:2px; }
        .coh-meta       { display:flex; gap:10px; flex-wrap:wrap; font-size:12px; color:#9ca3af; margin-top:5px; }
        .coh-stars      { display:inline-flex; gap:2px; margin-top:5px; }
        .coh-star       { font-size:14px; color:#d1d5db; }
        .coh-star.on    { color:#f59e0b; }
        .coh-review-txt { font-size:13px; color:#4b5563; font-style:italic; margin-top:5px; }
        .coh-right { display:flex; flex-direction:column; align-items:flex-end; gap:8px; flex-shrink:0; }
        .coh-budget     { font-size:18px; font-weight:800; color:#111917; }
        .coh-paid-badge { background:#dcfce7; color:#166534; border:1px solid #bbf7d0; border-radius:20px; padding:3px 10px; font-size:11px; font-weight:700; }
        .coh-date       { font-size:11px; color:#9ca3af; }
        .coh-receipt-btn { padding:7px 14px; border-radius:8px; border:1.5px solid #e8ede9; background:#fff; color:#6b7b72; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; }
        .coh-receipt-btn:hover { border-color:#1a6b4a; color:#1a6b4a; background:#f0fdf4; }
      `}</style>

      <div className="coh-page">
        <div className="coh-hdr">
          <div>
            <h1 className="coh-title">Order history</h1>
            <p className="coh-sub">All your completed jobs and receipts</p>
          </div>
          <input className="coh-search" placeholder="Search orders…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="coh-stats">
          <div className="coh-stat">
            <div className="coh-stat-val">{orders.length}</div>
            <div className="coh-stat-lbl">Jobs completed</div>
          </div>
          <div className="coh-stat">
            <div className="coh-stat-val">₹{totalSpent.toLocaleString('en-IN')}</div>
            <div className="coh-stat-lbl">Total spent</div>
          </div>
          <div className="coh-stat">
            <div className="coh-stat-val">{orders.filter(o=>o.review).length}</div>
            <div className="coh-stat-lbl">Reviews given</div>
          </div>
        </div>

        {loading ? (
          <div className="coh-empty"><p>Loading orders…</p></div>
        ) : filtered.length === 0 ? (
          <div className="coh-empty">
            <div className="coh-empty-ic">🧾</div>
            <p>{search ? `No results for "${search}"` : 'No completed orders yet.'}</p>
            <button className="coh-find-btn" onClick={() => navigate('/customer/search')}>Find a worker →</button>
          </div>
        ) : (
          <div className="coh-list">
            {filtered.map((order, i) => (
              <div key={order.id} className="coh-card">
                <div className="coh-av" style={{ background: COLORS[i%COLORS.length] }}>
                  {order.worker?.user?.name?.[0] ?? '?'}
                </div>
                <div className="coh-info">
                  <div className="coh-job-title">{order.title}</div>
                  <div className="coh-worker">👷 {order.worker?.user?.name}</div>
                  <div className="coh-meta">
                    <span>📍 {order.address}</span>
                    <span>⚡ {order.urgency}</span>
                    {order.paymentMethod && <span>💳 {order.paymentMethod.toUpperCase()}</span>}
                  </div>
                  {order.review && (
                    <>
                      <div className="coh-stars">
                        {[1,2,3,4,5].map(n=><span key={n} className={`coh-star ${n<=order.review.rating?'on':''}`}>★</span>)}
                      </div>
                      {order.review.text && <div className="coh-review-txt">"{order.review.text}"</div>}
                    </>
                  )}
                </div>
                <div className="coh-right">
                  <div className="coh-budget">₹{(order.budget||0).toLocaleString('en-IN')}</div>
                  <div className="coh-paid-badge">✓ Paid</div>
                  <div className="coh-date">
                    {new Date(order.updatedAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                  </div>
                  <button className="coh-receipt-btn" onClick={() => setReceipt(order)}>
                    🧾 Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {receipt && <Receipt job={receipt} onClose={() => setReceipt(null)} />}
    </CustomerLayout>
  )
}