const formatDate = (value) => value
  ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : '—';

const feedbackLabel = (item) => {
  if (item.rating === 1) return '👍 Utile';
  if (item.rating === -1) return `👎 ${item.feedbackReason || 'Non utile'}`;
  return 'Nessun feedback';
};

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

export default EvaluationTable;
