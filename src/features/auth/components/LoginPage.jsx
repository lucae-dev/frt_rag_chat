import config from '../../../config';
import '../styles/auth.css';

function LoginPage({ session, error }) {
  const loginUrl = `${config.API_BASE_URL}${session?.loginUrl || '/oauth2/authorization/google'}`;
  const loginFailed = new URLSearchParams(window.location.search).has('error');

  return (
    <main className="auth-page">
      <section className="auth-card">
        <span className="auth-card__eyebrow">Commercialista AI</span>
        <h1>La normativa fiscale, interrogabile.</h1>
        <p>
          Accedi per consultare le fonti ufficiali, salvare feedback utili e tenere sotto controllo il consumo.
        </p>
        {(error || loginFailed) && (
          <p className="auth-card__error">Accesso non riuscito. Riprova tra qualche istante.</p>
        )}
        <a className="auth-card__google" href={loginUrl}>
          <span aria-hidden="true">G</span>
          Continua con Google
        </a>
        <small>Piano FREE · 20 domande a settimana · nessun metodo di pagamento richiesto</small>
      </section>
    </main>
  );
}

export default LoginPage;
