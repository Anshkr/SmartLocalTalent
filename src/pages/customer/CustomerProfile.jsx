import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'

export default function CustomerProfile() {
  const { user, updateUser, logout } = useAuthStore()
  const [form, setForm] = useState({
    name:    user?.name    ?? '',
    phone:   user?.phone   ?? '',
    address: user?.address ?? '',
  })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = e => {
    e.preventDefault()
    updateUser(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <CustomerLayout>
      <div className="cp-page">

        <div className="cp-header">
          <h1 className="cp-title">My profile</h1>
          <p className="cp-sub">Manage your account details</p>
        </div>

        {/* Avatar card */}
        <div className="cp-avatar-card">
          <div className="cp-big-avatar">{user?.name?.[0] ?? 'C'}</div>
          <div>
            <div className="cp-preview-name">{form.name || user?.name}</div>
            <div className="cp-preview-meta">Customer account · Gurugram</div>
          </div>
        </div>

        {/* Stats */}
        <div className="cp-stats">
          <div className="cp-stat"><span className="cp-stat-val">5</span><span className="cp-stat-key">Jobs hired</span></div>
          <div className="cp-stat"><span className="cp-stat-val">4</span><span className="cp-stat-key">Reviews left</span></div>
          <div className="cp-stat"><span className="cp-stat-val">Mar 2026</span><span className="cp-stat-key">Joined</span></div>
        </div>

        <form onSubmit={handleSave} className="cp-form">
          <div className="cp-section">
            <h2 className="cp-section-title">Personal info</h2>
            <div className="cp-fields">
              <div className="cp-field">
                <label>Full name</label>
                <input value={form.name}  onChange={e => set('name',  e.target.value)} required />
              </div>
              <div className="cp-field">
                <label>Phone number</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
              <div className="cp-field full">
                <label>Default address</label>
                <input
                  value={form.address}
                  onChange={e => set('address', e.target.value)}
                  placeholder="e.g. House 12, Sector 29, Gurugram"
                />
              </div>
            </div>
          </div>

          <div className="cp-footer">
            {saved && <span className="cp-saved">✅ Saved!</span>}
            <button type="submit" className="cp-save-btn">Save changes</button>
          </div>
        </form>

        <div className="cp-danger">
          <h2 className="cp-section-title">Account</h2>
          <button className="cp-logout-btn" onClick={() => { logout(); window.location.href = '/login' }}>
            Sign out
          </button>
        </div>

      </div>
    </CustomerLayout>
  )
}