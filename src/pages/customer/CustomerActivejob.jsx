import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI, getMessagesAPI, sendMessageAPI } from '../../lib/api'

const JOB_STEPS = ['Accepted', 'On the way', 'In progress', 'Completed']
const STATUS_TO_STEP = { ACCEPTED: 1, IN_PROGRESS: 2, COMPLETED: 3 }

export default function CustomerActiveJob() {
  const navigate  = useNavigate()
  const { user }  = useAuthStore()
  const [job, setJob]           = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [stepIdx, setStepIdx]   = useState(1)
  const [loading, setLoading]   = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => {
        const active = data.find(r =>
          r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS' || r.status === 'COMPLETED'
        )
        if (active) {
          setJob(active)
          setStepIdx(STATUS_TO_STEP[active.status] ?? 1)
          if (active.status === 'COMPLETED') setShowPayment(true)
          return getMessagesAPI(active.id)
        }
      })
      .then(res => { if (res) setMessages(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!job) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000')
    socketRef.current = socket
    socket.emit('join_job', job.id)
    socket.on('new_message', msg => setMessages(m => [...m, msg]))
    socket.on('status_changed', ({ status }) => {
      const step = STATUS_TO_STEP[status] ?? stepIdx
      setStepIdx(step)
      if (status === 'COMPLETED') setShowPayment(true)
    })
    return () => socket.disconnect()
  }, [job])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || !job) return
    const text = input.trim()
    setInput('')
    try {
      const { data } = await sendMessageAPI({ jobId: job.id, text })
      socketRef.current?.emit('send_message', { ...data, jobId: job.id })
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <CustomerLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
    </CustomerLayout>
  )

  if (!job) return (
    <CustomerLayout>
      <div className="caj-done" style={{ minHeight: '50vh' }}>
        <div className="caj-done-icon">📋</div>
        <h2 className="caj-done-title">No active job</h2>
        <p className="caj-done-sub">You don't have an active job right now.</p>
        <button style={{ marginTop: 16, padding: '12px 24px', background: '#4f6ef7', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate('/customer/search')}>Find a worker →</button>
      </div>
    </CustomerLayout>
  )

  const workerName  = job.worker?.user?.name ?? 'Worker'
  const workerPhone = job.worker?.user?.phone

  return (
    <CustomerLayout>
      <div className="caj-page">

        {/* Job info bar */}
        <div className="caj-job-bar">
          <div className="caj-worker-info">
            <div className="caj-worker-avatar">{workerName[0]}</div>
            <div>
              <div className="caj-worker-name">{workerName}</div>
              <div className="caj-worker-job">{job.title}{job.budget ? ` · ₹${job.budget}` : ''}</div>
            </div>
          </div>
          {workerPhone && <a href={`tel:${workerPhone}`} className="caj-call-btn">📞 Call</a>}
        </div>

        {/* Status tracker */}
        <div className="caj-tracker">
          <div className="caj-tracker-header">
            <span className="caj-tracker-title">Job status</span>
            <span className="caj-tracker-step">{JOB_STEPS[stepIdx]}</span>
          </div>
          <div className="caj-steps">
            {JOB_STEPS.map((step, i) => (
              <div key={step} className="caj-step-wrap">
                <div className={`caj-step-dot ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <div className={`caj-step-label ${i === stepIdx ? 'current' : ''}`}>{step}</div>
                {i < JOB_STEPS.length - 1 && <div className={`caj-step-line ${i < stepIdx ? 'filled' : ''}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Pay Now button — appears when job is completed */}
        {showPayment && job.budget && (
          <div className="caj-pay-banner">
            <div className="caj-pay-info">
              <span className="caj-pay-icon">✅</span>
              <div>
                <strong>Job completed!</strong>
                <p>Please pay {workerName} for their work.</p>
              </div>
            </div>
            <button
              className="caj-pay-btn"
              onClick={() => navigate(`/customer/payment/${job.id}`)}
            >
              Pay ₹{job.budget} →
            </button>
          </div>
        )}

        {/* Chat */}
        <div className="caj-chat">
          <div className="caj-chat-header">
            <span>💬 Chat with {workerName}</span>
            <div className="caj-online-dot" />
          </div>
          <div className="caj-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '20px 0' }}>
                No messages yet. Say hello!
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`caj-msg ${msg.senderId === user?.id ? 'customer' : 'worker'}`}>
                <div className="caj-bubble">{msg.text}</div>
                <div className="caj-msg-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <div className="caj-input-row">
            <input className="caj-input" placeholder="Type a message…" value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
            <button className="caj-send" onClick={send}>➤</button>
          </div>
        </div>

      </div>
    </CustomerLayout>
  )
}