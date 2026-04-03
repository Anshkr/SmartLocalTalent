import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI, updateStatusAPI } from '../../lib/api'

// Payment methods
const METHODS = [
  { id: 'upi',   label: 'UPI',           icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
  { id: 'card',  label: 'Debit/Credit Card', icon: '💳', desc: 'Visa, Mastercard, RuPay'   },
  { id: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'All major banks'             },
  { id: 'wallet', label: 'Wallet',        icon: '👛', desc: 'Paytm, Mobikwik, Amazon Pay' },
  { id: 'cash',  label: 'Cash on delivery', icon: '💵', desc: 'Pay worker directly in cash' },
]

export default function PaymentPage() {
  const { jobId }  = useParams()
  const navigate   = useNavigate()
  const [job, setJob]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [method, setMethod]     = useState('upi')
  const [upiId, setUpiId]       = useState('')
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid]         = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    getMyRequestsAPI()
      .then(({ data }) => {
        const found = data.find(r => r.id === jobId)
        if (found) setJob(found)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [jobId])

  const platformFee = job?.budget ? Math.round(job.budget * 0.05) : 0
  const total       = job?.budget ? job.budget + platformFee : 0

  const handlePay = async () => {
    if (method === 'upi' && !upiId.trim()) {
      setError('Please enter your UPI ID')
      return
    }
    setError('')
    setProcessing(true)

    try {
      // Simulate payment processing (2 seconds)
      await new Promise(r => setTimeout(r, 2000))

      // Mark job as COMPLETED after payment
      await updateStatusAPI(jobId, 'COMPLETED')
      setPaid(true)
    } catch (err) {
      setError('Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return (
    <CustomerLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading payment…</div>
    </CustomerLayout>
  )

  if (!job) return (
    <CustomerLayout>
      <div style={{ padding: 40 }}>
        <p style={{ color: '#ef4444' }}>Job not found.</p>
        <button onClick={() => navigate('/customer/requests')} style={{ marginTop: 12, color: '#4f6ef7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          ← Back to requests
        </button>
      </div>
    </CustomerLayout>
  )

  if (paid) return (
    <CustomerLayout>
      <div className="pay-success">
        <div className="pay-success-icon">🎉</div>
        <h2 className="pay-success-title">Payment successful!</h2>
        <p className="pay-success-sub">
          ₹{job.budget} paid to <strong>{job.worker?.user?.name}</strong>
        </p>
        <div className="pay-success-receipt">
          <div className="pay-receipt-row"><span>Job</span><strong>{job.title}</strong></div>
          <div className="pay-receipt-row"><span>Worker</span><strong>{job.worker?.user?.name}</strong></div>
          <div className="pay-receipt-row"><span>Amount</span><strong>₹{job.budget}</strong></div>
          <div className="pay-receipt-row"><span>Platform fee</span><strong>₹{platformFee}</strong></div>
          <div className="pay-receipt-row total"><span>Total paid</span><strong>₹{total}</strong></div>
          <div className="pay-receipt-row"><span>Payment method</span><strong>{METHODS.find(m => m.id === method)?.label}</strong></div>
          <div className="pay-receipt-row"><span>Transaction ID</span><strong>STP{Date.now().toString().slice(-8)}</strong></div>
        </div>
        <div className="pay-success-btns">
          <button className="pay-btn outline" onClick={() => navigate('/customer/orders')}>View orders</button>
          <button className="pay-btn primary" onClick={() => navigate('/customer/search')}>Find another worker →</button>
        </div>
      </div>
    </CustomerLayout>
  )

  return (
    <CustomerLayout>
      <div className="pay-page">

        <button className="pay-back" onClick={() => navigate('/customer/active')}>← Back to job</button>

        <div className="pay-header">
          <h1 className="pay-title">Complete payment</h1>
          <p className="pay-sub">Pay {job.worker?.user?.name} for completing the job</p>
        </div>

        {/* Job summary */}
        <div className="pay-job-card">
          <div className="pay-job-avatar">{job.worker?.user?.name?.[0]}</div>
          <div className="pay-job-info">
            <div className="pay-job-name">{job.title}</div>
            <div className="pay-job-worker">👷 {job.worker?.user?.name}</div>
            <div className="pay-job-addr">📍 {job.address}</div>
          </div>
          <div className="pay-job-amount">₹{job.budget || 'As agreed'}</div>
        </div>

        {/* Amount breakdown */}
        <div className="pay-breakdown">
          <div className="pay-break-row"><span>Job amount</span><span>₹{job.budget || 0}</span></div>
          <div className="pay-break-row"><span>Platform fee (5%)</span><span>₹{platformFee}</span></div>
          <div className="pay-break-row total"><span>Total</span><strong>₹{total}</strong></div>
        </div>

        {/* Payment method selection */}
        <div className="pay-methods">
          <div className="pay-methods-title">Select payment method</div>
          {METHODS.map(m => (
            <div
              key={m.id}
              className={`pay-method-card ${method === m.id ? 'active' : ''}`}
              onClick={() => setMethod(m.id)}
            >
              <div className="pay-method-icon">{m.icon}</div>
              <div className="pay-method-info">
                <div className="pay-method-label">{m.label}</div>
                <div className="pay-method-desc">{m.desc}</div>
              </div>
              <div className={`pay-method-radio ${method === m.id ? 'selected' : ''}`} />
            </div>
          ))}
        </div>

        {/* UPI input */}
        {method === 'upi' && (
          <div className="pay-upi-input">
            <label>Enter UPI ID</label>
            <input
              placeholder="yourname@upi"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
            />
          </div>
        )}

        {/* Card input */}
        {method === 'card' && (
          <div className="pay-card-form">
            <div className="pay-field">
              <label>Card number</label>
              <input placeholder="1234 5678 9012 3456" maxLength={19} />
            </div>
            <div className="pay-field-row">
              <div className="pay-field">
                <label>Expiry</label>
                <input placeholder="MM/YY" maxLength={5} />
              </div>
              <div className="pay-field">
                <label>CVV</label>
                <input placeholder="123" maxLength={3} type="password" />
              </div>
            </div>
            <div className="pay-field">
              <label>Name on card</label>
              <input placeholder="RAHUL SHARMA" />
            </div>
          </div>
        )}

        {/* Cash info */}
        {method === 'cash' && (
          <div className="pay-cash-note">
            <span>💵</span>
            <p>Please pay <strong>₹{job.budget}</strong> directly to <strong>{job.worker?.user?.name}</strong> in cash after the job is done. The job will be marked as completed.</p>
          </div>
        )}

        {error && <div className="pay-error">{error}</div>}

        <button
          className="pay-submit"
          onClick={handlePay}
          disabled={processing}
        >
          {processing
            ? <span className="pay-processing">Processing payment… <span className="pay-spinner">⏳</span></span>
            : method === 'cash'
              ? `Confirm cash payment of ₹${job.budget}`
              : `Pay ₹${total} now`}
        </button>

        <p className="pay-secure">🔒 Payments are secure and encrypted</p>

      </div>
    </CustomerLayout>
  )
}