import { render, screen } from '@testing-library/react';
import App from './App';
import { loadAuthSession } from './features/auth/services/authApi';

vi.mock('./features/auth/services/authApi', () => ({
  loadAuthSession: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

vi.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

beforeEach(() => {
  loadAuthSession.mockResolvedValue({
    authenticated: true,
    user: { id: 'user-1', email: 'utente@example.com' },
    usage: { plan: 'FREE', used: 3, limit: 50, remaining: 47 },
    csrfToken: 'csrf-token',
    loginUrl: '/oauth2/authorization/google',
  });
});

test('renders the authenticated chat and usage', async () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(await screen.findByText('Commercialista AI')).toBeInTheDocument();
  expect(screen.getByText('3/50 domande')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /come posso aiutarti/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /articolo 6 del tuir/i })).toBeInTheDocument();
  expect(screen.getByText(/non inserire dati identificativi dei clienti/i)).toBeInTheDocument();
});

test('renders Google login for an anonymous visitor', async () => {
  loadAuthSession.mockResolvedValueOnce({
    authenticated: false,
    csrfToken: 'anonymous-csrf',
    loginUrl: '/oauth2/authorization/google',
  });

  render(<App />);

  const login = await screen.findByRole('link', { name: /continua con google/i });
  expect(login).toHaveAttribute('href', expect.stringContaining('/oauth2/authorization/google'));
});
