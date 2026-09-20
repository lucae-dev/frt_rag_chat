import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

function ChatMessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (!messages.length) {
    return (
      <section className="chat-empty-state">
        <h1>Come posso aiutarti?</h1>
        <p>Fai una domanda: le risposte supportano Markdown, elenchi, tabelle e blocchi di codice.</p>
      </section>
    );
  }

  return (
    <section className="chat-message-list" aria-live="polite">
      {messages.map((message) => <ChatMessage key={message.id} message={message} />)}
      <div ref={bottomRef} />
    </section>
  );
}

export default ChatMessageList;
