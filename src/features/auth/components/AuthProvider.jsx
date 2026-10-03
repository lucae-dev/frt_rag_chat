import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadAuthSession, logout as requestLogout } from '../services/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const nextSession = await loadAuthSession();
      setSession(nextSession);
      setError(null);
      return nextSession;
    } catch (requestError) {
      setError(requestError);
      return null;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    if (!session?.csrfToken) return;
    await requestLogout(session.csrfToken);
    await refresh();
  }, [refresh, session?.csrfToken]);

  const value = useMemo(() => ({ session, error, refresh, logout }), [session, error, refresh, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
