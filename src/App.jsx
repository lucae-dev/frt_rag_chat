import ChatPage from './features/chat/components/ChatPage';
import AdminPage from './features/admin/components/AdminPage';

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminPage />;
  }
  return <ChatPage />;
}

export default App;
