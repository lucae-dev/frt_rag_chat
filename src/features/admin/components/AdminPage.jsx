import { useCallback, useEffect, useState } from 'react';
import { AdminApiError, downloadChatEvaluations, fetchChatEvaluations } from '../services/adminApi';
import { readAdminToken, storeAdminToken } from '../services/adminSession';
import '../styles/admin.css';
import AdminLogin from './AdminLogin';
import EvaluationTable from './EvaluationTable';

const PAGE_SIZE = 25;

function AdminPage() {
  const [token, setToken] = useState(readAdminToken);
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
    storeAdminToken('');
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
      storeAdminToken(token);
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
