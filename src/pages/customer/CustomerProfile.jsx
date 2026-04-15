import { useState, useEffect } from 'react'
import useAuthStore from '../../store/authStore'
import CustomerLayout from '../../components/customer/CustomerLayout'
import { getMyRequestsAPI } from '../../lib/api'
import API from '../../lib/api'

export default function CustomerProfile() {
  const { user, updateUser, logout } = useAuthStore()
  const [form, setForm]   = useState({ name:user?.name||'', phone:user?.phone||'', email:user?.email||'' })
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ jobs:0, reviews:0, spent:0 })

  const set = (k,v) => setForm(f => ({ ...f, [k]:v }))

  useEffect(() => {
    getMyRequestsAPI().then(({ data }) => {
      const completed = data.filter(r => r.status === 'COMPLETED')
      setStats({
        jobs:    completed.length,
        reviews: completed.filter(r => r.review).length,
        spent:   completed.reduce((a,r) => a+(r.budget||0), 0),
      })
    }).catch(console.error)
  }, [])

  const handleSave = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await API.patch('/auth/profile', { name: form.name, phone: form.phone })
      updateUser({ name: form.name, phone: form.phone })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {} finally { setSaving(false) }
  }

  return (
    <CustomerLayout>
      <style>{`
        .cp2-page { display:flex; flex-direction:column; gap:20px; max-width:700px; font-family:'DM Sans',sans-serif; }
        .cp2-title { font-size:22px; font-weight:800; color:#111917; }
        .cp2-sub   { font-size:13px; color:#9ca3af; margin-top:4px; }

        .cp2-hero { background:linear-gradient(135deg,#eef1fe,#f0fdf4); border-radius:18px; border:1.5px solid #e8ede9; padding:24px; display:flex; align-items:center; gap:18px; flex-wrap:wrap; }
        .cp2-av   { width:72px; height:72px; border-radius:50%; background:#4f6ef7; color:#fff; display:flex; align-items:center; justify-content:center; font-size:28px; font-weight:800; flex-shrink:0; border:4px solid #fff; box-shadow:0 4px 16px rgba(79,110,247,.25); }
        .cp2-name { font-size:20px; font-weight:800; color:#111917; }
        .cp2-role { font-size:13px; color:#6b7280; margin-top:3px; }
        .cp2-joined { font-size:12px; color:#9ca3af; margin-top:2px; }

        .cp2-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .cp2-stat  { background:#fff; border-radius:14px; border:1.5px solid #e8ede9; padding:18px; text-align:center; transition:border-color .15s; }
        .cp2-stat:hover { border-color:#4f6ef7; }
        .cp2-stat-val { font-size:24px; font-weight:800; color:#111917; }
        .cp2-stat-lbl { font-size:12px; color:#9ca3af; margin-top:4px; }

        .cp2-card { background:#fff; border-radius:16px; border:1.5px solid #e8ede9; padding:22px; display:flex; flex-direction:column; gap:16px; }
        .cp2-card-title { font-size:15px; font-weight:700; color:#111917; }
        .cp2-field { display:flex; flex-direction:column; gap:6px; }
        .cp2-field label { font-size:13px; font-weight:600; color:#374151; }
        .cp2-field input { padding:11px 14px; border:1.5px solid #e8ede9; border-radius:10px; font-size:14px; outline:none; transition:border-color .15s; }
        .cp2-field input:focus { border-color:#4f6ef7; }
        .cp2-field input:disabled { background:#f8faf9; color:#9ca3af; }
        .cp2-fields { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:500px){ .cp2-fields { grid-template-columns:1fr; } }

        .cp2-save-btn { background:#4f6ef7; color:#fff; border:none; border-radius:10px; padding:12px 24px; font-size:14px; font-weight:700; cursor:pointer; transition:background .15s; align-self:flex-start; }
        .cp2-save-btn:hover:not(:disabled) { background:#3a57e8; }
        .cp2-save-btn:disabled { opacity:.6; cursor:not-allowed; }
        .cp2-saved { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:8px 14px; font-size:13px; color:#166534; font-weight:600; }

        .cp2-danger { background:#fff5f5; border:1.5px solid #fecaca; border-radius:16px; padding:20px; }
        .cp2-danger-title { font-size:14px; font-weight:700; color:#dc2626; margin-bottom:4px; }
        .cp2-danger-sub   { font-size:13px; color:#9ca3af; margin-bottom:14px; }
        .cp2-signout-btn  { padding:10px 20px; border-radius:10px; border:1.5px solid #e8ede9; background:#fff; color:#6b7280; font-size:14px; font-weight:600; cursor:pointer; transition:all .15s; margin-right:10px; }
        .cp2-signout-btn:hover { border-color:#dc2626; color:#dc2626; background:#fee2e2; }
      `}</style>

      <div className="cp2-page">
        <div>
          <h1 className="cp2-title">My profile</h1>
          <p className="cp2-sub">Manage your account information</p>
        </div>

        {/* Hero */}
        <div className="cp2-hero">
          <div className="cp2-av">{user?.name?.[0] ?? 'C'}</div>
          <div>
            <div className="cp2-name">{user?.name}</div>
            <div className="cp2-role">Customer account</div>
            <div className="cp2-joined">Member since {new Date(user?.createdAt||Date.now()).toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="cp2-stats">
          <div className="cp2-stat">
            <div className="cp2-stat-val">{stats.jobs}</div>
            <div className="cp2-stat-lbl">Jobs hired</div>
          </div>
          <div className="cp2-stat">
            <div className="cp2-stat-val">₹{stats.spent.toLocaleString('en-IN')}</div>
            <div className="cp2-stat-lbl">Total spent</div>
          </div>
          <div className="cp2-stat">
            <div className="cp2-stat-val">{stats.reviews}</div>
            <div className="cp2-stat-lbl">Reviews given</div>
          </div>
        </div>

        {/* Edit form */}
        <div className="cp2-card">
          <div className="cp2-card-title">Personal information</div>
          {saved && <div className="cp2-saved">✅ Profile saved successfully!</div>}
          <form onSubmit={handleSave}>
            <div className="cp2-fields" style={{ marginBottom:14 }}>
              <div className="cp2-field">
                <label>Full name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="cp2-field">
                <label>Phone number</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              </div>
            </div>
            <div className="cp2-field" style={{ marginBottom:16 }}>
              <label>Email address</label>
              <input value={form.email} disabled title="Email cannot be changed" />
            </div>
            <button type="submit" className="cp2-save-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="cp2-danger">
          <div className="cp2-danger-title">Account actions</div>
          <div className="cp2-danger-sub">Sign out of your SmartTalent account.</div>
          <button className="cp2-signout-btn" onClick={() => { logout(); window.location.href='/' }}>
            ⎋ Sign out
          </button>
        </div>
      </div>
    </CustomerLayout>
  )
}