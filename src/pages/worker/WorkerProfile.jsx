import { useState } from 'react'
import useAuthStore from '../../store/authStore'
import WorkerLayout from '../../components/worker/WorkerLayout'
import { updateWorkerAPI } from '../../lib/api'

const ALL_SKILLS = [
  'Painter','Carpenter','Plumber','Electrician',
  'Gardener','Driver','Sweeper','Mason',
  'Welder','AC Repair','Cook','Security Guard',
]

export default function WorkerProfile() {
  const { user, updateUser, logout } = useAuthStore()
  const profile = user?.workerProfile

  const [form, setForm] = useState({
    name:       user?.name   ?? '',
    phone:      user?.phone  ?? '',
    area:       profile?.area   ?? '',
    rate:       profile?.rate   ?? '',
    skills:     profile?.skills ?? [],
    bio:        profile?.bio    ?? '',
    experience: profile?.experience ?? '',
  })
  const [saved, setSaved]     = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const toggleSkill = (skill) => setForm((f) => ({
    ...f,
    skills: f.skills.includes(skill)
      ? f.skills.filter((s) => s !== skill)
      : [...f.skills, skill],
  }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data } = await updateWorkerAPI({
        skills:     form.skills,
        area:       form.area,
        rate:       form.rate,
        bio:        form.bio,
        experience: form.experience,
      })
      updateUser({ workerProfile: { ...profile, ...data } })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <WorkerLayout>
      <div className="wp-page">
        <div className="wp-header">
          <h1 className="wp-title">Your profile</h1>
          <p className="wp-sub">This is what customers see when they find you</p>
        </div>

        {/* Preview card */}
        <div className="wp-preview">
          <div className="wp-preview-avatar">{user?.name?.[0] ?? 'W'}</div>
          <div className="wp-preview-info">
            <div className="wp-preview-name">{form.name || user?.name}</div>
            <div className="wp-preview-skills">
              {form.skills.slice(0, 3).join(' · ') || 'No skills added'}
            </div>
            <div className="wp-preview-meta">
              <span>📍 {form.area || 'Area not set'}</span>
              <span>₹{form.rate || '—'}/hr</span>
              <span>⭐ {profile?.rating > 0 ? profile.rating.toFixed(1) : 'New'}</span>
            </div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: profile?.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
              color: profile?.status === 'ACTIVE' ? '#166534' : '#92400e'
            }}>
              {profile?.status ?? 'PENDING'}
            </span>
          </div>
        </div>

        {error && <div className="stp-error">{error}</div>}

        <form onSubmit={handleSave} className="wp-form">
          <div className="wp-section">
            <h2 className="wp-section-title">Basic info</h2>
            <div className="wp-fields">
              <div className="wp-field">
                <label>Full name</label>
                <input value={form.name} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="wp-field">
                <label>Phone number</label>
                <input value={form.phone} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="wp-field full">
                <label>Short bio <span className="wp-hint">(shown on your profile to customers)</span></label>
                <textarea rows={3}
                  placeholder="e.g. 5 years experience in painting. Available 7 days a week."
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  style={{ padding: '10px 14px', border: '1.5px solid var(--border)', borderRadius: 10, fontFamily: 'inherit', fontSize: 14, resize: 'vertical', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div className="wp-section">
            <h2 className="wp-section-title">Work details</h2>
            <div className="wp-fields">
              <div className="wp-field">
                <label>Service area</label>
                <input placeholder="e.g. Gurugram, Sector 29" value={form.area} onChange={(e) => set('area', e.target.value)} />
              </div>
              <div className="wp-field">
                <label>Hourly rate (₹)</label>
                <input type="number" min="50" placeholder="e.g. 500" value={form.rate} onChange={(e) => set('rate', e.target.value)} />
              </div>
              <div className="wp-field">
                <label>Experience</label>
                <input placeholder="e.g. 5 years" value={form.experience} onChange={(e) => set('experience', e.target.value)} />
              </div>
              <div className="wp-field full">
                <label>Your skills</label>
                <div className="wp-skills-grid">
                  {ALL_SKILLS.map((skill) => (
                    <button key={skill} type="button"
                      className={`wp-skill-chip ${form.skills.includes(skill) ? 'active' : ''}`}
                      onClick={() => toggleSkill(skill)}
                    >{skill}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="wp-footer">
            {saved && <div className="wp-saved">✅ Profile saved!</div>}
            <button type="submit" className="wp-save-btn" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>

        <div className="wp-danger-zone">
          <h2 className="wp-section-title">Account</h2>
          <button className="wp-logout-btn" onClick={() => { logout(); window.location.href = '/login' }}>
            Sign out
          </button>
        </div>
      </div>
    </WorkerLayout>
  )
}