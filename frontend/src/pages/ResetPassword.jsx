// src/pages/ResetPassword.jsx
import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { endpoints } from '../api/apiConfig'

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token') || ''
  const uid = searchParams.get('uid') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token || !uid) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h2 style={headingStyle}>Invalid reset link</h2>
          <p style={subtextStyle}>This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" style={linkStyle}>Request a new link</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!password) { setError('Please enter a new password.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }

    setError('')
    setLoading(true)

    try {
      const res = await fetch(endpoints.resetPassword, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, uid, newPassword: password }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setDone(true)
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError(data.message || 'Failed to reset password. The link may have expired.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', alignItems: 'center' }}>
          <div style={iconStyle}>✅</div>
          <h2 style={headingStyle}>Password updated!</h2>
          <p style={subtextStyle}>Your password has been changed. Redirecting you to login…</p>
          <Link to="/login" style={linkStyle}>Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div>
          <h2 style={headingStyle}>Set a new password</h2>
          <p style={{ ...subtextStyle, marginTop: '6px' }}>
            Choose a strong password you haven't used before.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="reset-password" style={labelStyle}>New password</label>
            <div style={inputWrapStyle}>
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError('') }}
                placeholder="At least 6 characters"
                style={inputStyle}
                autoFocus
              />
              <button type="button" style={eyeStyle} onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="reset-confirm" style={labelStyle}>Confirm new password</label>
            <div style={inputWrapStyle}>
              <input
                id="reset-confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setError('') }}
                placeholder="Repeat your password"
                style={inputStyle}
              />
              <button type="button" style={eyeStyle} onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                <EyeIcon open={showConfirm} />
              </button>
            </div>
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <button type="submit" style={{ ...buttonStyle, background: loading ? '#a89bf7' : '#6C63FF' }} disabled={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </button>
        </form>

        <Link to="/login" style={{ ...linkStyle, textAlign: 'center' }}>Back to Login</Link>
      </div>
    </div>
  )
}

const containerStyle = {
  display: 'flex', justifyContent: 'center', alignItems: 'center',
  minHeight: '100vh', background: '#f7f8fc', padding: '20px',
}
const cardStyle = {
  background: 'white', padding: '48px 40px', borderRadius: '16px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px',
  display: 'flex', flexDirection: 'column', gap: '20px',
}
const headingStyle = { fontSize: '26px', fontWeight: '700', color: '#1a1a2e', margin: 0 }
const subtextStyle = { color: '#6b7280', fontSize: '15px', margin: 0, lineHeight: '1.5' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '6px' }
const inputWrapStyle = { position: 'relative', display: 'flex', alignItems: 'center' }
const inputStyle = { width: '100%', padding: '12px 42px 12px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }
const eyeStyle = { position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '0', display: 'flex' }
const buttonStyle = { width: '100%', padding: '13px', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }
const errorStyle = { color: '#ef4444', fontSize: '13px', margin: 0 }
const linkStyle = { color: '#6C63FF', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }
const iconStyle = { width: '64px', height: '64px', borderRadius: '50%', background: '#f0eeff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }

export default ResetPassword
