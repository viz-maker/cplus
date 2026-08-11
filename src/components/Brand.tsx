interface BrandProps {
  /** `onDark` puts a solid accent tile next to white type; `onLight` inverts it. */
  tone: 'onDark' | 'onLight';
  tile?: number;
  fontSize?: number;
}

export function Brand({ tone, tile = 34, fontSize = 20 }: BrandProps) {
  const onDark = tone === 'onDark';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
      <div
        aria-hidden
        style={{
          width: tile,
          height: tile,
          flex: 'none',
          borderRadius: 'var(--cp-radius)',
          background: onDark ? 'var(--cp-accent)' : 'var(--cp-navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!onDark && (
          <div
            style={{
              width: Math.round(tile * 0.35),
              height: Math.round(tile * 0.35),
              borderRadius: 'var(--cp-radius)',
              background: 'var(--cp-accent)',
            }}
          />
        )}
      </div>
      <span
        style={{
          fontSize,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          color: onDark ? '#fff' : 'var(--cp-navy)',
          whiteSpace: 'nowrap',
        }}
      >
        Construct<span style={{ color: 'var(--cp-accent)' }}>+</span>
      </span>
    </div>
  );
}
