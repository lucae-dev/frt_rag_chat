import { useChat } from '../hooks/useChat';
import '../styles/chat.css';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';

function ChatPage({ session, onUsageChanged, onLogout }) {
  const { messages, isSending, sendMessage, submitFeedback } = useChat({
    csrfToken: session.csrfToken,
    onUsageChanged,
  });
  const limitReached = session.usage.remaining === 0;

  return (
    <main className="chat-page">
      <header className="chat-header">
        <span>Commercialista AI</span>
        <div className="chat-account">
          <span>{session.usage.used}/{session.usage.limit} domande questa settimana</span>
          <button type="button" onClick={onLogout}>Esci</button>
        </div>
      </header>
      <div className="chat-page__content">
        <ChatMessageList
          messages={messages}
          onFeedback={submitFeedback}
          onSuggestion={sendMessage}
        />
      </div>
      <footer className="chat-page__footer">
        {limitReached && <p className="chat-limit">Limite settimanale FREE raggiunto.</p>}
        <ChatComposer disabled={isSending || limitReached} onSend={sendMessage} />
        <p>
          Le sessioni e le interazioni vengono usate per migliorare il servizio; i contenuti della chat sono
          mascherati nelle registrazioni. Non inserire dati identificativi dei clienti. Le risposte possono
          contenere errori: verifica sempre le informazioni importanti.
        </p>
      </footer>
    </main>
  );
}

export default ChatPage;
