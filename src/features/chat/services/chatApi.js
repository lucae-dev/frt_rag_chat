import config from '../../../config';

const isSseResponse = (response) =>
  response.headers.get('content-type')?.includes('text/event-stream');

const getEventPayload = (event) =>
  event
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    // Spring writes each Flux token immediately after `data:`. Do not trim:
    // a leading space is part of a token (for example `data: Tit`).
    .map((line) => line.slice(5))
    .join('\n');

const emitCompleteEvents = (state, onChunk) => {
  const events = state.buffer.split(/\r?\n\r?\n/);
  state.buffer = events.pop() || '';

  events.forEach((event) => {
    const payload = getEventPayload(event);
    if (payload && payload !== '[DONE]') onChunk(payload);
  });
};

/** Streams the assistant answer, calling onChunk for every received token. */
export const streamAssistantResponse = async (message, onChunk) => {
  const response = await fetch(`${config.API_BASE_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}.`);
  }
  if (!response.body) {
    throw new Error('Chat response has no body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const state = { buffer: '' };
  const sse = isSseResponse(response);

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (value) {
        state.buffer += decoder.decode(value, { stream: !done });
        if (sse) emitCompleteEvents(state, onChunk);
        else {
          onChunk(state.buffer);
          state.buffer = '';
        }
      }
      if (done) break;
    }

    state.buffer += decoder.decode();
    if (sse && state.buffer) {
      const payload = getEventPayload(state.buffer);
      if (payload && payload !== '[DONE]') onChunk(payload);
    } else if (!sse && state.buffer) {
      onChunk(state.buffer);
    }
  } finally {
    reader.releaseLock();
  }
};
