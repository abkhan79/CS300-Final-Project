import { useState } from 'react'
import { useChat } from '../hooks/useChat'

function FriendsPage() {
  const {
    state: { friends },
    addFriend,
  } = useChat()

  const [search, setSearch] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState('Online')

  const filteredFriends = friends.filter((friend) => {
    if (!search.trim()) return true
    return friend.name.toLowerCase().includes(search.toLowerCase())
  })

  function handleAddFriend(event) {
    event.preventDefault()

    const normalizedName = name.trim()
    if (!normalizedName) {
      return
    }

    addFriend(normalizedName, status)
    setName('')
    setStatus('Online')
  }

  return (
    <section className="page fade-in">
      <div className="page-heading">
        <h1>Friends</h1>
        <p style={{ color: '#fff' }}>Manage your friends and see who is online.</p>
      </div>

      <div className="split-grid" style={{ marginBottom: '24px' }}>
        <article className="card" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontWeight: 800 }}>Add Friend</h2>
          <form className="stack-form" onSubmit={handleAddFriend}>
            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="friendName" style={{
                display: 'block',
                fontWeight: 700,
                marginBottom: '6px',
                fontSize: '0.9rem',
              }}>
                Friend's Name
              </label>
              <input
                id="friendName"
                className="input"
                placeholder="e.g. Sarah"
                value={name}
                onChange={(event) => setName(event.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '0.95rem',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="friendStatus" style={{
                display: 'block',
                fontWeight: 700,
                marginBottom: '6px',
                fontSize: '0.9rem',
              }}>
                Status
              </label>
              <select
                id="friendStatus"
                className="input"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  border: '2px solid #e0e0e0',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  background: '#fff',
                }}
              >
                <option>Online</option>
                <option>Away</option>
                <option>Offline</option>
              </select>
            </div>

            <button 
              className="button" 
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'linear-gradient(135deg, #87ceeb 0%, #00bfff 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
              }}
            >
              Add Friend
            </button>
          </form>
        </article>

        <article className="card" style={{ padding: '24px', background: '#fff' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px', fontWeight: 800 }}>Find Friends</h2>
          <input
            className="input"
            placeholder="Search by name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '2px solid #e0e0e0',
              fontSize: '0.95rem',
              marginBottom: '8px',
            }}
          />
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
            {filteredFriends.length} friend(s) found
          </p>
        </article>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {filteredFriends.map((friend) => (
          <div
            key={friend.id}
            className="card"
            style={{
              padding: '16px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background:
                  friend.status === 'Online'
                    ? 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
                    : friend.status === 'Away'
                      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
                      : 'linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                flexShrink: 0,
              }}
            >
              👤
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '0.95rem', fontWeight: 700 }}>
                {friend.name}
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background:
                      friend.status === 'Online'
                        ? '#34d399'
                        : friend.status === 'Away'
                          ? '#fbbf24'
                          : '#d1d5db',
                  }}
                />
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#666' }}>
                  {friend.status}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredFriends.length === 0 && (
          <div className="empty-state card">
            <p>No friends match your search. Add one to get started!</p>
          </div>
        )}
      </div>
    </section>
  )
}

export default FriendsPage
