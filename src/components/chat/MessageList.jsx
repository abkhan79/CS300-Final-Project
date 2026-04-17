function formatTime(timestamp) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function MessageStatus({ isOwnMessage, status }) {
  if (!isOwnMessage) {
    return null
  }

  if (status === 'read') {
    return <span className="message-status">✓✓</span>
  }

  return <span className="message-status">✓</span>
}

function MessageList({ messages, currentUserId }) {
  if (!messages.length) {
    return (
      <div className="empty-state">
        <p>No messages yet. Say hi to start the conversation.</p>
      </div>
    )
  }

  return (
    <ul className="message-list">
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUserId

        return (
          <li
            key={message.id}
            className={isOwnMessage ? 'message message--me' : 'message'}
          >
            <p className="message-sender">{message.senderName}</p>
            <p>{message.text}</p>
            <div className="message-meta">
              <span className="message-time">{formatTime(message.timestamp)}</span>
              <MessageStatus isOwnMessage={isOwnMessage} status={message.status} />
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default MessageList
