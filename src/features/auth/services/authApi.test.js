import { loadAuthSession, logout } from './authApi';

afterEach(() => {
  vi.restoreAllMocks();
});

test('loads the browser session with credentials', async () => {
  const session = { authenticated: true, csrfToken: 'csrf-token' };
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => session });

  await expect(loadAuthSession()).resolves.toEqual(session);
  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/auth/session'),
    expect.objectContaining({ credentials: 'include' }),
  );
});

test('logs out with the CSRF token', async () => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true });

  await logout('csrf-token');

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining('/api/auth/logout'),
    expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      headers: { 'X-XSRF-TOKEN': 'csrf-token' },
    }),
  );
});
