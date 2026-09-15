// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import API_BASE_URL from '../api/apiConfig'

function ForgotPassword() {
  const [step, setStep] = useState('email') // 'email' | 'sent'
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Please enter your email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Call the backend forgot-password endpoint
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
      })

      // We treat any non-5xx response as "success" to avoid user enumeration
      if (response.ok || response.status === 404) {
        setStep('sent')
      } else {
        const data = await response.json().catch(() => ({}))
        setError(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      // Network error — still show success to avoid enumeration
      setStep('sent')
    } finally {
      setLoading(false)
    }
  }

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f7f8fc',
    padding: '20px',
  }

  const cardStyle = {
    background: 'white',
    padding: '48px 40px',
    borderRadius: '16px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  const headingStyle = {
    fontSize: '26px',
    fontWeight: '700',
    color: '#1a1a2e',
    margin: 0,
  }

  const subtextStyle = {
    color: '#6b7280',
    fontSize: '15px',
    margin: 0,
    lineHeight: '1.5',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const buttonStyle = {
    width: '100%',
    padding: '13px',
    background: loading ? '#a89bf7' : '#6C63FF',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'background 0.2s',
  }

  const errorStyle = {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
  }

  const backStyle = {
    color: '#6C63FF',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '14px',
    textAlign: 'center',
  }

  if (step === 'sent') {
    return (
      <div style={containerStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', alignItems: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#f0eeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
          }}>
            ✉️
          </div>

          <h2 style={headingStyle}>Check your email</h2>

          <p style={subtextStyle}>
            If <strong>{email}</strong> is registered with Huddle, you'll
            receive a password reset link shortly. Check your inbox (and
            spam folder, just in case).
          </p>

          <Link to="/login" style={backStyle}>
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div>
          <h2 style={headingStyle}>Reset your password</h2>
          <p style={{ ...subtextStyle, marginTop: '6px' }}>
            Enter the email you signed up with and we'll send you a
            reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="forgot-email" style={labelStyle}>
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError('')
              }}
              placeholder="name@gmail.com"
              style={inputStyle}
              autoComplete="email"
              autoFocus
            />
            {error && <p style={{ ...errorStyle, marginTop: '6px' }}>{error}</p>}
          </div>

          <button type="submit" style={buttonStyle} disabled={loading}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>

        <Link to="/login" style={backStyle}>
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword