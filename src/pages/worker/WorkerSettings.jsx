import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import WorkerLayout from '../../components/worker/WorkerLayout'
import API from '../../lib/api'

export default function WorkerSettings() {
  const { user, logout, updateUser } = useAuthStore()
  const navigate = useNavigate()

  const [section, setSection]   = useState('notifications')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  const [notifs, setNotifs] = useState({
    newRequest:   true,
    jobAccepted:  true,
    payment:      true,
    review:       true,
    emailAlerts:  false,
  })

  const [privacy, setPrivacy] = useState({
    showPhone:    false,
    showOnline:   true,
    publicProfile: true,
  })

  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState('')

  const save = async (data) => {
    setSaving(true); setError(''); setSaved(false)
    try {
      await API.patch('/auth/settings', data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Try again.')
    } finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    if (pwForm.newPw.length < 8) { setPwError('Password must be at least 8 characters.'); return }
    setSaving(true)
    try {
      await API.post('/auth/change-password', { currentPassword: pwForm.current, newPassword: pwForm.newPw })
      setPwSaved(true)
      setPwForm({ current: '', newPw: '', confirm: '' })
      setTimeout(() => setPwSaved(false), 2500)
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to change password.')
    } finally { setSaving(false) }
  }

  const SECTIONS = [
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'privacy',       icon: '🔒', label: 'Privacy'       },
    { id: 'security',      icon: '🛡️', label: 'Security'      },
    { id: 'account',       icon: '👤', label: 'Account'       },
  ]

  return (
    <WorkerLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-sub">Manage your account preferences</p>
        </div>

        <div className="settings-body">
          {/* Sidebar */}
          <div className="settings-sidebar">
            {SECTIONS.map(s => (
              <button
                key={s.id}
                className={`settings-nav-item ${section === s.id ? 'active' : ''}`}
                onClick={() => { setSection(s.id); setError(''); setSaved(false) }}
              >
                <span className="settings-nav-icon">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="settings-content">

            {error  && <div className="settings-error">{error}</div>}
            {saved  && <div className="settings-success">✅ Settings saved!</div>}

            {/* ── NOTIFICATIONS ── */}
            {section === 'notifications' && (
              <div className="settings-card">
                <div className="settings-card-title">Notification preferences</div>
                <p className="settings-card-sub">Choose what you want to be notified about.</p>
                <div className="settings-toggles">
                  {[
                    { key: 'newRequest',  label: 'New job requests',        desc: 'When a customer sends you a request'   },
                    { key: 'jobAccepted', label: 'Job status updates',      desc: 'When a job is accepted or completed'   },
                    { key: 'payment',     label: 'Payment received',        desc: 'When a customer pays for your work'    },
                    { key: 'review',      label: 'New reviews',             desc: 'When a customer leaves you a review'   },
                    { key: 'emailAlerts', label: 'Email notifications',     desc: 'Get alerts sent to your email address' },
                  ].map(item => (
                    <div key={item.key} className="settings-toggle-row">
                      <div>
                        <div className="settings-toggle-label">{item.label}</div>
                        <div className="settings-toggle-desc">{item.desc}</div>
                      </div>
                      <button
                        className={`settings-toggle ${notifs[item.key] ? 'on' : ''}`}
                        onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                      >
                        <div className="settings-toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="settings-save-btn" onClick={() => save({ notifications: notifs })} disabled={saving}>
                  {saving ? 'Saving…' : 'Save preferences'}
                </button>
              </div>
            )}

            {/* ── PRIVACY ── */}
            {section === 'privacy' && (
              <div className="settings-card">
                <div className="settings-card-title">Privacy settings</div>
                <p className="settings-card-sub">Control what customers can see about you.</p>
                <div className="settings-toggles">
                  {[
                    { key: 'showPhone',    label: 'Show phone number',   desc: 'Let customers see your phone number on your profile' },
                    { key: 'showOnline',   label: 'Show online status',  desc: 'Show when you are online or offline'                 },
                    { key: 'publicProfile',label: 'Public profile',      desc: 'Allow customers to view your full profile'           },
                  ].map(item => (
                    <div key={item.key} className="settings-toggle-row">
                      <div>
                        <div className="settings-toggle-label">{item.label}</div>
                        <div className="settings-toggle-desc">{item.desc}</div>
                      </div>
                      <button
                        className={`settings-toggle ${privacy[item.key] ? 'on' : ''}`}
                        onClick={() => setPrivacy(p => ({ ...p, [item.key]: !p[item.key] }))}
                      >
                        <div className="settings-toggle-knob" />
                      </button>
                    </div>
                  ))}
                </div>
                <button className="settings-save-btn" onClick={() => save({ privacy })} disabled={saving}>
                  {saving ? 'Saving…' : 'Save privacy settings'}
                </button>
              </div>
            )}

            {/* ── SECURITY ── */}
            {section === 'security' && (
              <div className="settings-card">
                <div className="settings-card-title">Change password</div>
                <p className="settings-card-sub">Use a strong password to keep your account safe.</p>
                {pwError && <div className="settings-error" style={{ marginBottom: 12 }}>{pwError}</div>}
                {pwSaved && <div className="settings-success" style={{ marginBottom: 12 }}>✅ Password changed!</div>}
                <form onSubmit={changePassword} className="settings-form">
                  <div className="settings-field">
                    <label>Current password</label>
                    <input type="password" placeholder="Enter current password"
                      value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} required />
                  </div>
                  <div className="settings-field">
                    <label>New password</label>
                    <input type="password" placeholder="Min. 8 characters"
                      value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} minLength={8} required />
                  </div>
                  <div className="settings-field">
                    <label>Confirm new password</label>
                    <input type="password" placeholder="Repeat new password"
                      value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
                  </div>
                  <button type="submit" className="settings-save-btn" disabled={saving}>
                    {saving ? 'Changing…' : 'Change password'}
                  </button>
                </form>

                <div className="settings-divider" />
                <div className="settings-card-title" style={{ fontSize: 15 }}>Two-factor authentication</div>
                <p className="settings-card-sub">
                  {user?.totpEnabled ? '✅ Authenticator app is connected.' : '⚠️ 2FA not set up. Set it up to enable forgot password.'}
                </p>
                <button className="settings-outline-btn" onClick={() => navigate('/worker/profile')}>
                  {user?.totpEnabled ? 'Manage 2FA' : 'Set up 2FA →'}
                </button>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {section === 'account' && (
              <div className="settings-card">
                <div className="settings-card-title">Account information</div>
                <div className="settings-info-row"><span>Name</span><strong>{user?.name}</strong></div>
                <div className="settings-info-row"><span>Email</span><strong>{user?.email}</strong></div>
                <div className="settings-info-row"><span>Phone</span><strong>{user?.phone || '—'}</strong></div>
                <div className="settings-info-row"><span>Role</span><strong>Worker</strong></div>
                <div className="settings-info-row"><span>Status</span>
                  <strong style={{ color: user?.workerProfile?.status === 'ACTIVE' ? '#16a34a' : '#f59e0b' }}>
                    {user?.workerProfile?.status || 'PENDING'}
                  </strong>
                </div>

                <div className="settings-divider" />

                <div className="settings-card-title" style={{ fontSize: 15, color: '#ef4444' }}>Danger zone</div>
                <p className="settings-card-sub">Once you delete your account, all your data will be permanently removed.</p>

                {deleteConfirm === 'confirmed' ? (
                  <div>
                    <p style={{ fontSize: 13, color: '#ef4444', marginBottom: 10 }}>
                      Are you absolutely sure? This cannot be undone.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button className="settings-delete-btn" onClick={async () => {
                        try { await API.delete('/auth/account'); logout(); navigate('/') } catch { setError('Failed to delete account.') }
                      }}>Yes, delete my account</button>
                      <button className="settings-outline-btn" onClick={() => setDeleteConfirm('')}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="settings-delete-btn" onClick={() => setDeleteConfirm('confirmed')}>
                    Delete account
                  </button>
                )}

                <div className="settings-divider" />
                <button className="settings-outline-btn" onClick={() => { logout(); navigate('/') }}>
                  ⎋ Sign out
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </WorkerLayout>
  )
}