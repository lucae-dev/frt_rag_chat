import ChatPage from './features/chat/components/ChatPage';
import AdminPage from './features/admin/components/AdminPage';
import { AuthProvider, useAuth } from './features/auth/components/AuthProvider';
import LoginPage from './features/auth/components/LoginPage';

function UserApp() {
  const { session, error, refresh, logout } = useAuth();

  if (!session && !error) return <main className="app-loading">Caricamento…</main>;
  if (!session?.authenticated) return <LoginPage session={session} error={error} />;

  return <ChatPage session={session} onUsageChanged={refresh} onLogout={logout} />;
}

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />;
  }
  return (
    <AuthProvider>
      <UserApp />
    </AuthProvider>
  );
}

export default App;
