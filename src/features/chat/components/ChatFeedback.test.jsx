import { fireEvent, render, screen } from '@testing-library/react';
import ChatFeedback from './ChatFeedback';

const completedMessage = {
  id: 'message-1',
  interactionId: 'interaction-1',
  content: 'Risposta completa',
  isStreaming: false,
  failed: false,
  feedback: null,
};

test('submits positive feedback', () => {
  const onFeedback = jest.fn();
  render(<ChatFeedback message={completedMessage} onFeedback={onFeedback} />);

  fireEvent.click(screen.getByRole('button', { name: 'Risposta utile' }));

  expect(onFeedback).toHaveBeenCalledWith('message-1', 1, null);
});

test('shows reasons after negative feedback', () => {
  const onFeedback = jest.fn();
  const negativeMessage = {
    ...completedMessage,
    feedback: { rating: -1, reason: null, status: 'saved' },
  };
  render(<ChatFeedback message={negativeMessage} onFeedback={onFeedback} />);

  fireEvent.click(screen.getByRole('button', { name: 'Fonte sbagliata' }));

  expect(onFeedback).toHaveBeenCalledWith('message-1', -1, 'WRONG_SOURCE');
});

test('does not render feedback while streaming', () => {
  const { container } = render(
    <ChatFeedback message={{ ...completedMessage, isStreaming: true }} onFeedback={jest.fn()} />,
  );

  expect(container).toBeEmptyDOMElement();
});
