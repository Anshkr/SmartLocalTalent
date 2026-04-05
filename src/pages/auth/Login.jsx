import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { loginAPI } from '../../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const login    = useAuthStore((s) => s.login)

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [status, setStatus]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setStatus('Connecting…')
    setLoading(true)

    try {
      const { data } = await loginAPI(form)

      if (!data?.token || !data?.user) {
        setError('Server returned an unexpected response. Please try again.')
        setStatus('')
        setLoading(false)
        return
      }

      setStatus('Saving session…')
      login(data.user, data.token)

      const role = (data.user.role || '').toUpperCase()
      setStatus('Welcome back! Redirecting…')

      setTimeout(() => {
        if (role === 'WORKER')     navigate('/worker/dashboard', { replace: true })
        else if (role === 'ADMIN') navigate('/admin',            { replace: true })
        else                       navigate('/customer/home',    { replace: true })
      }, 200)

    } catch (err) {
      console.error('Login failed:', err)
      setStatus('')
      setLoading(false)

      if (!err.response) {
        setError('Cannot reach the server. It may be waking up — wait 30 seconds and try again.')
      } else if (err.response.status === 500) {
        setError('Server error (500). Please try again in a moment.')
      } else {
        setError(err.response?.data?.error || `Error ${err.response?.status}. Please try again.`)
      }
    }
  }

  const fillDemo = (email, password) => {
    setForm({ email, password })
    setError('')
    setStatus('Demo credentials filled — click Sign in')
  }

  return (
    <div className="stp-page">
      <div className="stp-card">

        <button type="button" className="stp-back"
          style={{ marginBottom: 12 }} onClick={() => navigate('/')}>
          ← Back to home
        </button>

        <div className="stp-logo">
          <div className="stp-logo-icon">S</div>
          <span>SmartTalent</span>
        </div>

        <div className="stp-section">
          <h1 className="stp-heading">Welcome back</h1>
          <p className="stp-sub">Sign in to your account</p>

          {error && <div className="stp-error">{error}</div>}

          {status && !error && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
              padding: '9px 13px', fontSize: 13, color: '#166534',
              display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                border: '2.5px solid #16a34a', borderTopColor: 'transparent',
                animation: 'loginSpin 0.7s linear infinite', display: 'inline-block'
              }} />
              {status}
            </div>
          )}

          <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>

          <form onSubmit={handleSubmit}>
            <div className="stp-fields">
              <div className="stp-field">
                <label>Email address</label>
                <input
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  required autoFocus disabled={loading}
                />
              </div>
              <div className="stp-field">
                <label>Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Your password"
                    value={form.password} onChange={e => set('password', e.target.value)}
                    required disabled={loading}
                    style={{ paddingRight: 42, width: '100%' }}
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{
                    position: 'absolute', right: 12, background: 'none',
                    border: 'none', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1
                  }}>
                    {showPw ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit" className="stp-btn primary full"
              disabled={loading} style={{ marginTop: 18 }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 6 }}>
            ⚡ First sign-in may take 30–60s (server wakes up on Render free tier)
          </p>

          {/* Only worker + customer demos — no admin demo */}
          <div className="stp-divider"><span>or try a demo account</span></div>

          <div className="demo-btns" style={{ gap: 8 }}>
            <button type="button" className="stp-btn outline half" disabled={loading}
              onClick={() => fillDemo('ramesh@demo.com', 'Worker@1234')}>
              👷 Worker demo
            </button>
            <button type="button" className="stp-btn outline half" disabled={loading}
              onClick={() => fillDemo('priya@demo.com', 'Customer@1234')}>
              👤 Customer demo
            </button>
          </div>

          <p className="stp-footer-text">
            No account yet?{' '}
            <Link to="/register" className="stp-link">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}