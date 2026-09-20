import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <article className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <div className="chat-message__avatar" aria-hidden="true">{isUser ? 'U' : 'AI'}</div>
      <div className="chat-message__content">
        {message.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        ) : (
          <span className="chat-message__cursor" aria-label="Risposta in arrivo" />
        )}
      </div>
    </article>
  );
}

export default ChatMessage;
