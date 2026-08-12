import { useEffect, useState, type FormEvent } from 'react';
import { Button, Card, InlineNotification, ProgressBar, TextInput } from '@constructpluseu/react';
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
    <div className="cp-centered-page">
      <Card className="cp-recover-card">
        <Brand on="surface" />

        {!sent ? (
          <form onSubmit={submit} className="cp-form-stack">
            <div>
              <h2 className="cp-heading-md">Recuperar acesso</h2>
              <p className="cp-body cp-muted">
                Indique o email da conta. Enviaremos uma ligação para definir uma nova
                palavra-passe.
              </p>
            </div>

            <TextInput
              label="Email da conta"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.pt"
            />

            <div className="cp-button-row">
              <Button variant="secondary" type="button" onClick={onBackToLogin}>
                Voltar
              </Button>
              <Button variant="accent" type="submit" fullWidth>
                Enviar ligação
              </Button>
            </div>
          </form>
        ) : (
          <div className="cp-form-stack">
            <InlineNotification
              status="success"
              title="Se este email estiver registado, foi enviada uma ligação de recuperação de palavra-passe."
            />

            <p className="cp-body cp-muted">
              Verifique também a pasta de spam. A ligação expira em 30 minutos.
            </p>

            <ProgressBar
              label="A regressar ao início de sessão"
              value={Math.max(remaining, 0)}
              max={COUNTDOWN}
            />

            <Button variant="secondary" onClick={onBackToLogin}>
              Voltar ao início de sessão
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
