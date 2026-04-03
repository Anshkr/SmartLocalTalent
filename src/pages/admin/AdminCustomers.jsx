import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { MOCK_CUSTOMERS } from '../../lib/mockAdmin'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  const toggleBlock = (id) => {
    setCustomers(cs => cs.map(c =>
      c.id === id ? { ...c, status: c.status === 'blocked' ? 'active' : 'blocked' } : c
    ))
    setSelected(null)
  }

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const sel = customers.find(c => c.id === selected)

  return (
    <AdminLayout>
      <div className="ac-page">

        <div className="ac-header">
          <div>
            <h1 className="ac-title">Customers</h1>
            <p className="ac-sub">{customers.length} registered customers</p>
          </div>
          <input
            className="ac-search"
            placeholder="Search customers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="ac-layout">
          <div className="ac-list">
            {filtered.map(c => (
              <div
                key={c.id}
                className={`ac-card ${selected === c.id ? 'selected' : ''} ${c.status === 'blocked' ? 'blocked' : ''}`}
                onClick={() => setSelected(c.id)}
              >
                <div className="ac-avatar">{c.name[0]}</div>
                <div className="ac-info">
                  <div className="ac-name">{c.name}</div>
                  <div className="ac-email">{c.email}</div>
                  <div className="ac-meta">📍 {c.area} · {c.jobsHired} jobs hired</div>
                </div>
                <div className="ac-right">
                  <span className={`ac-badge ${c.status}`}>
                    {c.status === 'active' ? 'Active' : 'Blocked'}
                  </span>
                  <div className="ac-joined">Joined {c.joined}</div>
                </div>
              </div>
            ))}
          </div>

          {sel && (
            <div className="ac-detail">
              <button className="ac-close" onClick={() => setSelected(null)}>✕</button>
              <div className="ac-detail-hero">
                <div className="ac-detail-avatar">{sel.name[0]}</div>
                <h2 className="ac-detail-name">{sel.name}</h2>
                <span className={`ac-detail-status ${sel.status}`}>{sel.status}</span>
              </div>
              <div className="ac-detail-grid">
                <div className="ac-detail-item"><span>Email</span><strong>{sel.email}</strong></div>
                <div className="ac-detail-item"><span>Phone</span><strong>{sel.phone}</strong></div>
                <div className="ac-detail-item"><span>Area</span><strong>{sel.area}</strong></div>
                <div className="ac-detail-item"><span>Joined</span><strong>{sel.joined}</strong></div>
                <div className="ac-detail-item"><span>Jobs hired</span><strong>{sel.jobsHired}</strong></div>
              </div>
              <button
                className={`ac-action-btn ${sel.status === 'blocked' ? 'unblock' : 'block'}`}
                onClick={() => toggleBlock(sel.id)}
              >
                {sel.status === 'blocked' ? '✅ Unblock customer' : '⛔ Block customer'}
              </button>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}