import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import AdminPage from './AdminPage';

beforeEach(() => {
  window.sessionStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('loads evaluations after the admin token is entered', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      items: [{
        interactionId: '11111111-1111-4111-8111-111111111111',
        startedAt: '2026-09-24T12:00:00Z',
        status: 'COMPLETED',
        question: 'Quali redditi prevede il TUIR?',
        answer: 'Sei categorie [S1].',
        rating: 1,
        sources: [],
      }],
      total: 1,
      limit: 25,
      offset: 0,
    }),
  });

  render(<AdminPage />);
  fireEvent.change(screen.getByLabelText('Token amministratore'), { target: { value: 'secret-token' } });
  fireEvent.click(screen.getByRole('button', { name: 'Accedi' }));

  await waitFor(() => expect(screen.getByText('Quali redditi prevede il TUIR?')).toBeInTheDocument());
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/admin/chat-interactions?'),
    expect.objectContaining({ headers: { 'X-Admin-Token': 'secret-token' } }),
  );
  expect(screen.getByText('👍 Utile')).toBeInTheDocument();
});
