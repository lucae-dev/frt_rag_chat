import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

vi.mock('remark-gfm', () => ({
  __esModule: true,
  default: () => {},
}));

test('renders the chat empty state', () => {
  window.history.pushState({}, '', '/');
  render(<App />);
  expect(screen.getByText('Commercialista AI')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: /come posso aiutarti/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /articolo 6 del tuir/i })).toBeInTheDocument();
  expect(screen.getByText(/non inserire dati identificativi dei clienti/i)).toBeInTheDocument();
});
