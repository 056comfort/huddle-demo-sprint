// src/pages/ForgotPassword.jsx
import { Link } from 'react-router-dom'

function ForgotPassword() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#ffffff',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '48px 40px',
        borderRadius: '16px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
        width: '420px',
        minHeight: '350px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#1a1a2e',
          margin: '0 0 8px 0'
        }}>
          Reset Password
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '0 0 24px 0'
        }}>
          This feature is coming soon!
        </p>
        <Link to="/login" style={{
          color: '#6C63FF',
          fontWeight: '600',
          textDecoration: 'none',
          fontSize: '14px'
        }}>
          Back to Login
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword