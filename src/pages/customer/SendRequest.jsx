import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getWorkerAPI, sendRequestAPI } from '../../lib/api'

const URGENCY_OPTIONS = [
  { value: 'today',     label: 'Today',     desc: 'As soon as possible' },
  { value: 'tomorrow',  label: 'Tomorrow',  desc: 'Flexible on timing'  },
  { value: 'this-week', label: 'This week', desc: 'Any day this week'   },
]

export default function SendRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [worker, setWorker]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')
  const [form, setForm] = useState({ title:'', description:'', urgency:'today', address:'', budget:'' })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  useEffect(() => {
    getWorkerAPI(id).then(({ data }) => setWorker(data)).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await sendRequestAPI({
        workerId: id,
        title: form.title,
        description: form.description,
        urgency: form.urgency,
        address: form.address,
        budget: form.budget ? parseInt(form.budget) : null,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <CustomerLayout><div style={{padding:40}}>Loading…</div></CustomerLayout>
  if (!worker) return <CustomerLayout><div style={{padding:40}}>Worker not found.</div></CustomerLayout>

  if (submitted) {
    return (
      <CustomerLayout>
        <div className="sr-success">
          <div className="sr-success-icon">✅</div>
          <h2 className="sr-success-title">Request sent!</h2>
          <p className="sr-success-sub">Your request has been sent to <strong>{worker.user?.name}</strong>. They will respond shortly.</p>
          <div className="sr-success-card">
            <div className="sr-sc-row"><span>Job</span><strong>{form.title}</strong></div>
            <div className="sr-sc-row"><span>Worker</span><strong>{worker.user?.name}</strong></div>
            <div className="sr-sc-row"><span>Urgency</span><strong>{form.urgency}</strong></div>
            <div className="sr-sc-row"><span>Budget</span><strong>{form.budget ? `₹${form.budget}` : 'Open'}</strong></div>
          </div>
          <div className="sr-success-btns">
            <button className="sr-btn outline" onClick={() => navigate('/customer/requests')}>View my requests</button>
            <button className="sr-btn primary" onClick={() => navigate('/customer/active')}>Go to active job →</button>
          </div>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="sr-page">
        <button className="sr-back" onClick={() => navigate(`/customer/worker/${id}`)}>← Back to profile</button>
        <div className="sr-header">
          <h1 className="sr-title">Send job request</h1>
          <p className="sr-sub">Fill in the details and {worker.user?.name} will accept or decline.</p>
        </div>

        <div className="sr-worker-bar">
          <div className="sr-worker-avatar">{worker.user?.name?.[0]}</div>
          <div>
            <div className="sr-worker-name">{worker.user?.name}</div>
            <div className="sr-worker-meta">{worker.skills?.join(' · ')} · ₹{worker.rate}/hr · ⭐{worker.rating?.toFixed(1)}</div>
          </div>
          <div className={`sr-online-dot ${worker.isOnline ? 'on' : ''}`} />
        </div>

        {error && <div className="stp-error">{error}</div>}

        <form onSubmit={handleSubmit} className="sr-form">
          <div className="sr-field">
            <label>Job title <span className="sr-req">*</span></label>
            <input placeholder="e.g. Paint two bedroom walls" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="sr-field">
            <label>Job description <span className="sr-req">*</span></label>
            <textarea rows={4} placeholder="Describe what needs to be done…" value={form.description} onChange={(e) => set('description', e.target.value)} required />
          </div>
          <div className="sr-field">
            <label>When do you need it?</label>
            <div className="sr-urgency-grid">
              {URGENCY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button"
                  className={`sr-urgency-card ${form.urgency === opt.value ? 'active' : ''}`}
                  onClick={() => set('urgency', opt.value)}>
                  <div className="sr-urg-label">{opt.label}</div>
                  <div className="sr-urg-desc">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="sr-field">
            <label>Your address <span className="sr-req">*</span></label>
            <input placeholder="e.g. House 12, Sector 29, Gurugram" value={form.address} onChange={(e) => set('address', e.target.value)} required />
          </div>
          <div className="sr-field">
            <label>Your budget (₹) <span className="sr-hint">optional</span></label>
            <input type="number" placeholder="Leave blank to use worker's rate" value={form.budget} onChange={(e) => set('budget', e.target.value)} min="0" />
          </div>
          <button type="submit" className="sr-submit" disabled={submitting}>
            {submitting ? 'Sending…' : `Send request to ${worker.user?.name} →`}
          </button>
        </form>
      </div>
    </CustomerLayout>
  )
}