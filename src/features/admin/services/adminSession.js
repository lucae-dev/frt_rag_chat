const ADMIN_TOKEN_KEY = 'commercialista-ai-admin-token';

export const readAdminToken = () => {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const storeAdminToken = (token) => {
  try {
    if (token) window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // Authentication still works for the current render when storage is unavailable.
  }
};
