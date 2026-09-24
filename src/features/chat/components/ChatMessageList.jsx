import { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';

const SUGGESTED_QUESTIONS = [
  'Quali sono le categorie di reddito previste dall’articolo 6 del TUIR?',
  'Cosa prevede l’articolo 1 del DPR IVA 633/1972?',
  'Cosa stabilisce l’articolo 2043 del Codice Civile?',
  'Quando si può emettere una nota di variazione IVA in una procedura concorsuale?',
];

function ChatMessageList({ messages, onFeedback, onSuggestion }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  if (!messages.length) {
    return (
      <section className="chat-empty-state">
        <h1>Come posso aiutarti?</h1>
        <p>Fai una domanda fiscale oppure prova uno degli esempi.</p>
        <div className="chat-suggestions">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button key={question} onClick={() => onSuggestion(question)} type="button">
              {question}
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="chat-message-list" aria-live="polite">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} onFeedback={onFeedback} />
      ))}
      <div ref={bottomRef} />
    </section>
  );
}

export default ChatMessageList;
