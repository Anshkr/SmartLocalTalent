import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import API from '../../lib/api'

export default function AdminAccounts() {
  const [admins, setAdmins]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [creating, setCreating]   = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [deleting, setDeleting]   = useState(null)
  const [showPw, setShowPw]       = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fetchAdmins = async () => {
    try {
      const { data } = await API.get('/admin/accounts')
      setAdmins(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAdmins() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setCreating(true)
    try {
      const { data } = await API.post('/admin/accounts', {
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      })
      setAdmins(prev => [data, ...prev])
      setForm({ name: '', email: '', password: '', confirmPassword: '' })
      setShowForm(false)
      setSuccess(`Admin account created for ${data.name}!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create admin. Try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove admin access for ${name}? They will no longer be able to log in as admin.`)) return
    setDeleting(id)
    try {
      await API.delete(`/admin/accounts/${id}`)
      setAdmins(prev => prev.filter(a => a.id !== id))
      setSuccess(`${name}'s admin access removed.`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove admin.')
    } finally {
      setDeleting(null) }
  }

  return (
    <AdminLayout>
      <div className="adac-page">

        {/* Header */}
        <div className="adac-header">
          <div>
            <h1 className="adac-title">Admin accounts</h1>
            <p className="adac-sub">Manage who has admin access to SmartTalent</p>
          </div>
          <button className="adac-add-btn" onClick={() => { setShowForm(v => !v); setError('') }}>
            {showForm ? '✕ Cancel' : '+ Add admin'}
          </button>
        </div>

        {/* Feedback */}
        {error   && <div className="adac-error">{error}</div>}
        {success && <div className="adac-success">{success}</div>}

        {/* Create form */}
        {showForm && (
          <div className="adac-form-card">
            <div className="adac-form-title">Create new admin account</div>
            <form onSubmit={handleCreate} className="adac-form">
              <div className="adac-field-row">
                <div className="adac-field">
                  <label>Full name</label>
                  <input
                    placeholder="e.g. Anjali Singh"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required autoFocus
                  />
                </div>
                <div className="adac-field">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="admin@smarttalent.com"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="adac-field-row">
                <div className="adac-field">
                  <label>Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      minLength={8} required
                      style={{ paddingRight: 40, width: '100%' }}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)} style={{
                      position: 'absolute', right: 10, background: 'none',
                      border: 'none', cursor: 'pointer', fontSize: 15
                    }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div className="adac-field">
                  <label>Confirm password</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="adac-form-note">
                🛡️ This account will have full admin access — create jobs, manage workers, approve withdrawals, resolve disputes.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="adac-create-btn" disabled={creating}>
                  {creating ? 'Creating…' : 'Create admin account'}
                </button>
                <button type="button" className="adac-cancel-btn"
                  onClick={() => { setShowForm(false); setError(''); setForm({ name:'', email:'', password:'', confirmPassword:'' }) }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admins list */}
        <div className="adac-list-card">
          <div className="adac-list-header">
            <span className="adac-list-title">All admins</span>
            <span className="adac-list-count">{admins.length} account{admins.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="adac-loading">
              <div className="adac-loading-spinner" />
              Loading admins…
            </div>
          ) : admins.length === 0 ? (
            <div className="adac-empty">
              <div style={{ fontSize: 32 }}>🛡️</div>
              <p>No admin accounts found. Add one above.</p>
            </div>
          ) : (
            <div className="adac-rows">
              {admins.map(admin => (
                <div key={admin.id} className="adac-row">
                  <div className="adac-row-av" style={{ background: admin.isSuperAdmin ? '#7c3aed' : '#0f2d1f' }}>
                    {admin.name?.[0]?.toUpperCase() ?? 'A'}
                  </div>
                  <div className="adac-row-info">
                    <div className="adac-row-name">
                      {admin.name}
                      {admin.isSuperAdmin && (
                        <span className="adac-super-badge">Super Admin</span>
                      )}
                    </div>
                    <div className="adac-row-email">{admin.email}</div>
                    <div className="adac-row-meta">
                      Added {new Date(admin.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="adac-row-right">
                    <span className="adac-role-badge">Admin</span>
                    {!admin.isSuperAdmin && (
                      <button
                        className="adac-remove-btn"
                        onClick={() => handleDelete(admin.id, admin.name)}
                        disabled={deleting === admin.id}
                      >
                        {deleting === admin.id ? '…' : 'Remove'}
                      </button>
                    )}
                    {admin.isSuperAdmin && (
                      <span style={{ fontSize: 11, color: '#9ca3af', padding: '4px 8px' }}>Protected</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="adac-info-box">
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <div>
            <strong>About admin access</strong>
            <p>Admin accounts can manage workers, customers, jobs, disputes and withdrawals. The original Super Admin account cannot be removed. Share admin credentials securely — never via email or chat.</p>
          </div>
        </div>

      </div>

      <style>{`
        .adac-page { display: flex; flex-direction: column; gap: 20px; max-width: 860px; font-family: 'DM Sans', sans-serif; }
        .adac-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .adac-title { font-size: 22px; font-weight: 700; font-family: 'Sora', sans-serif; color: var(--ad-text, #111827); }
        .adac-sub   { font-size: 13px; color: var(--ad-text2, #6b7280); margin-top: 4px; }

        .adac-add-btn {
          background: #0d1117; color: #fff; border: none;
          border-radius: 10px; padding: 10px 20px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: opacity 0.15s; white-space: nowrap;
        }
        .adac-add-btn:hover { opacity: 0.85; }

        .adac-error   { background: #fee2e2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #991b1b; }
        .adac-success { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px 16px; font-size: 13px; color: #166534; font-weight: 600; }

        .adac-form-card {
          background: var(--ad-surface, #fff); border-radius: 14px;
          border: 1.5px solid var(--ad-border, #e5e9f8); padding: 24px;
          animation: slideDown 0.2s ease;
        }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .adac-form-title { font-size: 15px; font-weight: 700; color: var(--ad-text, #111827); margin-bottom: 18px; font-family: 'Sora', sans-serif; }
        .adac-form { display: flex; flex-direction: column; gap: 14px; }
        .adac-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .adac-field-row { grid-template-columns: 1fr; } }
        .adac-field { display: flex; flex-direction: column; gap: 6px; }
        .adac-field label { font-size: 13px; font-weight: 600; color: var(--ad-text2, #374151); }
        .adac-field input {
          padding: 11px 14px; border: 1.5px solid var(--ad-border, #e5e9f8);
          border-radius: 10px; font-size: 14px; font-family: 'DM Sans', sans-serif;
          outline: none; transition: border-color 0.15s;
          background: var(--ad-surface, #fff); color: var(--ad-text, #111827);
        }
        .adac-field input:focus { border-color: #4f6ef7; }

        .adac-form-note {
          background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px;
          padding: 10px 14px; font-size: 12px; color: #92400e; line-height: 1.5;
        }
        .adac-create-btn {
          background: #4f6ef7; color: #fff; border: none; border-radius: 10px;
          padding: 11px 22px; font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: background 0.15s;
        }
        .adac-create-btn:hover:not(:disabled) { background: #3a57e8; }
        .adac-create-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .adac-cancel-btn {
          background: transparent; color: var(--ad-text2, #6b7280);
          border: 1.5px solid var(--ad-border, #e5e9f8); border-radius: 10px;
          padding: 11px 18px; font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .adac-list-card {
          background: var(--ad-surface, #fff); border-radius: 14px;
          border: 1.5px solid var(--ad-border, #e5e9f8); overflow: hidden;
        }
        .adac-list-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px; border-bottom: 1px solid var(--ad-border, #e5e9f8);
        }
        .adac-list-title { font-size: 15px; font-weight: 700; color: var(--ad-text, #111827); font-family: 'Sora', sans-serif; }
        .adac-list-count { font-size: 12px; color: var(--ad-text2, #9ca3af); background: var(--ad-surface2, #f9faff); border: 1px solid var(--ad-border, #e5e9f8); border-radius: 20px; padding: 3px 10px; font-weight: 600; }

        .adac-loading { display: flex; align-items: center; gap: 10px; padding: 32px 20px; color: var(--ad-text2, #9ca3af); font-size: 14px; }
        .adac-loading-spinner { width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid #e5e9f8; border-top-color: #4f6ef7; animation: spin 0.7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .adac-empty { padding: 48px; text-align: center; color: var(--ad-text2, #9ca3af); display: flex; flex-direction: column; align-items: center; gap: 10px; font-size: 14px; }

        .adac-rows { display: flex; flex-direction: column; }
        .adac-row {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 20px; border-bottom: 1px solid var(--ad-border, #f0f2fa);
          transition: background 0.12s;
        }
        .adac-row:last-child { border-bottom: none; }
        .adac-row:hover { background: var(--ad-surface2, #f9faff); }

        .adac-row-av {
          width: 42px; height: 42px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; font-weight: 700; color: #fff; flex-shrink: 0;
        }
        .adac-row-info { flex: 1; }
        .adac-row-name  { font-size: 14px; font-weight: 700; color: var(--ad-text, #111827); display: flex; align-items: center; gap: 8px; }
        .adac-row-email { font-size: 12px; color: var(--ad-text2, #6b7280); margin-top: 2px; }
        .adac-row-meta  { font-size: 11px; color: var(--ad-text3, #9ca3af); margin-top: 3px; }

        .adac-super-badge {
          background: #ede9fe; color: #7c3aed;
          font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px;
        }
        .adac-role-badge {
          background: var(--ad-surface2, #f0f2fa); color: var(--ad-text2, #6b7280);
          font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--ad-border, #e5e9f8);
        }
        .adac-row-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

        .adac-remove-btn {
          background: #fee2e2; color: #991b1b;
          border: none; border-radius: 8px; padding: 5px 12px;
          font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all 0.15s;
        }
        .adac-remove-btn:hover:not(:disabled) { background: #dc2626; color: #fff; }
        .adac-remove-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .adac-info-box {
          display: flex; gap: 14px; align-items: flex-start;
          background: var(--ad-surface2, #f9faff); border: 1px solid var(--ad-border, #e5e9f8);
          border-radius: 12px; padding: 16px 18px;
          font-size: 13px; color: var(--ad-text2, #6b7280); line-height: 1.6;
        }
        .adac-info-box strong { display: block; color: var(--ad-text, #111827); font-weight: 700; margin-bottom: 4px; }
        .adac-info-box p { margin: 0; }
      `}</style>
    </AdminLayout>
  )
}