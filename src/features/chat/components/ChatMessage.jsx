import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { linkInlineCitations } from '../services/citationLinks';
import ChatFeedback from './ChatFeedback';

function ExternalLink({ href, children }) {
  return <a href={href} target="_blank" rel="noreferrer">{children}</a>;
}

function ChatMessage({ message, onFeedback }) {
  const isUser = message.role === 'user';
  const content = isUser ? message.content : linkInlineCitations(message.content);

  return (
    <article className={`chat-message ${isUser ? 'chat-message--user' : 'chat-message--assistant'}`}>
      <div className="chat-message__avatar" aria-hidden="true">{isUser ? 'U' : 'AI'}</div>
      <div className="chat-message__content">
        {message.content ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ExternalLink }}>{content}</ReactMarkdown>
        ) : (
          <span className="chat-message__cursor" aria-label="Risposta in arrivo" />
        )}
        {!isUser && <ChatFeedback message={message} onFeedback={onFeedback} />}
      </div>
    </article>
  );
}

export default ChatMessage;
