import config from '../../../config';

export const loadAuthSession = async () => {
  const response = await fetch(`${config.API_BASE_URL}/api/auth/session`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Session request failed with status ${response.status}.`);
  }
  return response.json();
};

export const logout = async (csrfToken) => {
  const response = await fetch(`${config.API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-XSRF-TOKEN': csrfToken },
  });
  if (!response.ok) {
    throw new Error(`Logout failed with status ${response.status}.`);
  }
};
