import type { Toast, ToastKind } from '../store/AppStore';

const TONE: Record<ToastKind, { fg: string; border: string }> = {
  ok: { fg: 'var(--cp-success)', border: 'var(--cp-success-border)' },
  err: { fg: 'var(--cp-danger)', border: 'var(--cp-danger-border)' },
  info: { fg: 'var(--cp-info)', border: 'var(--cp-info-border)' },
};

export function Toasts({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      style={{
        position: 'fixed',
        top: 76,
        right: 20,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((t) => {
        const tone = TONE[t.kind];
        return (
          <div
            key={t.id}
            className="cp-anim-slide-in"
            style={{
              minWidth: 280,
              maxWidth: 360,
              padding: '14px 16px',
              borderRadius: 'var(--cp-radius)',
              background: 'var(--cp-surface)',
              border: `1px solid ${tone.border}`,
              boxShadow: 'var(--cp-shadow-overlay)',
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                marginTop: 6,
                flex: 'none',
                background: tone.fg,
              }}
            />
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: tone.fg }}>{t.title}</p>
              {t.text && (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.4,
                    color: 'var(--cp-text-muted)',
                    marginTop: 4,
                  }}
                >
                  {t.text}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
