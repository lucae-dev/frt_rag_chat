import { act, renderHook } from '@testing-library/react';
import { useChat } from './useChat';
import { saveChatFeedback, streamAssistantResponse } from '../services/chatApi';

vi.mock('../services/chatApi', () => ({
  saveChatFeedback: vi.fn(),
  streamAssistantResponse: vi.fn(),
}));

vi.mock('../../analytics/services/analytics', () => ({
  captureAnalyticsEvent: vi.fn(),
  questionLengthBucket: vi.fn(() => 'under_50'),
}));

beforeEach(() => {
  window.sessionStorage.clear();
  streamAssistantResponse.mockImplementation(async (request, onChunk) => {
    onChunk('Risposta ');
    onChunk('completa');
  });
  saveChatFeedback.mockResolvedValue(undefined);
});

test('streams an answer and saves feedback for the same interaction', async () => {
  const { result } = renderHook(() => useChat());

  await act(async () => {
    await result.current.sendMessage('  Domanda fiscale  ');
  });

  expect(result.current.messages).toHaveLength(2);
  const assistant = result.current.messages[1];
  expect(assistant).toMatchObject({
    role: 'assistant',
    content: 'Risposta completa',
    isStreaming: false,
    failed: false,
  });
  expect(streamAssistantResponse).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'Domanda fiscale',
      interactionId: assistant.interactionId,
    }),
    expect.any(Function),
  );

  await act(async () => {
    await result.current.submitFeedback(assistant.id, 1);
  });

  expect(saveChatFeedback).toHaveBeenCalledWith(
    assistant.interactionId,
    expect.objectContaining({ rating: 1 }),
  );
  expect(result.current.messages[1].feedback).toEqual({
    rating: 1,
    reason: null,
    status: 'saved',
  });
});

test('marks the assistant message as failed when streaming fails', async () => {
  streamAssistantResponse.mockRejectedValueOnce(new Error('network'));
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { result } = renderHook(() => useChat());

  await act(async () => {
    await result.current.sendMessage('Domanda');
  });

  expect(result.current.messages[1]).toMatchObject({
    failed: true,
    isStreaming: false,
  });
  expect(consoleError).toHaveBeenCalled();
});
