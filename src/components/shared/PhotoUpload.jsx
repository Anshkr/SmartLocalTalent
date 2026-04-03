import { useState, useRef } from 'react'
import useAuthStore from '../../store/authStore'
import API from '../../lib/api'

export default function PhotoUpload({ size = 64, editable = true }) {
  const { user, updateUser } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(user?.avatar || null)
  const inputRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.')
      return
    }

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)

    // Upload to backend
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const { data } = await API.post('/auth/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateUser({ avatar: data.avatarUrl })
      setPreview(data.avatarUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      // Keep local preview even if upload fails
    } finally {
      setUploading(false)
    }
  }

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() ?? '?'

  return (
    <div className="pu-wrap" style={{ '--size': size + 'px' }}>
      <div className="pu-avatar">
        {preview ? (
          <img src={preview} alt="avatar" className="pu-img" />
        ) : (
          <span className="pu-initials">{initials}</span>
        )}
        {uploading && <div className="pu-overlay">⏳</div>}
      </div>

      {editable && (
        <>
          <button
            className="pu-edit-btn"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Change photo"
          >
            {uploading ? '…' : '📷'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFile}
          />
        </>
      )}
    </div>
  )
}