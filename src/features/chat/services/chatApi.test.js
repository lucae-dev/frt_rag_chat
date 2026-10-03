import { saveChatFeedback, streamAssistantResponse } from './chatApi';

const encode = (value) => Uint8Array.from([...value].map((character) => character.charCodeAt(0)));

const streamingResponse = (chunks, contentType = 'text/event-stream') => {
  const releaseLock = vi.fn();
  const reader = {
    read: vi.fn(),
    releaseLock,
  };
  chunks.forEach((chunk) => reader.read.mockResolvedValueOnce({ value: encode(chunk), done: false }));
  reader.read.mockResolvedValueOnce({ value: undefined, done: true });
  return {
    response: {
      ok: true,
      headers: new Headers({ 'content-type': contentType }),
      body: { getReader: () => reader },
    },
    releaseLock,
  };
};

afterEach(() => {
  vi.restoreAllMocks();
});

test('decodes SSE events even when network chunks split an event', async () => {
  const { response, releaseLock } = streamingResponse([
    'data:Ciao\n\ndata: mo',
    'ndo\n\ndata:[DONE]\n\n',
  ]);
  global.fetch = vi.fn().mockResolvedValue(response);
  const onChunk = vi.fn();

  await streamAssistantResponse({ message: 'domanda' }, onChunk);

  expect(onChunk.mock.calls.map(([chunk]) => chunk)).toEqual(['Ciao', ' mondo']);
  expect(releaseLock).toHaveBeenCalledOnce();
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/chat/stream'),
    expect.objectContaining({ method: 'POST' }),
  );
});

test('rejects unsuccessful chat responses', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503 });

  await expect(streamAssistantResponse({ message: 'domanda' }, vi.fn()))
    .rejects.toThrow('status 503');
});

test('sends feedback with the interaction id and session id', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true });

  await saveChatFeedback('interaction-1', { sessionId: 'session-1', rating: 1 });

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/chat/interactions/interaction-1/feedback'),
    expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ sessionId: 'session-1', rating: 1 }),
    }),
  );
});
