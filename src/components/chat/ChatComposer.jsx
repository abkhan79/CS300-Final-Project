import { useState } from 'react'

function ChatComposer({ onSend, disabled }) {
  const [draft, setDraft] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const text = draft.trim()
    if (!text) {
      return
    }

    onSend(text)
    setDraft('')
  }

  return (
    <form className="chat-composer" onSubmit={handleSubmit}>
      <label htmlFor="messageInput" className="sr-only">
        Type your message
      </label>
      <input
        id="messageInput"
        className="input"
        placeholder="Type a message"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        disabled={disabled}
      />
      <button className="button" disabled={disabled || !draft.trim()} type="submit">
        ➤
      </button>
    </form>
  )
}

export default ChatComposer
