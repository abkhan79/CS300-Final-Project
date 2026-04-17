import { useState } from 'react'
import { useChat } from '../hooks/useChat'
import { useLocalStorage } from '../hooks/useLocalStorage'

function ProfilePage() {
  const {
    state: { currentUser },
  } = useChat()

  const [isSignedIn, setIsSignedIn] = useLocalStorage('game-night-is-signed-in', true)
  const [name] = useState(currentUser.name)
  const [role] = useState(currentUser.role)

  return (
    <section className="page fade-in">
      <div className="page-heading">
        <h1>Profile</h1>
        <p style={{ color: '#fff' }}>Manage your account and game night settings.</p>
      </div>

      <article className="card profile-card" style={{ padding: '24px', background: '#fff' }}>
        <div className="profile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div
              style={{
                width: '128px',
                height: '128px',
                borderRadius: '28px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #fff 0%, #f7f0ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px',
                boxShadow: '0 12px 28px rgba(255, 20, 147, 0.22)',
                border: '3px solid rgba(255, 255, 255, 0.9)',
              }}
            >
              <img
                src="/butterfly.svg"
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
              />
            </div>
            <h2 style={{ margin: '0 0 4px', fontWeight: 800 }}>{name}</h2>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#666', fontWeight: 600 }}>
              {role}
            </p>
          </div>
          <button
            className="button button--ghost"
            onClick={() => setIsSignedIn((value) => !value)}
            type="button"
            style={{
              padding: '10px 16px',
              background: isSignedIn ? '#ffe0e6' : '#e0e8ff',
              color: isSignedIn ? '#c00' : '#0066cc',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {isSignedIn ? 'Sign out' : 'Sign in'}
          </button>
        </div>

        {isSignedIn ? (
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '2px solid #e0e0e0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '8px', fontWeight: 800 }}>Account Settings</h3>
            <p style={{ color: '#666', marginBottom: '16px', fontSize: '0.95rem' }}>
              All your games and votes are saved locally in this browser.
            </p>
            <button 
              className="button button--ghost" 
              type="button"
              style={{
                padding: '10px 16px',
                background: '#fff0e6',
                color: '#cc6600',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              Clear All Data
            </button>
          </div>
        ) : (
          <div className="empty-state" style={{ marginTop: '16px', padding: '24px', textAlign: 'center', background: '#f5f5f5', borderRadius: '12px' }}>
            <p style={{ margin: 0, fontSize: '1rem', color: '#666', fontWeight: 600 }}>You are currently signed out.</p>
          </div>
        )}
      </article>
    </section>
  )
}

export default ProfilePage
