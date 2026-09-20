import { useChat } from '../hooks/useChat';
import '../styles/chat.css';
import ChatComposer from './ChatComposer';
import ChatMessageList from './ChatMessageList';

function ChatPage() {
  const { messages, isSending, sendMessage } = useChat();

  return (
    <main className="chat-page">
      <header className="chat-header">Commercialista AI</header>
      <div className="chat-page__content">
        <ChatMessageList messages={messages} />
      </div>
      <footer className="chat-page__footer">
        <ChatComposer disabled={isSending} onSend={sendMessage} />
        <p>Le risposte possono contenere errori. Verifica sempre le informazioni importanti.</p>
      </footer>
    </main>
  );
}

export default ChatPage;
