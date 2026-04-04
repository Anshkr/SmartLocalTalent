import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import API from '../../lib/api'

export default function CustomerSettings() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [section, setSection] = useState('notifications')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  const [notifs, setNotifs] = useState({
    requestAccepted: true,
    jobCompleted:    true,
    payment:         true,
    emailAlerts:     false,
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
      setError(err.response?.data?.error || 'Failed to save.')
    } finally { setSaving(false) }
  }

  const changePassword = async (e) => {
    e.preventDefault(); setPwError('')
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
    { id: 'security',      icon: '🛡️', label: 'Security'      },
    { id: 'account',       icon: '👤', label: 'Account'       },
  ]

  return (
    <CustomerLayout>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-sub">Manage your account preferences</p>
        </div>

        <div className="settings-body">
          <div className="settings-sidebar">
            {SECTIONS.map(s => (
              <button key={s.id}
                className={`settings-nav-item ${section === s.id ? 'active' : ''}`}
                onClick={() => { setSection(s.id); setError(''); setSaved(false) }}>
                <span className="settings-nav-icon">{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="settings-content">
            {error && <div className="settings-error">{error}</div>}
            {saved && <div className="settings-success">✅ Settings saved!</div>}

            {section === 'notifications' && (
              <div className="settings-card">
                <div className="settings-card-title">Notification preferences</div>
                <p className="settings-card-sub">Choose when you want to be notified.</p>
                <div className="settings-toggles">
                  {[
                    { key: 'requestAccepted', label: 'Request accepted',   desc: 'When a worker accepts your job request' },
                    { key: 'jobCompleted',    label: 'Job completed',      desc: 'When a worker marks the job as done'    },
                    { key: 'payment',         label: 'Payment receipts',   desc: 'Confirmation after successful payment'  },
                    { key: 'emailAlerts',     label: 'Email notifications', desc: 'Get alerts sent to your email address' },
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

            {section === 'security' && (
              <div className="settings-card">
                <div className="settings-card-title">Change password</div>
                {pwError && <div className="settings-error" style={{ marginBottom:12 }}>{pwError}</div>}
                {pwSaved && <div className="settings-success" style={{ marginBottom:12 }}>✅ Password changed!</div>}
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
              </div>
            )}

            {section === 'account' && (
              <div className="settings-card">
                <div className="settings-card-title">Account information</div>
                <div className="settings-info-row"><span>Name</span><strong>{user?.name}</strong></div>
                <div className="settings-info-row"><span>Email</span><strong>{user?.email}</strong></div>
                <div className="settings-info-row"><span>Phone</span><strong>{user?.phone || '—'}</strong></div>
                <div className="settings-info-row"><span>Role</span><strong>Customer</strong></div>

                <div className="settings-divider" />
                <div className="settings-card-title" style={{ fontSize:15, color:'#ef4444' }}>Danger zone</div>
                <p className="settings-card-sub">Permanently delete your account and all data.</p>

                {deleteConfirm === 'confirmed' ? (
                  <div>
                    <p style={{ fontSize:13, color:'#ef4444', marginBottom:10 }}>Are you sure? This cannot be undone.</p>
                    <div style={{ display:'flex', gap:10 }}>
                      <button className="settings-delete-btn" onClick={async () => {
                        try { await API.delete('/auth/account'); logout(); navigate('/') } catch { setError('Failed to delete.') }
                      }}>Yes, delete my account</button>
                      <button className="settings-outline-btn" onClick={() => setDeleteConfirm('')}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="settings-delete-btn" onClick={() => setDeleteConfirm('confirmed')}>Delete account</button>
                )}

                <div className="settings-divider" />
                <button className="settings-outline-btn" onClick={() => { logout(); navigate('/') }}>⎋ Sign out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}