import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI, getMessagesAPI, sendMessageAPI, submitReviewAPI, payJobAPI } from '../../lib/api'

const STEPS = ['Sent', 'Accepted', 'In Progress', 'Completed']
const STATUS_TO_STEP = { PENDING: 0, ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 3 }
const PAY_METHODS = [
  { id:'upi',        icon:'📱', label:'UPI',          sub:'GPay · PhonePe · Paytm'  },
  { id:'card',       icon:'💳', label:'Card',          sub:'Debit / Credit card'     },
  { id:'netbanking', icon:'🏦', label:'Net Banking',   sub:'All major banks'         },
  { id:'wallet',     icon:'👛', label:'Wallet',        sub:'Paytm · Mobikwik'        },
  { id:'cash',       icon:'💵', label:'Cash',          sub:'Pay worker directly'     },
]

export default function CustomerActiveJob() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [job, setJob]     = useState(null)
  const [msgs, setMsgs]   = useState([])
  const [input, setInput] = useState('')
  const [step, setStep]   = useState(0)
  const [loading, setLoading] = useState(true)

  // Payment
  const [payRequest, setPayRequest] = useState(null)
  const [showPay, setShowPay]       = useState(false)
  const [payMethod, setPayMethod]   = useState('upi')
  const [upiId, setUpiId]           = useState('')
  const [paying, setPaying]         = useState(false)
  const [paid, setPaid]             = useState(false)
  const [payError, setPayError]     = useState('')

  // Rating
  const [showRate, setShowRate]    = useState(false)
  const [stars, setStars]          = useState(0)
  const [hover, setHover]          = useState(0)
  const [reviewTxt, setReviewTxt]  = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rated, setRated]          = useState(false)

  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    getMyRequestsAPI().then(({ data }) => {
      const active = data.find(r => ['PENDING','ACCEPTED','IN_PROGRESS','COMPLETED'].includes(r.status))
      if (active) {
        setJob(active)
        setStep(STATUS_TO_STEP[active.status] ?? 0)
        if (active.status === 'COMPLETED') { setShowRate(!active.review); setPaid(!!active.paidAt) }
        return getMessagesAPI(active.id)
      }
    }).then(r => { if (r) setMsgs(r.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!job) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000', {
      transports: ['polling','websocket']
    })
    socketRef.current = socket
    socket.emit('join_job', job.id)
    socket.emit('join_user', user.id)
    socket.on('new_message', msg => {
      setMsgs(m => [...m, msg])
      if (msg.type === 'payment_request') {
        try { setPayRequest(JSON.parse(msg.text)) } catch {}
      }
    })
    socket.on('status_changed', ({ status }) => {
      setStep(STATUS_TO_STEP[status] ?? step)
      if (status === 'COMPLETED') setShowRate(true)
    })
    socket.on('payment_confirmed', () => setPaid(true))
    return () => socket.disconnect()
  }, [job])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const send = async () => {
    if (!input.trim() || !job) return
    const text = input.trim(); setInput('')
    try {
      const { data } = await sendMessageAPI({ jobId: job.id, text })
      socketRef.current?.emit('send_message', { ...data, jobId: job.id })
    } catch {}
  }

  const handlePay = async () => {
    if (payMethod === 'upi' && !upiId.trim()) { setPayError('Enter your UPI ID'); return }
    setPayError(''); setPaying(true)
    try {
      await payJobAPI({ jobId: job.id, method: payMethod, amount: payRequest?.amount || job.budget })
      setPaid(true)
      setShowPay(false)
      setShowRate(true)
      socketRef.current?.emit('payment_confirmed', { jobId: job.id })
    } catch (err) {
      setPayError(err.response?.data?.error || 'Payment failed. Please try again.')
    } finally { setPaying(false) }
  }

  const handleRate = async () => {
    if (!stars || !job) return
    setSubmitting(true)
    try {
      await submitReviewAPI({ jobId: job.id, rating: stars, text: reviewTxt.trim() || null })
      setRated(true)
      setTimeout(() => setShowRate(false), 2200)
    } catch {} finally { setSubmitting(false) }
  }

  if (loading) return <CustomerLayout><div style={{padding:60,textAlign:'center',color:'#9ca3af'}}>Loading…</div></CustomerLayout>

  if (!job) return (
    <CustomerLayout>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'80px 20px',textAlign:'center'}}>
        <div style={{fontSize:48}}>📋</div>
        <h2 style={{fontSize:20,fontWeight:700}}>No active job</h2>
        <p style={{color:'#9ca3af',fontSize:14}}>Send a request to a worker to start a job.</p>
        <button onClick={() => navigate('/customer/search')} style={{marginTop:8,padding:'11px 24px',background:'#4f6ef7',color:'#fff',border:'none',borderRadius:10,fontWeight:700,cursor:'pointer',fontSize:14}}>Find a worker →</button>
      </div>
    </CustomerLayout>
  )

  const workerName = job.worker?.user?.name || 'Worker'
  const jobAmt = job.budget || 0
  const fee = Math.round(jobAmt * 0.05)
  const total = jobAmt + fee

  return (
    <CustomerLayout>
      <style>{`
        .caj2-page { display:flex; flex-direction:column; gap:18px; max-width:760px; }

        /* Job header card */
        .caj2-header { background:linear-gradient(135deg,#1e3a5f 0%,#1a4a7a 100%); border-radius:18px; padding:22px 26px; position:relative; overflow:hidden; }
        .caj2-header::before { content:''; position:absolute; top:-60px; right:-60px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(79,110,247,.3),transparent 70%); pointer-events:none; }
        .caj2-h-top { position:relative; z-index:1; display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .caj2-title { font-size:18px; font-weight:800; color:#fff; margin-bottom:6px; }
        .caj2-meta  { font-size:13px; color:rgba(255,255,255,.55); display:flex; flex-direction:column; gap:3px; }
        .caj2-meta span { display:flex; align-items:center; gap:6px; }
        .caj2-budget { font-size:28px; font-weight:800; color:#93c5fd; }
        .caj2-blbl { font-size:11px; color:rgba(255,255,255,.4); text-align:right; margin-top:2px; }

        /* Step tracker */
        .caj2-steps { position:relative; z-index:1; display:flex; align-items:center; margin-top:22px; padding-bottom:28px; }
        .caj2-swrap { display:flex; align-items:center; flex:1; position:relative; }
        .caj2-swrap:last-child { flex:0; }
        .caj2-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; border:2.5px solid rgba(255,255,255,.2); color:rgba(255,255,255,.4); flex-shrink:0; transition:all .3s; }
        .caj2-dot.done   { background:#4f6ef7; border-color:#4f6ef7; color:#fff; }
        .caj2-dot.active { background:rgba(147,197,253,.2); border-color:#93c5fd; color:#93c5fd; }
        .caj2-sline { flex:1; height:2px; background:rgba(255,255,255,.15); margin:0 5px; }
        .caj2-sline.done { background:#4f6ef7; }
        .caj2-slbl { position:absolute; top:32px; left:50%; transform:translateX(-50%); font-size:10px; color:rgba(255,255,255,.45); white-space:nowrap; font-weight:600; }

        /* Payment banner */
        .caj2-pay-banner { background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1.5px solid #fde68a; border-radius:16px; padding:18px 22px; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; animation:caj2Pop .35s cubic-bezier(.34,1.56,.64,1); }
        @keyframes caj2Pop { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        .caj2-pay-tag { font-size:11px; font-weight:800; color:#92400e; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:4px; }
        .caj2-pay-amt { font-size:30px; font-weight:800; color:#d97706; letter-spacing:-1px; }
        .caj2-pay-from { font-size:13px; color:#78350f; margin-top:3px; }
        .caj2-pay-btn { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:14px; padding:13px 28px; font-size:15px; font-weight:800; color:#fff; cursor:pointer; white-space:nowrap; box-shadow:0 6px 16px rgba(245,158,11,.35); transition:all .2s; }
        .caj2-pay-btn:hover { box-shadow:0 10px 24px rgba(245,158,11,.45); transform:translateY(-2px); }
        .caj2-paid-badge { display:inline-flex; align-items:center; gap:8px; background:#dcfce7; border:1.5px solid #bbf7d0; border-radius:20px; padding:10px 18px; font-size:14px; font-weight:700; color:#166534; }

        /* Review prompt */
        .caj2-review-prompt { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:1.5px solid #bbf7d0; border-radius:16px; padding:16px 22px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .caj2-rp-ttl { font-size:15px; font-weight:700; color:#166534; }
        .caj2-rp-sub { font-size:13px; color:#4b7a5a; }
        .caj2-rp-btn { background:#16a34a; border:none; border-radius:12px; padding:10px 22px; font-size:14px; font-weight:700; color:#fff; cursor:pointer; transition:background .15s; }
        .caj2-rp-btn:hover { background:#15803d; }

        /* Chat */
        .caj2-chat { background:#fff; border-radius:18px; border:1.5px solid #e8ede9; overflow:hidden; display:flex; flex-direction:column; }
        .caj2-chat-hdr { padding:14px 20px; border-bottom:1px solid #f0f4f1; display:flex; align-items:center; gap:12px; }
        .caj2-chat-av  { width:40px; height:40px; border-radius:50%; background:#4f6ef7; color:#fff; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:700; flex-shrink:0; }
        .caj2-chat-name { font-size:14px; font-weight:700; color:#111917; }
        .caj2-chat-sub  { font-size:12px; color:#9ca3af; }
        .caj2-online-dot { width:8px; height:8px; border-radius:50%; background:#22c55e; margin-left:auto; flex-shrink:0; box-shadow:0 0 0 2px rgba(34,197,94,.2); }
        .caj2-msgs { height:320px; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:8px; background:#fafbfa; }
        .caj2-row { display:flex; }
        .caj2-row.me { justify-content:flex-end; }
        .caj2-bubble { max-width:74%; padding:10px 14px; border-radius:14px; font-size:14px; line-height:1.5; }
        .caj2-bubble.them { background:#fff; border:1.5px solid #e8ede9; color:#111917; border-bottom-left-radius:4px; }
        .caj2-bubble.me   { background:#4f6ef7; color:#fff; border-bottom-right-radius:4px; }
        .caj2-btime { font-size:10px; opacity:.5; margin-top:4px; }

        /* Payment message card in chat */
        .caj2-pay-msg { background:linear-gradient(135deg,#fffbeb,#fef9c3); border:1.5px solid #fde68a; border-radius:14px; padding:14px 16px; max-width:80%; cursor:pointer; transition:all .15s; }
        .caj2-pay-msg:hover { box-shadow:0 4px 16px rgba(245,158,11,.2); }
        .caj2-pm-label { font-size:11px; font-weight:800; color:#92400e; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
        .caj2-pm-amt   { font-size:24px; font-weight:800; color:#d97706; letter-spacing:-1px; }
        .caj2-pm-note  { font-size:12px; color:#78350f; opacity:.75; margin-top:3px; }
        .caj2-pm-cta   { margin-top:10px; display:inline-flex; align-items:center; gap:6px; background:#f59e0b; border:none; border-radius:9px; padding:7px 14px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; }
        .caj2-pm-paid  { margin-top:8px; font-size:12px; color:#166534; font-weight:700; display:flex; align-items:center; gap:5px; }

        .caj2-input-row { display:flex; gap:10px; padding:14px; border-top:1px solid #f0f4f1; background:#fff; }
        .caj2-input { flex:1; padding:11px 14px; border-radius:12px; border:1.5px solid #e8ede9; font-size:14px; outline:none; transition:border-color .15s; }
        .caj2-input:focus { border-color:#4f6ef7; }
        .caj2-send { width:44px; height:44px; border-radius:12px; border:none; background:#4f6ef7; color:#fff; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; flex-shrink:0; }
        .caj2-send:hover { background:#3a57e8; }

        /* Payment modal */
        .caj2-overlay { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(5px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
        .caj2-modal { background:#fff; border-radius:22px; max-width:440px; width:100%; overflow:hidden; max-height:90vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:caj2ModalIn .25s cubic-bezier(.34,1.56,.64,1); }
        @keyframes caj2ModalIn { from{opacity:0;transform:scale(.9) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .caj2-modal-top { background:linear-gradient(135deg,#1c1a00,#3a2c00); padding:24px; position:relative; }
        .caj2-modal-x { position:absolute; top:12px; right:12px; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,.1); border:none; color:rgba(255,255,255,.7); font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .caj2-modal-x:hover { background:rgba(255,255,255,.2); color:#fff; }
        .caj2-modal-tag { font-size:11px; font-weight:800; color:rgba(253,224,71,.8); letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
        .caj2-modal-amt { font-size:42px; font-weight:800; color:#fde047; letter-spacing:-2px; }
        .caj2-modal-sub { font-size:13px; color:rgba(255,255,255,.5); margin-top:5px; }
        .caj2-modal-body { padding:22px; display:flex; flex-direction:column; gap:16px; }
        .caj2-breakdown { background:#f8faf9; border-radius:12px; overflow:hidden; border:1px solid #e8ede9; }
        .caj2-br-row { display:flex; justify-content:space-between; padding:11px 16px; font-size:14px; border-bottom:1px solid #f0f4f1; }
        .caj2-br-row:last-child { border-bottom:none; }
        .caj2-br-lbl { color:#6b7280; }
        .caj2-br-val { color:#111827; font-weight:600; }
        .caj2-br-total { display:flex; justify-content:space-between; padding:13px 16px; background:#fff; border-top:2px solid #e8ede9; }
        .caj2-br-total-l { font-size:15px; font-weight:700; color:#111827; }
        .caj2-br-total-r { font-size:20px; font-weight:800; color:#111827; }
        .caj2-methods-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .caj2-meth { display:flex; align-items:center; gap:9px; padding:12px 13px; border-radius:12px; border:2px solid #e8ede9; background:#fff; cursor:pointer; text-align:left; transition:all .15s; }
        .caj2-meth:hover { border-color:#f59e0b; }
        .caj2-meth.on { border-color:#f59e0b; background:#fffbeb; }
        .caj2-meth-ic  { font-size:20px; flex-shrink:0; }
        .caj2-meth-lbl { font-size:13px; font-weight:700; color:#111827; }
        .caj2-meth-sub { font-size:11px; color:#9ca3af; }
        .caj2-meth-check { width:16px; height:16px; border-radius:50%; border:2px solid #d1d5db; margin-left:auto; flex-shrink:0; transition:all .15s; }
        .caj2-meth.on .caj2-meth-check { border-color:#f59e0b; background:#f59e0b; box-shadow:inset 0 0 0 3px #fff; }
        .caj2-upi-in { width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e8ede9; font-size:15px; outline:none; transition:border-color .15s; }
        .caj2-upi-in:focus { border-color:#f59e0b; }
        .caj2-cash-note { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:13px 15px; font-size:13px; color:#166534; line-height:1.5; }
        .caj2-pay-err { background:#fee2e2; border:1px solid #fecaca; border-radius:10px; padding:10px 14px; font-size:13px; color:#991b1b; }
        .caj2-pay-now { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:13px; padding:15px; width:100%; font-size:16px; font-weight:800; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 6px 20px rgba(245,158,11,.35); }
        .caj2-pay-now:hover:not(:disabled) { box-shadow:0 10px 28px rgba(245,158,11,.45); transform:translateY(-1px); }
        .caj2-pay-now:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; transform:none; }
        .caj2-proc { display:flex; flex-direction:column; align-items:center; gap:16px; padding:48px 20px; text-align:center; }
        .caj2-proc-ring { width:60px; height:60px; border-radius:50%; border:5px solid #fef3c7; border-top-color:#f59e0b; animation:caj2Spin .8s linear infinite; }
        @keyframes caj2Spin { to{transform:rotate(360deg)} }
        .caj2-pay-success { display:flex; flex-direction:column; align-items:center; gap:14px; padding:40px 20px; text-align:center; }
        .caj2-pay-sic { font-size:56px; animation:caj2Pop .4s cubic-bezier(.34,1.56,.64,1); }

        /* Rating modal */
        .caj2-rate-modal { background:#fff; border-radius:22px; max-width:420px; width:100%; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.25); animation:caj2ModalIn .3s cubic-bezier(.34,1.56,.64,1); }
        .caj2-rate-top { background:linear-gradient(135deg,#fffbeb,#fef3c7); padding:28px 24px 22px; text-align:center; border-bottom:1px solid #fde68a; }
        .caj2-rate-ic  { font-size:48px; margin-bottom:8px; }
        .caj2-rate-ttl { font-size:20px; font-weight:800; color:#111827; }
        .caj2-rate-sub { font-size:13px; color:#78350f; margin-top:4px; }
        .caj2-rate-body { padding:24px; display:flex; flex-direction:column; gap:18px; }
        .caj2-stars { display:flex; gap:8px; justify-content:center; }
        .caj2-star  { font-size:44px; cursor:pointer; filter:grayscale(1); transition:all .15s; }
        .caj2-star.lit, .caj2-star:hover { filter:none; transform:scale(1.12); }
        .caj2-star-labels { display:flex; justify-content:space-between; font-size:12px; color:#9ca3af; margin-top:-8px; }
        .caj2-review-area { width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e8ede9; font-size:14px; resize:vertical; outline:none; font-family:inherit; transition:border-color .15s; }
        .caj2-review-area:focus { border-color:#f59e0b; }
        .caj2-submit-rate { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:13px; padding:14px; width:100%; font-size:15px; font-weight:800; color:#fff; cursor:pointer; box-shadow:0 5px 18px rgba(245,158,11,.3); transition:all .2s; }
        .caj2-submit-rate:hover:not(:disabled) { box-shadow:0 9px 26px rgba(245,158,11,.4); transform:translateY(-1px); }
        .caj2-submit-rate:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; transform:none; }
        .caj2-skip { background:none; border:none; color:#9ca3af; font-size:13px; cursor:pointer; text-align:center; }
        .caj2-rate-done { display:flex; flex-direction:column; align-items:center; gap:14px; padding:40px; text-align:center; }
      `}</style>

      <div className="caj2-page">

        {/* Job header */}
        <div className="caj2-header">
          <div className="caj2-h-top">
            <div>
              <div className="caj2-title">{job.title}</div>
              <div className="caj2-meta">
                <span>👷 {workerName}</span>
                <span>📍 {job.address}</span>
                {job.urgency && <span>⚡ {job.urgency}</span>}
              </div>
            </div>
            {job.budget && (
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div className="caj2-budget">₹{jobAmt.toLocaleString('en-IN')}</div>
                <div className="caj2-blbl">Job budget</div>
              </div>
            )}
          </div>
          <div className="caj2-steps">
            {STEPS.map((label, i) => (
              <div key={label} className="caj2-swrap">
                <div className={`caj2-dot ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  {i < step ? '✓' : i+1}
                </div>
                <div className="caj2-slbl">{label}</div>
                {i < STEPS.length-1 && <div className={`caj2-sline ${i < step ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Payment banner from worker request */}
        {payRequest && !paid && (
          <div className="caj2-pay-banner">
            <div>
              <div className="caj2-pay-tag">💳 Payment requested by {workerName}</div>
              <div className="caj2-pay-amt">₹{(payRequest.amount||jobAmt).toLocaleString('en-IN')}</div>
              {payRequest.note && <div className="caj2-pay-from">{payRequest.note}</div>}
            </div>
            <button className="caj2-pay-btn" onClick={() => setShowPay(true)}>Pay now →</button>
          </div>
        )}

        {/* Paid confirmation */}
        {paid && (
          <div className="caj2-pay-banner" style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #bbf7d0' }}>
            <div className="caj2-paid-badge">✅ Payment of ₹{(payRequest?.amount||jobAmt).toLocaleString('en-IN')} sent to {workerName}</div>
          </div>
        )}

        {/* Review prompt */}
        {step >= 3 && !rated && !showRate && (
          <div className="caj2-review-prompt">
            <div>
              <div className="caj2-rp-ttl">Rate {workerName}'s work</div>
              <div className="caj2-rp-sub">Your review helps other customers</div>
            </div>
            <button className="caj2-rp-btn" onClick={() => setShowRate(true)}>⭐ Leave a review</button>
          </div>
        )}

        {/* Chat */}
        <div className="caj2-chat">
          <div className="caj2-chat-hdr">
            <div className="caj2-chat-av">{workerName[0]}</div>
            <div>
              <div className="caj2-chat-name">{workerName}</div>
              <div className="caj2-chat-sub">Worker · Live chat</div>
            </div>
            <div className="caj2-online-dot" />
          </div>
          <div className="caj2-msgs">
            {msgs.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, padding:'20px 0' }}>
                Chat with {workerName} about the job
              </div>
            )}
            {msgs.map((msg, i) => {
              const isMe = msg.senderId === user?.id
              if (msg.type === 'payment_request') {
                try {
                  const pr = JSON.parse(msg.text)
                  return (
                    <div key={i} className="caj2-row">
                      <div className="caj2-pay-msg" onClick={() => !paid && setShowPay(true)}>
                        <div className="caj2-pm-label">💳 Payment requested</div>
                        <div className="caj2-pm-amt">₹{(pr.amount||jobAmt).toLocaleString('en-IN')}</div>
                        {pr.note && <div className="caj2-pm-note">{pr.note}</div>}
                        {paid ? <div className="caj2-pm-paid">✅ Paid</div>
                               : <button className="caj2-pm-cta">Tap to pay →</button>}
                      </div>
                    </div>
                  )
                } catch { return null }
              }
              return (
                <div key={i} className={`caj2-row ${isMe?'me':''}`}>
                  <div className={`caj2-bubble ${isMe?'me':'them'}`}>
                    {msg.text}
                    <div className="caj2-btime">
                      {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
          <div className="caj2-input-row">
            <input className="caj2-input" placeholder="Type a message…"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="caj2-send" onClick={send}>↑</button>
          </div>
        </div>

      </div>

      {/* ── PAYMENT MODAL ── */}
      {showPay && (
        <div className="caj2-overlay" onClick={() => !paying && setShowPay(false)}>
          <div className="caj2-modal" onClick={e => e.stopPropagation()}>
            {paying ? (
              <div className="caj2-proc">
                <div className="caj2-proc-ring" />
                <div style={{ fontWeight:700, fontSize:17 }}>Processing payment…</div>
                <div style={{ fontSize:13, color:'#9ca3af' }}>Please don't close this page</div>
              </div>
            ) : (
              <>
                <div className="caj2-modal-top">
                  <button className="caj2-modal-x" onClick={() => setShowPay(false)}>✕</button>
                  <div className="caj2-modal-tag">Pay {workerName}</div>
                  <div className="caj2-modal-amt">₹{(payRequest?.amount||jobAmt).toLocaleString('en-IN')}</div>
                  <div className="caj2-modal-sub">Requested by {workerName} · 5% platform fee applies</div>
                </div>
                <div className="caj2-modal-body">
                  <div className="caj2-breakdown">
                    <div className="caj2-br-row"><span className="caj2-br-lbl">Job amount</span><span className="caj2-br-val">₹{(payRequest?.amount||jobAmt).toLocaleString('en-IN')}</span></div>
                    <div className="caj2-br-row"><span className="caj2-br-lbl">Platform fee (5%)</span><span className="caj2-br-val">₹{Math.round((payRequest?.amount||jobAmt)*0.05).toLocaleString('en-IN')}</span></div>
                    <div className="caj2-br-total">
                      <span className="caj2-br-total-l">Total payable</span>
                      <span className="caj2-br-total-r">₹{Math.round((payRequest?.amount||jobAmt)*1.05).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:'#374151', marginBottom:8 }}>Payment method</div>
                    <div className="caj2-methods-grid">
                      {PAY_METHODS.map(m => (
                        <button key={m.id} className={`caj2-meth ${payMethod===m.id?'on':''}`}
                          onClick={() => { setPayMethod(m.id); setUpiId(''); setPayError('') }}>
                          <span className="caj2-meth-ic">{m.icon}</span>
                          <div>
                            <div className="caj2-meth-lbl">{m.label}</div>
                            <div className="caj2-meth-sub">{m.sub}</div>
                          </div>
                          <div className="caj2-meth-check" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {payMethod === 'upi' && (
                    <input className="caj2-upi-in" placeholder="yourname@upi"
                      value={upiId} onChange={e => setUpiId(e.target.value)} />
                  )}
                  {payMethod === 'cash' && (
                    <div className="caj2-cash-note">
                      💵 Pay ₹{(payRequest?.amount||jobAmt).toLocaleString('en-IN')} directly to {workerName} in cash and tap confirm.
                    </div>
                  )}

                  {payError && <div className="caj2-pay-err">{payError}</div>}

                  <button className="caj2-pay-now" onClick={handlePay}
                    disabled={paying||(payMethod==='upi'&&!upiId.trim())}>
                    {payMethod==='cash' ? '✓ Confirm cash payment'
                      : `Pay ₹${Math.round((payRequest?.amount||jobAmt)*1.05).toLocaleString('en-IN')} →`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── RATING MODAL ── */}
      {showRate && (
        <div className="caj2-overlay" onClick={() => !submitting && setShowRate(false)}>
          <div className="caj2-rate-modal" onClick={e => e.stopPropagation()}>
            {rated ? (
              <div className="caj2-rate-done">
                <div style={{ fontSize:52 }}>🌟</div>
                <div style={{ fontSize:20, fontWeight:800, color:'#111827' }}>Thank you!</div>
                <div style={{ fontSize:13, color:'#6b7280' }}>Your review has been submitted and will help other customers.</div>
              </div>
            ) : (
              <>
                <div className="caj2-rate-top">
                  <div className="caj2-rate-ic">⭐</div>
                  <div className="caj2-rate-ttl">Rate {workerName}</div>
                  <div className="caj2-rate-sub">How was the work on "{job.title}"?</div>
                </div>
                <div className="caj2-rate-body">
                  <div>
                    <div className="caj2-stars">
                      {[1,2,3,4,5].map(n => (
                        <span key={n} className={`caj2-star ${n<=(hover||stars)?'lit':''}`}
                          onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                          onClick={() => setStars(n)}>★</span>
                      ))}
                    </div>
                    <div className="caj2-star-labels"><span>Poor</span><span>Excellent</span></div>
                    {stars > 0 && (
                      <div style={{ textAlign:'center', marginTop:8, fontSize:14, fontWeight:700,
                        color:['','#ef4444','#f97316','#f59e0b','#84cc16','#22c55e'][stars] }}>
                        {['','Very poor 😞','Could be better 😕','Average 😐','Good work! 😊','Excellent! 🤩'][stars]}
                      </div>
                    )}
                  </div>
                  <textarea className="caj2-review-area" rows={3}
                    placeholder={`Tell others about ${workerName}'s work… (optional)`}
                    value={reviewTxt} onChange={e => setReviewTxt(e.target.value)} />
                  <button className="caj2-submit-rate"
                    onClick={handleRate} disabled={!stars||submitting}>
                    {submitting ? '⏳ Submitting…' : `⭐ Submit ${stars>0?stars+'-star ':''} review`}
                  </button>
                  <button className="caj2-skip" onClick={() => setShowRate(false)}>Skip for now</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}