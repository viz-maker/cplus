interface DataStatePanelProps {
  isLoading: boolean;
  error: Error | undefined;
  onRetry: () => void;
}

/** Stands in for the page content while `/api/bootstrap` is in flight or failed. */
export function DataStatePanel({ isLoading, error, onRetry }: DataStatePanelProps) {
  if (error) {
    return (
      <section className="cp-card" style={{ padding: 48, textAlign: 'center' }} role="alert">
        <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--cp-navy)', marginBottom: 6 }}>
          Não foi possível carregar os dados
        </p>
        <p
          style={{
            fontSize: 14,
            color: 'var(--cp-text-muted)',
            marginBottom: 20,
            maxWidth: '52ch',
            marginInline: 'auto',
          }}
        >
          {error.message} Verifique a ligação e tente novamente.
        </p>
        <button type="button" className="cp-btn cp-btn--navy" onClick={onRetry}>
          Tentar novamente
        </button>
      </section>
    );
  }

  return (
    <section className="cp-card" style={{ padding: 24 }} aria-busy={isLoading}>
      <span className="cp-visually-hidden">A carregar dados…</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[72, 56, 56, 56, 56].map((height, i) => (
          <div
            key={i}
            aria-hidden
            className="cp-skeleton"
            style={{ height, borderRadius: 'var(--cp-radius)' }}
          />
        ))}
      </div>
    </section>
  );
}
