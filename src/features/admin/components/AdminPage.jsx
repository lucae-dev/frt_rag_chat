import { useCallback, useEffect, useState } from 'react';
import { AdminApiError, downloadChatEvaluations, fetchChatEvaluations } from '../services/adminApi';
import '../styles/admin.css';

const ADMIN_TOKEN_KEY = 'commercialista-ai-admin-token';
const PAGE_SIZE = 25;

const readStoredToken = () => {
  try {
    return window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

const storeToken = (token) => {
  try {
    if (token) window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    else window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {
    // The dashboard still works when session storage is unavailable.
  }
};

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—';

const feedbackLabel = (item) => {
  if (item.rating === 1) return '👍 Utile';
  if (item.rating === -1) return `👎 ${item.feedbackReason || 'Non utile'}`;
  return 'Nessun feedback';
};

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

function SourceList({ sources }) {
  if (!sources?.length) return <span className="admin-muted">Nessuna</span>;
  return (
    <ol className="admin-sources">
      {sources.map((source) => (
        <li key={`${source.rank}-${source.officialUrl}`}>
          {source.officialUrl ? (
            <a href={source.officialUrl} rel="noreferrer" target="_blank">
              [S{source.rank}] {source.title} {source.articleReference}
            </a>
          ) : `[S${source.rank}] ${source.title || ''} ${source.articleReference || ''}`}
        </li>
      ))}
    </ol>
  );
}

function EvaluationTable({ items }) {
  if (!items.length) {
    return <div className="admin-empty">Nessuna interazione corrisponde ai filtri.</div>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Domanda e risposta</th>
            <th>Feedback</th>
            <th>Fonti recuperate</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.interactionId}>
              <td className="admin-table__date">
                {formatDate(item.startedAt)}
                <span className={`admin-status admin-status--${item.status?.toLowerCase()}`}>{item.status}</span>
              </td>
              <td>
                <strong>{item.question}</strong>
                <details>
                  <summary>Mostra risposta</summary>
                  <div className="admin-answer">{item.answer || 'Risposta non disponibile'}</div>
                </details>
              </td>
              <td>
                <span className={`admin-feedback admin-feedback--${item.rating ?? 'none'}`}>
                  {feedbackLabel(item)}
                </span>
                {item.feedbackComment && <p>{item.feedbackComment}</p>}
              </td>
              <td><SourceList sources={item.sources} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminPage() {
  const [token, setToken] = useState(readStoredToken);
  const [loginError, setLoginError] = useState('');
  const [page, setPage] = useState({ items: [], total: 0, limit: PAGE_SIZE, offset: 0 });
  const [offset, setOffset] = useState(0);
  const [rating, setRating] = useState('');
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  const logOut = useCallback((message = '') => {
    storeToken('');
    setToken('');
    setLoginError(message);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const result = await fetchChatEvaluations(token, {
        limit: PAGE_SIZE,
        offset,
        rating,
        search,
      });
      storeToken(token);
      setPage(result);
      setLoginError('');
    } catch (requestError) {
      if (requestError instanceof AdminApiError && [401, 403].includes(requestError.status)) {
        logOut('Token non valido.');
      } else {
        setError('Impossibile caricare le conversazioni. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, offset, rating, search, logOut]);

  useEffect(() => {
    load();
  }, [load]);

  const applySearch = (event) => {
    event.preventDefault();
    setOffset(0);
    setSearch(searchDraft.trim());
  };

  const changeRating = (event) => {
    setOffset(0);
    setRating(event.target.value);
  };

  const exportCsv = async () => {
    setExporting(true);
    setError('');
    try {
      const blob = await downloadChatEvaluations(token, { rating, search });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chat-evaluations.csv';
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Impossibile esportare il CSV.');
    } finally {
      setExporting(false);
    }
  };

  if (!token) {
    return <AdminLogin error={loginError} onLogin={setToken} />;
  }

  const lastItem = Math.min(offset + page.items.length, page.total);

  return (
    <main className="admin-page ph-no-capture">
      <header className="admin-header">
        <div>
          <p className="admin-eyebrow">Commercialista AI</p>
          <h1>Domande e feedback</h1>
          <p>{page.total} interazioni trovate</p>
        </div>
        <div className="admin-header__actions">
          <a href="/">Apri la chat</a>
          <button className="admin-button--secondary" onClick={() => logOut()} type="button">Esci</button>
        </div>
      </header>

      <section className="admin-toolbar" aria-label="Filtri">
        <form onSubmit={applySearch}>
          <input
            aria-label="Cerca nelle conversazioni"
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="Cerca domanda o risposta"
            type="search"
            value={searchDraft}
          />
          <button type="submit">Cerca</button>
        </form>
        <select aria-label="Filtra per feedback" onChange={changeRating} value={rating}>
          <option value="">Tutti i feedback</option>
          <option value="1">👍 Utili</option>
          <option value="-1">👎 Non utili</option>
          <option value="0">Senza feedback</option>
        </select>
        <button disabled={exporting} onClick={exportCsv} type="button">
          {exporting ? 'Esportazione…' : 'Scarica CSV'}
        </button>
        <button className="admin-button--secondary" disabled={loading} onClick={load} type="button">
          Aggiorna
        </button>
      </section>

      {error && <p className="admin-error" role="alert">{error}</p>}
      {loading ? <div className="admin-loading">Caricamento…</div> : <EvaluationTable items={page.items} />}

      <nav className="admin-pagination" aria-label="Paginazione">
        <button
          disabled={offset === 0 || loading}
          onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
          type="button"
        >
          Precedenti
        </button>
        <span>{page.total ? `${offset + 1}–${lastItem} di ${page.total}` : '0 risultati'}</span>
        <button
          disabled={offset + PAGE_SIZE >= page.total || loading}
          onClick={() => setOffset(offset + PAGE_SIZE)}
          type="button"
        >
          Successive
        </button>
      </nav>
    </main>
  );
}

export default AdminPage;
