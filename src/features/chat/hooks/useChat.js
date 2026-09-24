import { useCallback, useEffect, useRef, useState } from 'react';
import { captureAnalyticsEvent, questionLengthBucket } from '../../analytics/services/analytics';
import { saveChatFeedback, streamAssistantResponse } from '../services/chatApi';
import { countSources } from '../services/citationLinks';
import { createTrackingId, getSessionId } from '../services/sessionIds';

const createMessage = (role, content, metadata = {}) => ({
  id: createTrackingId(),
  role,
  content,
  ...metadata,
});

const updateMessage = (messages, messageId, changes) =>
  messages.map((message) =>
    message.id === messageId ? { ...message, ...changes } : message,
  );

const appendToMessage = (messages, messageId, chunk) =>
  messages.map((message) =>
    message.id === messageId
      ? { ...message, content: message.content + chunk }
      : message,
  );

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const conversationId = useRef(createTrackingId());
  const sessionId = useRef(getSessionId());
  const chatViewTracked = useRef(false);

  useEffect(() => {
    if (chatViewTracked.current) return;
    chatViewTracked.current = true;
    captureAnalyticsEvent('chat_viewed');
  }, []);

  const sendMessage = useCallback(async (text, options = {}) => {
    const content = text.trim();
    if (!content || isSending) return;

    const startedAt = performance.now();
    let responseContent = '';
    const interactionId = createTrackingId();
    const userMessage = createMessage('user', content);
    const assistantMessage = createMessage('assistant', '', {
      interactionId,
      isStreaming: true,
      failed: false,
      feedback: null,
    });
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setIsSending(true);
    captureAnalyticsEvent('question_submitted', {
      input_type: options.inputType || 'free_text',
      suggestion_id: options.suggestionId || null,
      question_length_bucket: questionLengthBucket(content.length),
    });
    if (options.inputType === 'suggestion') {
      captureAnalyticsEvent('suggested_question_clicked', {
        suggestion_id: options.suggestionId,
      });
    }

    try {
      await streamAssistantResponse({
        message: content,
        interactionId,
        conversationId: conversationId.current,
        sessionId: sessionId.current,
      }, (chunk) => {
        responseContent += chunk;
        setMessages((current) => appendToMessage(current, assistantMessage.id, chunk));
      });
      setMessages((current) => updateMessage(current, assistantMessage.id, { isStreaming: false }));
      captureAnalyticsEvent('answer_completed', {
        duration_ms: Math.round(performance.now() - startedAt),
        source_count: countSources(responseContent),
        answer_length_bucket: questionLengthBucket(responseContent.length),
      });
    } catch (error) {
      console.error('Unable to receive the assistant response.', error);
      setMessages((current) => updateMessage(current, assistantMessage.id, {
        content: 'Mi dispiace, non riesco a completare la risposta in questo momento.',
        isStreaming: false,
        failed: true,
      }));
      captureAnalyticsEvent('answer_failed', {
        duration_ms: Math.round(performance.now() - startedAt),
        error_type: error?.name || 'Error',
      });
    } finally {
      setIsSending(false);
    }
  }, [isSending]);

  const submitFeedback = useCallback(async (messageId, rating, reason = null) => {
    const message = messages.find((candidate) => candidate.id === messageId);
    if (!message?.interactionId || message.failed || message.isStreaming) return;

    const feedback = { rating, reason, status: 'saving' };
    setMessages((current) => updateMessage(current, messageId, { feedback }));

    try {
      await saveChatFeedback(message.interactionId, {
        sessionId: sessionId.current,
        rating,
        reason,
      });
      setMessages((current) => updateMessage(current, messageId, {
        feedback: { rating, reason, status: 'saved' },
      }));
      captureAnalyticsEvent('feedback_submitted', {
        rating,
        reason: reason || 'none',
      });
    } catch (error) {
      console.error('Unable to save chat feedback.', error);
      setMessages((current) => updateMessage(current, messageId, {
        feedback: { rating, reason, status: 'error' },
      }));
    }
  }, [messages]);

  return { messages, isSending, sendMessage, submitFeedback };
};
