import { useState } from 'react';

function AdminLogin({ error, onLogin }) {
  const [token, setToken] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (token.trim()) onLogin(token.trim());
  };

  return (
    <main className="admin-login ph-no-capture">
      <form className="admin-login__card" onSubmit={submit}>
        <p className="admin-eyebrow">Commercialista AI</p>
        <h1>Dashboard valutazioni</h1>
        <p>Inserisci il token amministratore per consultare le conversazioni raccolte.</p>
        <label htmlFor="admin-token">Token amministratore</label>
        <input
          autoComplete="current-password"
          id="admin-token"
          onChange={(event) => setToken(event.target.value)}
          type="password"
          value={token}
        />
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button type="submit">Accedi</button>
        <a href="/">Torna alla chat</a>
      </form>
    </main>
  );
}

export default AdminLogin;
