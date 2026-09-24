const NEGATIVE_REASONS = [
  ['INCORRECT', 'Errata'],
  ['INCOMPLETE', 'Incompleta'],
  ['WRONG_SOURCE', 'Fonte sbagliata'],
  ['MISSING_SOURCE', 'Fonte mancante'],
  ['OUTDATED', 'Non aggiornata'],
  ['MISUNDERSTOOD', 'Domanda non compresa'],
  ['OTHER', 'Altro'],
];

function ChatFeedback({ message, onFeedback }) {
  if (message.isStreaming || message.failed || !message.content) return null;

  const feedback = message.feedback;
  const submit = (rating, reason = null) => onFeedback(message.id, rating, reason);

  return (
    <div className="chat-feedback">
      <div className="chat-feedback__rating">
        <span>Risposta utile?</span>
        <button
          aria-label="Risposta utile"
          className={feedback?.rating === 1 ? 'is-selected' : ''}
          disabled={feedback?.status === 'saving'}
          onClick={() => submit(1)}
          type="button"
        >
          👍
        </button>
        <button
          aria-label="Risposta non utile"
          className={feedback?.rating === -1 ? 'is-selected' : ''}
          disabled={feedback?.status === 'saving'}
          onClick={() => submit(-1)}
          type="button"
        >
          👎
        </button>
        {feedback?.status === 'saved' && <span className="chat-feedback__status">Grazie</span>}
        {feedback?.status === 'error' && <span className="chat-feedback__error">Salvataggio non riuscito</span>}
      </div>

      {feedback?.rating === -1 && (
        <div className="chat-feedback__reasons" aria-label="Motivo del feedback negativo">
          {NEGATIVE_REASONS.map(([value, label]) => (
            <button
              className={feedback.reason === value ? 'is-selected' : ''}
              disabled={feedback.status === 'saving'}
              key={value}
              onClick={() => submit(-1, value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ChatFeedback;
