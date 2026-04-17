import { Link } from 'react-router-dom'

function formatLastActive(isoDate) {
  const now = new Date()
  const date = new Date(isoDate)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function RoomCard({ room }) {
  return (
    <Link to={`/rooms/${room.id}`} style={{ textDecoration: 'none' }}>
      <div className="whatsapp-room-item">
        <div className="room-avatar">👤</div>

        <div className="room-info">
          <div className="room-name-row">
            <h3 className="room-name">{room.name}</h3>
            <span className="room-time">{formatLastActive(room.lastActive)}</span>
          </div>
          <div className="room-message-row">
            <p className="room-last-message">{room.lastMessage}</p>
            {room.unreadCount ? <span className="unread-pill">{room.unreadCount}</span> : null}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default RoomCard
