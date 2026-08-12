import { useState, type FormEvent } from 'react';
import { Button, InlineNotification, TextInput } from '@constructpluseu/react';
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
    <div className="cp-login">
      {showBrandPanel && (
        <aside className="cp-login__brand">
          <Brand on="brand" />
          <div className="cp-login__pitch">
            <h1>Gestão de obra, do orçamento à faturação.</h1>
            <p>
              Agenda, aprovisionamento e orçamentos numa única plataforma para equipas de
              construção e reabilitação.
            </p>
          </div>
          <p className="cp-login__legal">Construct Plus, Lda · Aveiro, Portugal</p>
        </aside>
      )}

      <div className="cp-login__panel">
        <form onSubmit={submit} className="cp-login__form">
          <Brand on="surface" />

          <div>
            <h2 className="cp-heading-md">Entrar na conta</h2>
            <p className="cp-body cp-muted">Introduza as credenciais da sua organização.</p>
          </div>

          {error && (
            <InlineNotification
              status="danger"
              title={error}
              description="Verifique o email e a palavra-passe e tente novamente."
            />
          )}

          <TextInput
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="nome@empresa.pt"
          />

          <div>
            <TextInput
              label="Palavra-passe"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="••••••••"
            />
            <div className="cp-stack-end">
              <Button variant="ghost" size="sm" type="button" onClick={onRecover}>
                Esqueceu-se da palavra-passe?
              </Button>
            </div>
          </div>

          <Button type="submit" variant="accent" size="lg" fullWidth>
            Iniciar sessão
          </Button>

          <p className="cp-login__demo">
            Demo: <strong>{demoEmail}</strong> · palavra-passe <strong>{DEMO_PASSWORD}</strong>
          </p>
        </form>
      </div>
    </div>
  );
}
