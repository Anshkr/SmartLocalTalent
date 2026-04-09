import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI, getMessagesAPI, sendMessageAPI, submitReviewAPI } from '../../lib/api'
import API from '../../lib/api'

const STEPS = ['Accepted', 'On the way', 'In progress', 'Completed']
const STATUS_TO_STEP = { ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 3 }

const PAYMENT_METHODS = [
  { id: 'upi',        icon: '📱', label: 'UPI',              sub: 'GPay · PhonePe · Paytm'     },
  { id: 'card',       icon: '💳', label: 'Card',             sub: 'Debit / Credit card'         },
  { id: 'netbanking', icon: '🏦', label: 'Net Banking',      sub: 'All major Indian banks'      },
  { id: 'wallet',     icon: '👛', label: 'Wallet',           sub: 'Paytm · Mobikwik · Amazon'  },
  { id: 'cash',       icon: '💵', label: 'Cash',             sub: 'Pay worker directly in cash' },
]

export default function CustomerActiveJob() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()

  const [job, setJob]           = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [stepIdx, setStepIdx]   = useState(1)
  const [loading, setLoading]   = useState(true)
  const [paid, setPaid]         = useState(false)

  // Payment modal
  const [payRequest, setPayRequest] = useState(null)  // {amount, note, jobId}
  const [showPayModal, setShowPayModal]  = useState(false)
  const [payMethod, setPayMethod]        = useState('upi')
  const [upiId, setUpiId]               = useState('')
  const [processing, setProcessing]      = useState(false)
  const [payDone, setPayDone]            = useState(false)

  // Rating modal
  const [showRating, setShowRating]  = useState(false)
  const [rating, setRating]          = useState(0)
  const [hoverStar, setHoverStar]    = useState(0)
  const [reviewText, setReviewText]  = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewDone, setReviewDone]  = useState(false)

  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    getMyRequestsAPI().then(({ data }) => {
      const active = data.find(r =>
        r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS' || r.status === 'COMPLETED'
      )
      if (active) {
        setJob(active)
        setStepIdx(STATUS_TO_STEP[active.status] ?? 1)
        if (active.status === 'COMPLETED') setShowRating(!active.review)
        return getMessagesAPI(active.id)
      }
    }).then(res => { if (res) setMessages(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!job) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['polling', 'websocket']
    })
    socketRef.current = socket
    socket.emit('join_job', job.id)
    socket.on('new_message', msg => {
      setMessages(m => [...m, msg])
      // Detect payment request from worker
      if (msg.text?.startsWith('__PAYMENT_REQUEST__')) {
        try {
          const parsed = JSON.parse(msg.text.replace('__PAYMENT_REQUEST__', ''))
          setPayRequest(parsed)
        } catch {}
      }
    })
    socket.on('status_changed', ({ status }) => {
      const step = STATUS_TO_STEP[status] ?? stepIdx
      setStepIdx(step)
      if (status === 'COMPLETED') setShowRating(true)
    })
    return () => socket.disconnect()
  }, [job])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || !job) return
    const text = input.trim(); setInput('')
    try {
      const { data } = await sendMessageAPI({ jobId: job.id, text })
      socketRef.current?.emit('send_message', { ...data, jobId: job.id })
    } catch (err) { console.error(err) }
  }

  const handlePay = async () => {
    if (payMethod === 'upi' && !upiId.trim()) return
    setProcessing(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      // Mark job completed if not already
      if (job.status !== 'COMPLETED') {
        await API.patch(`/requests/${job.id}/status`, { status: 'COMPLETED' })
      }
      socketRef.current?.emit('payment_confirmed', { jobId: job.id })
      setPayDone(true)
      setPaid(true)
      setTimeout(() => { setShowPayModal(false); setPayRequest(null) }, 2000)
    } catch { } finally { setProcessing(false) }
  }

  const handleReview = async () => {
    if (!rating || !job) return
    setSubmittingReview(true)
    try {
      await submitReviewAPI({ jobId: job.id, rating, text: reviewText })
      setReviewDone(true)
      setTimeout(() => setShowRating(false), 2000)
    } catch (err) {
      console.error(err)
    } finally { setSubmittingReview(false) }
  }

  if (loading) return (
    <CustomerLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
    </CustomerLayout>
  )

  if (!job) return (
    <CustomerLayout>
      <div style={S.empty}>
        <div style={{ fontSize: 48 }}>📋</div>
        <h2 style={S.emptyTitle}>No active job</h2>
        <p style={S.emptySub}>Find a worker and send a request to get started.</p>
        <button style={S.emptyBtn} onClick={() => navigate('/customer/search')}>Find a worker →</button>
      </div>
    </CustomerLayout>
  )

  const workerName = job.worker?.user?.name || 'Worker'

  return (
    <CustomerLayout>
      <style>{`
        .caj-page { display:flex; flex-direction:column; gap:20px; max-width:800px; }

        /* Job card */
        .caj-job { background:#fff; border-radius:18px; border:1.5px solid #e8ede9; overflow:hidden; }
        .caj-job-top { background:linear-gradient(135deg,#eef1fe,#f0fdf4); padding:20px 22px; display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; border-bottom:1px solid #e8ede9; }
        .caj-job-title  { font-size:17px; font-weight:800; color:#111917; margin-bottom:5px; }
        .caj-job-meta   { font-size:13px; color:#6b7280; display:flex; flex-direction:column; gap:3px; }
        .caj-job-budget { font-size:26px; font-weight:800; color:#1a6b4a; }
        .caj-job-blbl   { font-size:11px; color:#9ca3af; text-align:right; }

        /* Steps */
        .caj-steps { padding:20px 22px; display:flex; align-items:center; gap:0; }
        .caj-swrap { display:flex; align-items:center; flex:1; position:relative; }
        .caj-swrap:last-child { flex:0; }
        .caj-sdot { width:26px; height:26px; border-radius:50%; border:2.5px solid #e8ede9; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:#9ca3af; flex-shrink:0; transition:all .3s; }
        .caj-sdot.done   { background:#1a6b4a; border-color:#1a6b4a; color:#fff; }
        .caj-sdot.active { background:#f0fdf4; border-color:#1a6b4a; color:#1a6b4a; }
        .caj-sline { flex:1; height:2px; background:#e8ede9; margin:0 4px; }
        .caj-sline.done { background:#1a6b4a; }
        .caj-slbl { position:absolute; top:32px; left:50%; transform:translateX(-50%); font-size:10px; color:#9ca3af; white-space:nowrap; font-weight:600; }

        /* Payment request banner */
        .caj-pay-banner {
          background:linear-gradient(135deg,#fffbeb,#fef9c3);
          border:1.5px solid #fde68a; border-radius:16px; padding:20px 22px;
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
          animation: payPop .4s cubic-bezier(.34,1.56,.64,1);
        }
        @keyframes payPop { from{opacity:0;transform:scale(.95)} to{opacity:1;transform:scale(1)} }
        .caj-pay-left { display:flex; flex-direction:column; gap:4px; }
        .caj-pay-badge { font-size:11px; font-weight:700; color:#92400e; letter-spacing:1px; text-transform:uppercase; }
        .caj-pay-amt   { font-size:30px; font-weight:800; color:#d97706; letter-spacing:-1px; }
        .caj-pay-from  { font-size:13px; color:#78350f; }
        .caj-pay-note  { font-size:12px; color:#92400e; opacity:.7; margin-top:2px; }
        .caj-pay-now-btn { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:14px; padding:14px 28px; font-size:15px; font-weight:800; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 6px 18px rgba(245,158,11,.35); white-space:nowrap; }
        .caj-pay-now-btn:hover { box-shadow:0 10px 26px rgba(245,158,11,.45); transform:translateY(-2px); }
        .caj-paid-tag { display:inline-flex; align-items:center; gap:6px; background:#dcfce7; border:1.5px solid #bbf7d0; border-radius:20px; padding:8px 16px; font-size:14px; font-weight:700; color:#166534; }

        /* Review prompt */
        .caj-review-prompt { background:linear-gradient(135deg,#f0fdf4,#dcfce7); border:1.5px solid #bbf7d0; border-radius:16px; padding:20px 22px; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .caj-rp-left { display:flex; flex-direction:column; gap:4px; }
        .caj-rp-title { font-size:15px; font-weight:700; color:#166534; }
        .caj-rp-sub   { font-size:13px; color:#4b7a5a; }
        .caj-rp-btn   { background:#1a6b4a; border:none; border-radius:12px; padding:11px 22px; font-size:14px; font-weight:700; color:#fff; cursor:pointer; transition:all .15s; }
        .caj-rp-btn:hover { background:#134d35; }

        /* Chat */
        .caj-chat { background:#fff; border-radius:18px; border:1.5px solid #e8ede9; overflow:hidden; display:flex; flex-direction:column; }
        .caj-chat-hdr { padding:16px 20px; border-bottom:1px solid #f0f4f1; display:flex; align-items:center; gap:10px; }
        .caj-chat-av  { width:38px; height:38px; border-radius:50%; background:#1a6b4a; color:#fff; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; flex-shrink:0; }
        .caj-chat-name { font-size:14px; font-weight:700; color:#111917; }
        .caj-chat-sub  { font-size:12px; color:#9ca3af; }
        .caj-online  { width:8px; height:8px; border-radius:50%; background:#22c55e; margin-left:auto; }
        .caj-msgs { height:300px; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; background:#fafbfa; }
        .caj-row { display:flex; }
        .caj-row.mine { justify-content:flex-end; }
        .caj-bubble { max-width:72%; padding:10px 14px; border-radius:14px; font-size:14px; line-height:1.5; }
        .caj-bubble.theirs { background:#fff; border:1.5px solid #e8ede9; color:#111917; border-bottom-left-radius:4px; }
        .caj-bubble.mine   { background:#4f6ef7; color:#fff; border-bottom-right-radius:4px; }
        .caj-btime { font-size:10px; opacity:.55; margin-top:4px; }

        /* Inline payment-request card in chat */
        .caj-pay-card { background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1.5px solid #fde68a; border-radius:14px; padding:14px 16px; max-width:82%; cursor:pointer; transition:all .15s; }
        .caj-pay-card:hover { box-shadow:0 4px 14px rgba(245,158,11,.25); }
        .caj-pay-card-hdr { font-size:11px; font-weight:800; color:#92400e; letter-spacing:1px; text-transform:uppercase; margin-bottom:6px; display:flex; align-items:center; gap:6px; }
        .caj-pay-card-amt  { font-size:24px; font-weight:800; color:#d97706; letter-spacing:-1px; }
        .caj-pay-card-note { font-size:12px; color:#78350f; margin-top:4px; opacity:.8; }
        .caj-pay-card-cta  { margin-top:10px; background:#f59e0b; border:none; border-radius:9px; padding:8px 16px; font-size:13px; font-weight:700; color:#fff; cursor:pointer; display:inline-block; }
        .caj-pay-card-paid { margin-top:8px; font-size:12px; color:#166534; font-weight:700; display:flex; align-items:center; gap:5px; }

        .caj-input-row { display:flex; gap:10px; padding:14px; border-top:1px solid #f0f4f1; background:#fff; }
        .caj-input { flex:1; padding:11px 14px; border-radius:12px; border:1.5px solid #e8ede9; font-size:14px; outline:none; transition:border-color .15s; }
        .caj-input:focus { border-color:#4f6ef7; }
        .caj-send  { width:44px; height:44px; border-radius:12px; border:none; background:#4f6ef7; color:#fff; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; }

        /* Payment modal */
        .caj-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
        .caj-modal { background:#fff; border-radius:22px; max-width:440px; width:100%; overflow:hidden; max-height:92vh; overflow-y:auto; box-shadow:0 32px 80px rgba(0,0,0,.2); animation:cajIn .25s cubic-bezier(.34,1.56,.64,1); }
        @keyframes cajIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        .caj-modal-top { background:linear-gradient(135deg,#1c1a0e,#3a2a00); padding:24px; position:relative; }
        .caj-modal-x { position:absolute; top:12px; right:12px; width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,.1); border:none; color:rgba(255,255,255,.7); font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .caj-modal-x:hover { background:rgba(255,255,255,.2); color:#fff; }
        .caj-modal-tag  { font-size:11px; font-weight:700; color:rgba(253,224,71,.8); letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
        .caj-modal-amt  { font-size:40px; font-weight:800; color:#fde047; letter-spacing:-2px; }
        .caj-modal-from { font-size:13px; color:rgba(255,255,255,.5); margin-top:5px; }
        .caj-modal-body { padding:22px; display:flex; flex-direction:column; gap:16px; }
        .caj-mlabel { font-size:13px; font-weight:700; color:#374151; margin-bottom:8px; }
        .caj-methods { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
        .caj-meth { display:flex; align-items:center; gap:10px; padding:12px 13px; border-radius:12px; border:2px solid #e8ede9; background:#fff; cursor:pointer; text-align:left; transition:all .15s; }
        .caj-meth:hover { border-color:#f59e0b; }
        .caj-meth.on { border-color:#f59e0b; background:#fffbeb; }
        .caj-meth-ic { font-size:20px; flex-shrink:0; }
        .caj-meth-lbl { font-size:13px; font-weight:700; color:#111827; }
        .caj-meth-sub { font-size:11px; color:#9ca3af; }
        .caj-check { width:16px; height:16px; border-radius:50%; border:2px solid #d1d5db; margin-left:auto; flex-shrink:0; transition:all .15s; }
        .caj-meth.on .caj-check { border-color:#f59e0b; background:#f59e0b; box-shadow:inset 0 0 0 3px #fff; }
        .caj-upi-in { width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e8ede9; font-size:15px; outline:none; transition:border-color .15s; }
        .caj-upi-in:focus { border-color:#f59e0b; }
        .caj-pay-btn { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:13px; padding:15px; width:100%; font-size:16px; font-weight:800; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 6px 20px rgba(245,158,11,.35); }
        .caj-pay-btn:hover:not(:disabled) { box-shadow:0 10px 28px rgba(245,158,11,.45); transform:translateY(-1px); }
        .caj-pay-btn:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; transform:none; }
        .caj-pay-done { display:flex; flex-direction:column; align-items:center; gap:14px; padding:30px 20px; text-align:center; }
        .caj-pay-done-ic  { font-size:56px; animation:popIn .4s cubic-bezier(.34,1.56,.64,1); }
        .caj-pay-done-ttl { font-size:22px; font-weight:800; color:#111827; }
        .caj-pay-done-sub { font-size:14px; color:#6b7280; }
        @keyframes popIn { from{transform:scale(.3);opacity:0} to{transform:scale(1);opacity:1} }
        .caj-proc { display:flex; flex-direction:column; align-items:center; gap:16px; padding:40px 20px; }
        .caj-proc-spin { width:56px; height:56px; border-radius:50%; border:4px solid #fef3c7; border-top-color:#f59e0b; animation:spin .8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }

        /* Rating modal */
        .caj-rate-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9998; padding:20px; }
        .caj-rate-modal { background:#fff; border-radius:22px; max-width:400px; width:100%; padding:0; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.2); animation:cajIn .3s cubic-bezier(.34,1.56,.64,1); }
        .caj-rate-top { background:linear-gradient(135deg,#fffbeb,#fef3c7); padding:28px 28px 22px; text-align:center; border-bottom:1px solid #fde68a; }
        .caj-rate-ic  { font-size:48px; margin-bottom:8px; }
        .caj-rate-ttl { font-size:20px; font-weight:800; color:#111827; }
        .caj-rate-sub { font-size:13px; color:#6b7280; margin-top:4px; }
        .caj-rate-body { padding:24px; display:flex; flex-direction:column; gap:18px; }
        .caj-stars { display:flex; gap:6px; justify-content:center; }
        .caj-star { font-size:44px; cursor:pointer; transition:transform .15s; filter:grayscale(1); }
        .caj-star:hover, .caj-star.lit { filter:none; transform:scale(1.1); }
        .caj-rate-labels { display:flex; justify-content:space-between; font-size:12px; color:#9ca3af; margin-top:-10px; }
        .caj-review-area { width:100%; padding:12px 14px; border-radius:12px; border:2px solid #e8ede9; font-size:14px; resize:none; outline:none; font-family:inherit; transition:border-color .15s; }
        .caj-review-area:focus { border-color:#f59e0b; }
        .caj-submit-rate { background:linear-gradient(135deg,#f59e0b,#d97706); border:none; border-radius:13px; padding:14px; width:100%; font-size:15px; font-weight:800; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 5px 18px rgba(245,158,11,.3); }
        .caj-submit-rate:hover:not(:disabled) { box-shadow:0 9px 26px rgba(245,158,11,.4); transform:translateY(-1px); }
        .caj-submit-rate:disabled { opacity:.5; cursor:not-allowed; box-shadow:none; transform:none; }
        .caj-skip-rate { background:none; border:none; color:#9ca3af; font-size:13px; cursor:pointer; text-align:center; padding:4px; }
        .caj-rate-done { display:flex; flex-direction:column; align-items:center; gap:12px; padding:32px; text-align:center; }
        .caj-rate-done-ic  { font-size:52px; animation:popIn .4s cubic-bezier(.34,1.56,.64,1); }
        .caj-rate-done-ttl { font-size:20px; font-weight:800; color:#111827; }
        .caj-rate-done-sub { font-size:13px; color:#6b7280; }
      `}</style>

      <div className="caj-page">

        {/* Job card */}
        <div className="caj-job">
          <div className="caj-job-top">
            <div>
              <div className="caj-job-title">{job.title}</div>
              <div className="caj-job-meta">
                <span>👷 {workerName}</span>
                <span>📍 {job.address}</span>
                {job.urgency && <span>⚡ {job.urgency}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="caj-job-budget">₹{(job.budget || 0).toLocaleString('en-IN')}</div>
              <div className="caj-job-blbl">Job budget</div>
            </div>
          </div>

          <div className="caj-steps">
            {STEPS.map((label, i) => (
              <div key={label} className="caj-swrap">
                <div className={`caj-sdot ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <div className="caj-slbl">{label}</div>
                {i < STEPS.length - 1 && (
                  <div className={`caj-sline ${i < stepIdx ? 'done' : ''}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Payment request banner — appears when worker sends payment request */}
        {payRequest && !paid && (
          <div className="caj-pay-banner">
            <div className="caj-pay-left">
              <div className="caj-pay-badge">💳 Payment requested by {workerName}</div>
              <div className="caj-pay-amt">₹{payRequest.amount.toLocaleString('en-IN')}</div>
              {payRequest.note && <div className="caj-pay-note">{payRequest.note}</div>}
            </div>
            <button className="caj-pay-now-btn" onClick={() => setShowPayModal(true)}>
              Pay now →
            </button>
          </div>
        )}

        {paid && (
          <div className="caj-pay-banner" style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #bbf7d0' }}>
            <div className="caj-paid-tag">✅ Payment of ₹{payRequest?.amount?.toLocaleString('en-IN') || job.budget?.toLocaleString('en-IN')} sent successfully!</div>
          </div>
        )}

        {/* Review prompt */}
        {stepIdx >= 3 && !reviewDone && !showRating && (
          <div className="caj-review-prompt">
            <div className="caj-rp-left">
              <div className="caj-rp-title">Rate {workerName}'s work</div>
              <div className="caj-rp-sub">Help other customers by leaving a review</div>
            </div>
            <button className="caj-rp-btn" onClick={() => setShowRating(true)}>⭐ Leave a review</button>
          </div>
        )}

        {/* Chat */}
        <div className="caj-chat">
          <div className="caj-chat-hdr">
            <div className="caj-chat-av">{workerName[0]}</div>
            <div>
              <div className="caj-chat-name">{workerName}</div>
              <div className="caj-chat-sub">Worker · Job chat</div>
            </div>
            <div className="caj-online" />
          </div>

          <div className="caj-msgs">
            {messages.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, padding:'20px 0' }}>
                Chat with {workerName} about the job
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id

              // Payment request card in chat
              if (msg.text?.startsWith('__PAYMENT_REQUEST__')) {
                try {
                  const parsed = JSON.parse(msg.text.replace('__PAYMENT_REQUEST__', ''))
                  return (
                    <div key={i} className="caj-row">
                      <div className="caj-pay-card" onClick={() => !paid && setShowPayModal(true)}>
                        <div className="caj-pay-card-hdr">💳 Payment request from {workerName}</div>
                        <div className="caj-pay-card-amt">₹{parsed.amount.toLocaleString('en-IN')}</div>
                        {parsed.note && <div className="caj-pay-card-note">{parsed.note}</div>}
                        {paid
                          ? <div className="caj-pay-card-paid">✅ Paid</div>
                          : <button className="caj-pay-card-cta">Tap to pay →</button>
                        }
                      </div>
                    </div>
                  )
                } catch { return null }
              }

              return (
                <div key={i} className={`caj-row ${isMe ? 'mine' : ''}`}>
                  <div className={`caj-bubble ${isMe ? 'mine' : 'theirs'}`}>
                    {msg.text}
                    <div className="caj-btime">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="caj-input-row">
            <input className="caj-input" placeholder="Type a message…"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="caj-send" onClick={send}>↑</button>
          </div>
        </div>

      </div>

      {/* ── PAYMENT MODAL ── */}
      {showPayModal && (
        <div className="caj-overlay" onClick={() => !processing && setShowPayModal(false)}>
          <div className="caj-modal" onClick={e => e.stopPropagation()}>

            {!processing && !payDone ? (
              <>
                <div className="caj-modal-top">
                  <button className="caj-modal-x" onClick={() => setShowPayModal(false)}>✕</button>
                  <div className="caj-modal-tag">Pay {workerName}</div>
                  <div className="caj-modal-amt">₹{(payRequest?.amount || job.budget || 0).toLocaleString('en-IN')}</div>
                  <div className="caj-modal-from">Requested by {workerName}</div>
                </div>
                <div className="caj-modal-body">
                  <div>
                    <div className="caj-mlabel">Choose payment method</div>
                    <div className="caj-methods">
                      {PAYMENT_METHODS.map(m => (
                        <button key={m.id} className={`caj-meth ${payMethod===m.id?'on':''}`}
                          onClick={() => { setPayMethod(m.id); setUpiId('') }}>
                          <span className="caj-meth-ic">{m.icon}</span>
                          <div>
                            <div className="caj-meth-lbl">{m.label}</div>
                            <div className="caj-meth-sub">{m.sub}</div>
                          </div>
                          <div className="caj-check" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {payMethod === 'upi' && (
                    <div>
                      <div className="caj-mlabel">Your UPI ID</div>
                      <input className="caj-upi-in" placeholder="yourname@upi"
                        value={upiId} onChange={e => setUpiId(e.target.value)} />
                    </div>
                  )}
                  {payMethod === 'cash' && (
                    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:12, padding:'14px 16px', fontSize:13, color:'#166534' }}>
                      💵 Pay ₹{(payRequest?.amount||job.budget||0).toLocaleString('en-IN')} directly to {workerName} in cash. Tap confirm below to mark it as done.
                    </div>
                  )}

                  <button className="caj-pay-btn" onClick={handlePay}
                    disabled={processing || (payMethod==='upi' && !upiId.trim())}>
                    {payMethod === 'cash' ? '✓ Confirm cash payment' : `Pay ₹${(payRequest?.amount||job.budget||0).toLocaleString('en-IN')} →`}
                  </button>
                </div>
              </>
            ) : processing ? (
              <div className="caj-proc">
                <div className="caj-proc-spin" />
                <div style={{ fontWeight:700, fontSize:16, color:'#111827' }}>Processing payment…</div>
                <div style={{ fontSize:13, color:'#9ca3af' }}>Please don't close this window.</div>
              </div>
            ) : (
              <div className="caj-pay-done">
                <div className="caj-pay-done-ic">🎉</div>
                <div className="caj-pay-done-ttl">Payment sent!</div>
                <div className="caj-pay-done-sub">
                  ₹{(payRequest?.amount||job.budget||0).toLocaleString('en-IN')} sent to {workerName}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RATING MODAL ── */}
      {showRating && (
        <div className="caj-rate-overlay" onClick={() => !submittingReview && setShowRating(false)}>
          <div className="caj-rate-modal" onClick={e => e.stopPropagation()}>
            {reviewDone ? (
              <div className="caj-rate-done">
                <div className="caj-rate-done-ic">⭐</div>
                <div className="caj-rate-done-ttl">Thank you!</div>
                <div className="caj-rate-done-sub">Your review helps other customers find great workers.</div>
              </div>
            ) : (
              <>
                <div className="caj-rate-top">
                  <div className="caj-rate-ic">⭐</div>
                  <div className="caj-rate-ttl">Rate {workerName}</div>
                  <div className="caj-rate-sub">How was the work on "{job.title}"?</div>
                </div>
                <div className="caj-rate-body">
                  <div>
                    <div className="caj-stars">
                      {[1,2,3,4,5].map(n => (
                        <span key={n}
                          className={`caj-star ${n <= (hoverStar || rating) ? 'lit' : ''}`}
                          onMouseEnter={() => setHoverStar(n)}
                          onMouseLeave={() => setHoverStar(0)}
                          onClick={() => setRating(n)}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="caj-rate-labels">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                    {rating > 0 && (
                      <div style={{ textAlign:'center', marginTop:6, fontSize:15, fontWeight:700, color:['','#ef4444','#f97316','#f59e0b','#84cc16','#22c55e'][rating] }}>
                        {['','Very poor','Could be better','Average','Good work!','Excellent! '][rating]}
                      </div>
                    )}
                  </div>

                  <textarea className="caj-review-area" rows={3}
                    placeholder={`Tell others about ${workerName}'s work… (optional)`}
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                  />

                  <button className="caj-submit-rate"
                    onClick={handleReview}
                    disabled={!rating || submittingReview}>
                    {submittingReview ? '⏳ Submitting…' : '⭐ Submit review'}
                  </button>
                  <button className="caj-skip-rate" onClick={() => setShowRating(false)}>
                    Skip for now
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}

const S = {
  empty:     { display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'80px 20px', textAlign:'center' },
  emptyTitle:{ fontSize:20, fontWeight:700, color:'#111917' },
  emptySub:  { fontSize:14, color:'#9ca3af' },
  emptyBtn:  { marginTop:12, padding:'11px 24px', background:'#4f6ef7', color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14 },
}