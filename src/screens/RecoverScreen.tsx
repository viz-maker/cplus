import { useEffect, useState, type FormEvent } from 'react';
import { Brand } from '../components/Brand';

/** Seconds shown on the "back to sign-in" countdown after the link is sent. */
const COUNTDOWN = 5;

export function RecoverScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [remaining, setRemaining] = useState(COUNTDOWN);

  useEffect(() => {
    if (!sent) return;
    const handle = setInterval(() => setRemaining((n) => n - 1), 1000);
    return () => clearInterval(handle);
  }, [sent]);

  useEffect(() => {
    if (sent && remaining <= 0) onBackToLogin();
  }, [sent, remaining, onBackToLogin]);

  function submit(e: FormEvent) {
    e.preventDefault();
    setSent(true);
    setRemaining(COUNTDOWN);
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cp-canvas)',
        padding: 24,
      }}
    >
      <div
        className="cp-anim-fade-up"
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'var(--cp-surface)',
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--cp-radius-surface)',
          boxShadow: 'var(--cp-shadow-overlay)',
          padding: 32,
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Brand tone="onLight" />
        </div>

        {!sent ? (
          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h2
                style={{
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: 700,
                  color: 'var(--cp-navy)',
                  marginBottom: 6,
                }}
              >
                Recuperar acesso
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cp-text-muted)' }}>
                Indique o email da conta. Enviaremos uma ligação para definir uma nova
                palavra-passe.
              </p>
            </div>

            <div>
              <label className="cp-label" htmlFor="cp-rec">
                Email da conta
              </label>
              <input
                id="cp-rec"
                className="cp-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.pt"
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                className="cp-btn cp-btn--outline"
                style={{ flex: 'none' }}
                onClick={onBackToLogin}
              >
                Voltar
              </button>
              <button type="submit" className="cp-btn cp-btn--accent" style={{ flex: 1 }}>
                Enviar ligação
              </button>
            </div>
          </form>
        ) : (
          <div
            className="cp-anim-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
          >
            <div
              role="status"
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '14px 16px',
                borderRadius: 'var(--cp-radius)',
                background: 'var(--cp-success-bg)',
                border: '1px solid var(--cp-success-border)',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--cp-success)',
                  marginTop: 7,
                  flex: 'none',
                }}
              />
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  fontWeight: 500,
                  color: 'var(--cp-success)',
                }}
              >
                Se este email estiver registado, foi enviada uma ligação de recuperação de
                palavra-passe.
              </p>
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cp-text-muted)' }}>
              Verifique também a pasta de spam. A ligação expira em 30 minutos.
            </p>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--cp-text-muted)',
                  marginBottom: 8,
                }}
              >
                <span>A regressar ao início de sessão</span>
                <span style={{ color: 'var(--cp-navy)' }}>{Math.max(remaining, 0)} s</span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 'var(--cp-radius-pill)',
                  background: 'var(--cp-border)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: 'var(--cp-accent)',
                    borderRadius: 'var(--cp-radius-pill)',
                    transition: 'width 1s linear',
                    width: `${Math.max(Math.round((remaining / COUNTDOWN) * 100), 0)}%`,
                  }}
                />
              </div>
            </div>

            <button type="button" className="cp-btn cp-btn--outline" onClick={onBackToLogin}>
              Voltar ao início de sessão
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
