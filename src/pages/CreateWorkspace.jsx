// src/pages/CreateWorkspace.jsx

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { endpoints } from '../api/apiConfig'

function CreateWorkspace() {
  const [workspaceName, setWorkspaceName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    if (!workspaceName.trim()) {
      setError('Please enter a workspace name')
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      setError('Please login first')
      navigate('/login')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(endpoints.createWorkspace, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workspaceName,
          description: description,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success !== false) {
        setSuccess(`Workspace "${workspaceName}" created successfully!`)

        setWorkspaceName('')
        setDescription('')

        setTimeout(() => {
          navigate('/join-channel')
        }, 1500)
      } else {
        setError(
          data.message ||
          data.error ||
          'Failed to create workspace'
        )
      }
    } catch (err) {
      setError('Cannot reach server. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ===== STYLES =====

  const styles = {
    page: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#ffffff',
      padding: '20px',
    },

    card: {
      background: 'white',
      padding: '48px 40px',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      width: '420px',
      height: '550px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    },

    header: {
      marginBottom: '32px',
    },

    headerH2: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1a1a2e',
      margin: '0 0 8px 0',
    },

    headerP: {
      color: '#6b7280',
      fontSize: '16px',
      margin: '0',
    },

    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },

    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },

    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1a1a2e',
    },

    input: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'all 0.2s ease',
      background: '#f9fafb',
      width: '100%',
      boxSizing: 'border-box',
    },

    button: {
      padding: '14px',
      background: '#6C63FF',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontFamily: 'system-ui, sans-serif',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      marginTop: '8px',
      opacity: loading ? 0.7 : 1,
    },

    error: {
      background: '#fee2e2',
      color: '#ef4444',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '16px',
    },

    success: {
      background: '#d1fae5',
      color: '#065f46',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      textAlign: 'center',
      marginBottom: '16px',
    },

    footer: {
      textAlign: 'center',
      marginTop: '24px',
      fontSize: '14px',
      color: '#6b7280',
    },

    footerLink: {
      color: '#6C63FF',
      fontWeight: '600',
      textDecoration: 'none',
    },
  }

  // ===== INPUT FOCUS EFFECT =====

  const handleFocus = (e) => {
    e.target.style.borderColor = '#6C63FF'
    e.target.style.outline = 'none'
    e.target.style.boxShadow =
      '0 0 0 4px rgba(108, 99, 255, 0.1)'
    e.target.style.background = '#ffffff'
  }

  const handleBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  // ===== BUTTON HOVER EFFECT =====

  const handleButtonHover = (e) => {
    if (!loading) {
      e.target.style.background = '#5A52D5'
      e.target.style.transform = 'translateY(-1px)'
      e.target.style.boxShadow =
        '0 4px 12px rgba(108, 99, 255, 0.3)'
    }
  }

  const handleButtonLeave = (e) => {
    e.target.style.background = '#6C63FF'
    e.target.style.transform = 'translateY(0)'
    e.target.style.boxShadow = 'none'
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <div style={styles.header}>
          <h2 style={styles.headerH2}>
            Create Workspace
          </h2>

          <p style={styles.headerP}>
            Set up your team's workspace to start collaborating.
          </p>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        {success && (
          <div style={styles.success}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>

          <div style={styles.formGroup}>
            <label
              style={styles.label}
              htmlFor="workspaceName"
            >
              Workspace Name
            </label>

            <input
              id="workspaceName"
              type="text"
              placeholder="Enter workspace name"
              value={workspaceName}
              onChange={(e) =>
                setWorkspaceName(e.target.value)
              }
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label
              style={styles.label}
              htmlFor="description"
            >
              Description (optional)
            </label>

            <input
              id="description"
              type="text"
              placeholder="What's this workspace for?"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              style={styles.input}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>

        </form>

        <p style={styles.footer}>
          <Link
            to="/login"
            style={styles.footerLink}
          >
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  )
}

export default CreateWorkspace

