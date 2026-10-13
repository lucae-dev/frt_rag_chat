import { useChat } from '../hooks/useChat';
import '../styles/chat.css';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';

function ChatPage() {
  const { messages, isSending, sendMessage, submitFeedback } = useChat();

  return (
    <main className="chat-page">
      <header className="chat-header">Commercialista AI</header>
      <div className="chat-page__content">
        <ChatMessageList
          messages={messages}
          onFeedback={submitFeedback}
          onSuggestion={sendMessage}
        />
      </div>
      <footer className="chat-page__footer">
        <ChatComposer disabled={isSending} onSend={sendMessage} />
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
