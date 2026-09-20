import { useCallback, useState } from 'react';
import { streamAssistantResponse } from '../services/chatApi';

const createMessage = (role, content) => ({
  id: crypto.randomUUID(),
  role,
  content,
});

const appendToMessage = (messages, messageId, chunk) =>
  messages.map((message) =>
    message.id === messageId
      ? { ...message, content: message.content + chunk }
      : message,
  );

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async (text) => {
    const content = text.trim();
    if (!content || isSending) return;

    const userMessage = createMessage('user', content);
    const assistantMessage = createMessage('assistant', '');
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setIsSending(true);

    try {
      await streamAssistantResponse(content, (chunk) => {
        setMessages((current) => appendToMessage(current, assistantMessage.id, chunk));
      });
    } catch (error) {
      console.error('Unable to receive the assistant response.', error);
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantMessage.id
            ? { ...message, content: 'Mi dispiace, non riesco a completare la risposta in questo momento.' }
            : message,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  return { messages, isSending, sendMessage };
};
