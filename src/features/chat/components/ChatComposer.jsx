import { useState } from 'react';

function ChatComposer({ disabled, onSend }) {
  const [text, setText] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) submit(event);
  };

  return (
    <form className="chat-composer" onSubmit={submit}>
      <textarea
        aria-label="Messaggio"
        disabled={disabled}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Scrivi un messaggio..."
        rows="1"
        value={text}
      />
      <button aria-label="Invia messaggio" disabled={disabled || !text.trim()} type="submit">
        ↑
      </button>
    </form>
  );
}

export default ChatComposer;
