import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platformName: 'SmartTalentPlatform',
    commissionPct: 10,
    autoApprove: false,
    emailNotifs: true,
    maxJobRadius: 20,
    minWorkerRating: 3.5,
  })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setSettings(s => ({ ...s, [k]: v }))

  const handleSave = e => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminLayout>
      <div className="as-page">

        <div className="as-header">
          <h1 className="as-title">Settings</h1>
          <p className="as-sub">Configure platform-wide settings</p>
        </div>

        <form onSubmit={handleSave} className="as-form">

          <div className="as-section">
            <h2 className="as-section-title">Platform</h2>
            <div className="as-fields">
              <div className="as-field full">
                <label>Platform name</label>
                <input value={settings.platformName} onChange={e => set('platformName', e.target.value)} />
              </div>
              <div className="as-field">
                <label>Commission (%)</label>
                <input type="number" min="0" max="50" value={settings.commissionPct} onChange={e => set('commissionPct', +e.target.value)} />
                <span className="as-hint">Taken from each completed job</span>
              </div>
              <div className="as-field">
                <label>Max job radius (km)</label>
                <input type="number" min="1" max="100" value={settings.maxJobRadius} onChange={e => set('maxJobRadius', +e.target.value)} />
              </div>
            </div>
          </div>

          <div className="as-section">
            <h2 className="as-section-title">Workers</h2>
            <div className="as-fields">
              <div className="as-field">
                <label>Minimum rating to stay active</label>
                <input type="number" step="0.5" min="1" max="5" value={settings.minWorkerRating} onChange={e => set('minWorkerRating', +e.target.value)} />
              </div>
            </div>
            <div className="as-toggle-row">
              <div>
                <div className="as-toggle-label">Auto-approve new workers</div>
                <div className="as-toggle-desc">Workers go live immediately without admin review</div>
              </div>
              <div
                className={`as-toggle ${settings.autoApprove ? 'on' : ''}`}
                onClick={() => set('autoApprove', !settings.autoApprove)}
              >
                <div className="as-toggle-knob" />
              </div>
            </div>
          </div>

          <div className="as-section">
            <h2 className="as-section-title">Notifications</h2>
            <div className="as-toggle-row">
              <div>
                <div className="as-toggle-label">Email notifications</div>
                <div className="as-toggle-desc">Send emails for new disputes, signups and job completions</div>
              </div>
              <div
                className={`as-toggle ${settings.emailNotifs ? 'on' : ''}`}
                onClick={() => set('emailNotifs', !settings.emailNotifs)}
              >
                <div className="as-toggle-knob" />
              </div>
            </div>
          </div>

          <div className="as-footer">
            {saved && <span className="as-saved">✅ Settings saved!</span>}
            <button type="submit" className="as-save-btn">Save settings</button>
          </div>

        </form>

      </div>
    </AdminLayout>
  )
}