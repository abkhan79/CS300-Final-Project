function ContactCard({ contact, hasChat, onStartChat }) {
  return (
    <article className="card contact-card">
      <div>
        <h3>{contact.name}</h3>
        <p className="muted">{contact.phone}</p>
        <p className="muted">{contact.status}</p>
      </div>

      <button className="button button--small" onClick={() => onStartChat(contact.id)} type="button">
        {hasChat ? 'Open Chat' : 'Start Chat'}
      </button>
    </article>
  )
}

export default ContactCard
