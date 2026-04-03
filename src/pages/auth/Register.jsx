import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import { registerAPI } from '../../lib/api'
import API from '../../lib/api'

const SKILLS = [
  'Painter','Carpenter','Plumber','Electrician',
  'Gardener','Driver','Sweeper','Mason',
  'Welder','AC Repair','Cook','Security Guard',
]

export default function Register() {
  const navigate = useNavigate()
  const login    = useAuthStore(s => s.login)

  // Steps: 1=role, 2=details, 3=worker-profile, 4=totp-setup
  const [step, setStep]   = useState(1)
  const [role, setRole]   = useState('')
  const [form, setForm]   = useState({
    name: '', email: '', password: '', phone: '',
    skills: [], area: '', rate: '', bio: '',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)

  // TOTP state
  const [totpSecret, setTotpSecret] = useState('')
  const [totpQR, setTotpQR]         = useState('')
  const [totpCode, setTotpCode]     = useState('')
  const [totpVerified, setTotpVerified] = useState(false)
  const [verifying, setVerifying]   = useState(false)
  const [registeredUser, setRegisteredUser] = useState(null)
  const [registeredToken, setRegisteredToken] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggleSkill = s => setForm(f => ({
    ...f, skills: f.skills.includes(s) ? f.skills.filter(x => x !== s) : [...f.skills, s]
  }))

  /* ── Step 2/3 submit → register → get TOTP QR ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const { data } = await registerAPI({ ...form, role })
      // Save user+token for after TOTP setup
      setRegisteredUser(data.user)
      setRegisteredToken(data.token)
      // Generate TOTP secret from backend
      const totpRes = await API.post('/auth/setup-totp', {}, {
        headers: { Authorization: `Bearer ${data.token}` }
      })
      setTotpSecret(totpRes.data.secret)
      setTotpQR(totpRes.data.qrCodeUrl)
      setStep(4)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
      setStep(role === 'worker' ? 3 : 2)
    } finally { setLoading(false) }
  }

  /* ── Step 4: verify TOTP code, then enter app ── */
  const verifyAndEnter = async () => {
    if (totpCode.length !== 6) return
    setVerifying(true); setError('')
    try {
      await API.post('/auth/verify-totp', { totpCode }, {
        headers: { Authorization: `Bearer ${registeredToken}` }
      })
      setTotpVerified(true)
      setTimeout(() => {
        login(registeredUser, registeredToken)
        navigate(role === 'worker' ? '/worker/dashboard' : '/customer/home')
      }, 1500)
    } catch {
      setError('Incorrect code. Please try again.')
    } finally { setVerifying(false) }
  }

  /* ── Skip TOTP (go in without setting up) ── */
  const skipTotp = () => {
    login(registeredUser, registeredToken)
    navigate(role === 'worker' ? '/worker/dashboard' : '/customer/home')
  }

  const canNextStep2 = form.name && form.email && form.password.length >= 8 && form.phone

  return (
    <div className="stp-page">
      <div className="stp-card wide">

        {/* Back to landing */}
        {step === 1 && (
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            ← Back to home
          </button>
        )}

        <div className="stp-logo">
          <div className="stp-logo-icon">S</div>
          <span>SmartTalent</span>
        </div>

        {/* Progress indicator */}
        {step < 4 && (
          <div className="auth-progress">
            {[1,2,role === 'worker' ? 3 : null].filter(Boolean).map(s => (
              <div key={s} className={`auth-prog-dot ${step >= s ? 'active' : ''} ${step > s ? 'done' : ''}`}>
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        )}

        {/* ══ STEP 1 — Role selection ══ */}
        {step === 1 && (
          <div className="stp-section">
            <h1 className="stp-heading">Join SmartTalent</h1>
            <p className="stp-sub">Who are you signing up as?</p>
            <div className="role-grid">
              <button className={`role-card ${role === 'customer' ? 'active' : ''}`} onClick={() => setRole('customer')}>
                <div className="role-icon">👤</div>
                <div className="role-label">Customer</div>
                <div className="role-desc">I need to hire local workers</div>
              </button>
              <button className={`role-card ${role === 'worker' ? 'active' : ''}`} onClick={() => setRole('worker')}>
                <div className="role-icon">🔧</div>
                <div className="role-label">Worker</div>
                <div className="role-desc">I have a skill and want to get hired</div>
              </button>
            </div>
            <button className="stp-btn primary full" disabled={!role} onClick={() => setStep(2)}>
              Continue as {role ? (role === 'worker' ? 'Worker' : 'Customer') : '…'} →
            </button>
            <p className="stp-footer-text">
              Already have an account? <Link to="/login" className="stp-link">Sign in</Link>
            </p>
          </div>
        )}

        {/* ══ STEP 2 — Personal details ══ */}
        {step === 2 && (
          <form onSubmit={e => { e.preventDefault(); if (role === 'worker') setStep(3); else handleSubmit(e) }}>
            <div className="stp-section">
              <button type="button" className="stp-back" onClick={() => setStep(1)}>← Back</button>
              <h1 className="stp-heading">Your details</h1>
              <p className="stp-sub">{role === 'worker' ? 'Step 1 of 2' : 'Create your account'}</p>
              {error && <div className="stp-error">{error}</div>}
              <div className="stp-fields">
                <div className="stp-field">
                  <label>Full name</label>
                  <input placeholder="Rahul Sharma" value={form.name}
                    onChange={e => set('name', e.target.value)} required autoFocus />
                </div>
                <div className="stp-field">
                  <label>Email address</label>
                  <input type="email" placeholder="you@example.com" value={form.email}
                    onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="stp-field">
                  <label>Phone number</label>
                  <input type="tel" placeholder="+91 98765 43210" value={form.phone}
                    onChange={e => set('phone', e.target.value)} required />
                </div>
                <div className="stp-field">
                  <label>Password</label>
                  <div className="auth-pw-wrap">
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      minLength={8} required
                    />
                    <button type="button" className="auth-eye-btn" onClick={() => setShowPw(v => !v)}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div className="auth-pw-strength">
                    {[4,6,8,10].map((n,i) => (
                      <div key={i} className={`auth-pw-bar ${form.password.length >= n ? 'filled' : ''}`} />
                    ))}
                    <span className="auth-pw-label">
                      {form.password.length === 0 ? '' :
                       form.password.length < 6  ? 'Weak' :
                       form.password.length < 8  ? 'Fair' :
                       form.password.length < 10 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                </div>
              </div>
              <button type="submit" className="stp-btn primary full"
                disabled={loading || !canNextStep2}>
                {role === 'worker' ? 'Next: Work details →' : (loading ? 'Creating…' : 'Create account')}
              </button>
            </div>
          </form>
        )}

        {/* ══ STEP 3 — Worker profile ══ */}
        {step === 3 && role === 'worker' && (
          <form onSubmit={handleSubmit}>
            <div className="stp-section">
              <button type="button" className="stp-back" onClick={() => setStep(2)}>← Back</button>
              <h1 className="stp-heading">Your work profile</h1>
              <p className="stp-sub">Step 2 of 2 — Customers will see this</p>
              {error && <div className="stp-error">{error}</div>}
              <div className="stp-field">
                <label>Your skills <span className="stp-hint">(select all that apply)</span></label>
                <div className="skills-grid">
                  {SKILLS.map(s => (
                    <button key={s} type="button"
                      className={`skill-chip ${form.skills.includes(s) ? 'active' : ''}`}
                      onClick={() => toggleSkill(s)}>{s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="stp-fields">
                <div className="stp-field">
                  <label>Service area</label>
                  <input placeholder="e.g. Gurugram, Sector 29" value={form.area}
                    onChange={e => set('area', e.target.value)} required />
                </div>
                <div className="stp-field">
                  <label>Hourly rate (₹)</label>
                  <input type="number" placeholder="e.g. 500" value={form.rate}
                    onChange={e => set('rate', e.target.value)} min="50" required />
                </div>
                <div className="stp-field full">
                  <label>Short bio <span className="stp-hint">(optional)</span></label>
                  <textarea rows={2} placeholder="Tell customers about your experience…"
                    value={form.bio} onChange={e => set('bio', e.target.value)}
                    style={{ padding:'10px 14px', border:'1.5px solid var(--border)', borderRadius:10, fontFamily:'inherit', fontSize:14, resize:'vertical', outline:'none' }}
                  />
                </div>
              </div>
              <button type="submit" className="stp-btn primary full"
                disabled={loading || form.skills.length === 0}>
                {loading ? 'Creating profile…' : 'Create my profile →'}
              </button>
            </div>
          </form>
        )}

        {/* ══ STEP 4 — TOTP QR Setup ══ */}
        {step === 4 && (
          <div className="stp-section">
            <h1 className="stp-heading">
              {totpVerified ? '🎉 You\'re all set!' : '🔐 Set up 2FA recovery'}
            </h1>

            {totpVerified ? (
              <div className="auth-totp-success">
                <div className="auth-totp-success-icon">✅</div>
                <p>Authenticator connected! Signing you in…</p>
              </div>
            ) : (
              <>
                <p className="stp-sub">
                  Scan this QR code in <strong>Google Authenticator</strong> or <strong>Authy</strong>.
                  You'll need this to reset your password if you ever forget it.
                </p>

                <div className="auth-totp-box">
                  {/* QR Code rendered via Google Charts API */}
                  {totpQR ? (
                    <img
                      src={totpQR}
                      alt="TOTP QR Code"
                      className="auth-qr-img"
                    />
                  ) : (
                    <div className="auth-qr-placeholder">
                      <div className="auth-qr-spinner" />
                      <span>Generating QR…</span>
                    </div>
                  )}

                  <div className="auth-totp-manual">
                    <div className="auth-totp-manual-label">Or enter this key manually:</div>
                    <div className="auth-totp-secret">{totpSecret}</div>
                  </div>
                </div>

                <div className="auth-totp-steps">
                  <div className="auth-totp-step">
                    <span className="auth-totp-step-num">1</span>
                    <span>Open <strong>Google Authenticator</strong> or <strong>Authy</strong> on your phone</span>
                  </div>
                  <div className="auth-totp-step">
                    <span className="auth-totp-step-num">2</span>
                    <span>Tap <strong>+</strong> → <strong>Scan QR code</strong> and scan the image above</span>
                  </div>
                  <div className="auth-totp-step">
                    <span className="auth-totp-step-num">3</span>
                    <span>Enter the <strong>6-digit code</strong> shown in the app below to confirm</span>
                  </div>
                </div>

                {error && <div className="stp-error">{error}</div>}

                <div className="stp-field">
                  <label>Enter code from authenticator app to confirm</label>
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={totpCode}
                    onChange={e => setTotpCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                    maxLength={6}
                    className="auth-otp-input"
                    autoFocus
                  />
                </div>

                <button
                  className="stp-btn primary full"
                  onClick={verifyAndEnter}
                  disabled={verifying || totpCode.length !== 6}
                >
                  {verifying ? 'Verifying…' : 'Confirm & Enter →'}
                </button>

                <button
                  className="stp-btn outline full"
                  style={{ marginTop: 8 }}
                  onClick={skipTotp}
                >
                  Skip for now (not recommended)
                </button>

                <p className="auth-totp-warning">
                  ⚠️ Without 2FA set up, you cannot use the forgot password option.
                </p>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}