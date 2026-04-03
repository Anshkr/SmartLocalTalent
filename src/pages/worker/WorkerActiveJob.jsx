import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import useAuthStore from '../../store/authStore'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { getMyRequestsAPI, updateStatusAPI, getMessagesAPI, sendMessageAPI } from '../../lib/api'

const JOB_STEPS = ['Accepted', 'On the way', 'In progress', 'Completed']
const STEP_TO_STATUS = ['ACCEPTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED']

export default function WorkerActiveJob() {
  const { user }  = useAuthStore()
  const navigate  = useNavigate()
  const [job, setJob]           = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [stepIdx, setStepIdx]   = useState(1)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [advancing, setAdvancing] = useState(false)
  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  // Load active job
  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => {
        const active = data.find((r) =>
          r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS'
        )
        if (active) {
          setJob(active)
          setStepIdx(active.status === 'IN_PROGRESS' ? 2 : 1)
          return getMessagesAPI(active.id)
        }
      })
      .then((res) => { if (res) setMessages(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Socket.io
  useEffect(() => {
    if (!job) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })
    socketRef.current = socket
    socket.emit('join_job', job.id)

    socket.on('new_message', (msg) => {
      setMessages((m) => [...m, msg])
    })

    return () => socket.disconnect()
  }, [job])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || !job) return
    const text = input.trim()
    setInput('')
    try {
      const { data } = await sendMessageAPI({ jobId: job.id, text })
      socketRef.current?.emit('send_message', { ...data, jobId: job.id })
    } catch (err) { console.error(err) }
  }

  const advance = async () => {
    if (!job || advancing) return
    setAdvancing(true)
    const next = stepIdx + 1
    try {
      if (next >= JOB_STEPS.length) {
        // Mark completed
        await updateStatusAPI(job.id, 'COMPLETED')
        socketRef.current?.emit('job_status_update', { jobId: job.id, status: 'COMPLETED' })
        setCompleted(true)
      } else {
        await updateStatusAPI(job.id, STEP_TO_STATUS[next])
        socketRef.current?.emit('job_status_update', { jobId: job.id, status: STEP_TO_STATUS[next] })
        setStepIdx(next)
      }
    } catch (err) { console.error(err) }
    finally { setAdvancing(false) }
  }

  if (loading) return (
    <WorkerLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading active job…</div>
    </WorkerLayout>
  )

  if (!job) return (
    <WorkerLayout>
      <div className="waj-done" style={{ minHeight: '50vh' }}>
        <div className="waj-done-icon">📋</div>
        <h2 className="waj-done-title">No active job</h2>
        <p className="waj-done-sub">Accept a request to start your first job.</p>
        <button
          style={{ marginTop: 16, padding: '12px 24px', background: '#1a6b4a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          onClick={() => navigate('/worker/requests')}
        >
          View requests →
        </button>
      </div>
    </WorkerLayout>
  )

  if (completed) return (
    <WorkerLayout>
      <div className="waj-done">
        <div className="waj-done-icon">🎉</div>
        <h2 className="waj-done-title">Job completed!</h2>
        <p className="waj-done-sub">Waiting for {job.customer?.name} to confirm and leave a review.</p>
        <div className="waj-done-earnings">
          <span>Your earnings for this job</span>
          <strong>{job.budget ? `₹${job.budget}` : 'As agreed'}</strong>
        </div>
        <button
          style={{ marginTop: 20, padding: '12px 24px', background: '#1a6b4a', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
          onClick={() => navigate('/worker/dashboard')}
        >
          Go to dashboard
        </button>
      </div>
    </WorkerLayout>
  )

  const customerName  = job.customer?.name ?? 'Customer'
  const customerPhone = job.customer?.phone

  return (
    <WorkerLayout>
      <div className="waj-page">

        {/* Job info bar */}
        <div className="waj-job-bar">
          <div className="waj-customer">
            <div className="waj-cust-avatar">{customerName[0]}</div>
            <div>
              <div className="waj-cust-name">{customerName}</div>
              <div className="waj-cust-job">{job.title} {job.budget ? `· ₹${job.budget}` : ''}</div>
            </div>
          </div>
          {customerPhone && (
            <a href={`tel:${customerPhone}`} className="waj-call-btn">📞 Call</a>
          )}
        </div>

        {/* Progress tracker */}
        <div className="waj-progress">
          {JOB_STEPS.map((step, i) => (
            <div key={step} className="waj-step-wrap">
              <div className={`waj-step-dot ${i <= stepIdx ? 'done' : ''} ${i === stepIdx ? 'active' : ''}`}>
                {i < stepIdx ? '✓' : i + 1}
              </div>
              <div className={`waj-step-label ${i === stepIdx ? 'current' : ''}`}>{step}</div>
              {i < JOB_STEPS.length - 1 && (
                <div className={`waj-step-line ${i < stepIdx ? 'done' : ''}`} />
              )}
            </div>
          ))}
        </div>

        <button className="waj-advance-btn" onClick={advance} disabled={advancing}>
          {advancing
            ? 'Updating…'
            : stepIdx === JOB_STEPS.length - 1
              ? '✅ Mark as completed'
              : `Mark as: ${JOB_STEPS[stepIdx + 1]} →`}
        </button>

        {/* Live Chat */}
        <div className="waj-chat">
          <div className="waj-chat-header">
            <span>💬 Chat with {customerName}</span>
            <div className="waj-online-dot" />
          </div>

          <div className="waj-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '20px 0' }}>
                No messages yet. Say hello to {customerName}!
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`waj-msg ${msg.senderId === user?.id ? 'worker' : 'customer'}`}>
                <div className="waj-bubble">{msg.text}</div>
                <div className="waj-msg-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="waj-input-row">
            <input
              className="waj-input"
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button className="waj-send" onClick={send}>➤</button>
          </div>
        </div>

      </div>
    </WorkerLayout>
  )
}