import { useState, type FormEvent } from 'react';
import { Brand } from '../components/Brand';
import { BRAND_BREAKPOINT, useViewportWidth } from '../hooks/useViewport';

/**
 * Demo credential. Replace this whole check with a call to the auth endpoint
 * once the backend exists — `onSuccess` is the only thing the app depends on.
 */
const DEMO_PASSWORD = 'construct';

interface LoginScreenProps {
  demoEmail: string;
  onSuccess: (email: string) => void;
  onRecover: () => void;
  onError: (message: string) => void;
}

export function LoginScreen({ demoEmail, onSuccess, onRecover, onError }: LoginScreenProps) {
  const [email, setEmail] = useState(demoEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const showBrandPanel = useViewportWidth() >= BRAND_BREAKPOINT;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== DEMO_PASSWORD || !email.includes('@')) {
      const message = 'Email ou palavra-passe inválidos';
      setError(message);
      onError(message);
      return;
    }
    setError('');
    setPassword('');
    onSuccess(email);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--cp-navy)' }}>
      {showBrandPanel && (
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: 64,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'var(--cp-navy)',
          }}
        >
          <Brand tone="onDark" />
          <div style={{ maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1
              style={{
                fontSize: 36,
                lineHeight: 1.15,
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              Gestão de obra, do orçamento à faturação.
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--cp-text-faint)' }}>
              Agenda, aprovisionamento e orçamentos numa única plataforma para equipas de
              construção e reabilitação.
            </p>
          </div>
          <p style={{ fontSize: 12, color: 'var(--cp-text-muted)' }}>
            Construct Plus, Lda · Aveiro, Portugal
          </p>
        </div>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: showBrandPanel ? 560 : undefined,
          flex: showBrandPanel ? undefined : 1,
          background: 'var(--cp-canvas)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <form
          onSubmit={submit}
          className="cp-anim-fade-up"
          style={{
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <Brand tone="onLight" />

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
              Entrar na conta
            </h2>
            <p style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--cp-text-muted)' }}>
              Introduza as credenciais da sua organização.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="cp-anim-fade-in"
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                padding: '12px 14px',
                borderRadius: 'var(--cp-radius)',
                background: 'var(--cp-danger-bg)',
                border: '1px solid var(--cp-danger-border)',
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--cp-danger)',
                  marginTop: 6,
                  flex: 'none',
                }}
              />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--cp-danger)' }}>{error}</p>
                <p
                  style={{
                    fontSize: 12,
                    lineHeight: 1.4,
                    color: 'var(--cp-danger)',
                    opacity: 0.85,
                    marginTop: 4,
                  }}
                >
                  Verifique o email e a palavra-passe e tente novamente.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <label className="cp-label" htmlFor="cp-email">
                Email
              </label>
              <input
                id="cp-email"
                className="cp-input"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="nome@empresa.pt"
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  marginBottom: 6,
                }}
              >
                <label
                  className="cp-label"
                  htmlFor="cp-pass"
                  style={{ marginBottom: 0, display: 'inline' }}
                >
                  Palavra-passe
                </label>
                <button type="button" className="cp-btn--link" onClick={onRecover}>
                  Esqueceu-se da palavra-passe?
                </button>
              </div>
              <input
                id="cp-pass"
                className="cp-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="cp-btn cp-btn--accent cp-btn--glow cp-btn--block"
            style={{ padding: '13px 20px', fontSize: 15 }}
          >
            Iniciar sessão
          </button>

          <p
            style={{
              fontSize: 12,
              lineHeight: 1.5,
              color: 'var(--cp-text-faint)',
              padding: '12px 14px',
              background: 'var(--cp-surface-alt)',
              borderRadius: 'var(--cp-radius)',
              border: '1px solid var(--cp-border)',
            }}
          >
            Demo: <strong style={{ color: 'var(--cp-text-muted)' }}>{demoEmail}</strong> ·
            palavra-passe <strong style={{ color: 'var(--cp-text-muted)' }}>{DEMO_PASSWORD}</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
