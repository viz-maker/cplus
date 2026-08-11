interface BrandProps {
  /** `onDark` puts a solid accent tile next to inverse type; `onLight` inverts it. */
  tone: 'onDark' | 'onLight';
  tile?: number;
  fontSize?: number;
}

export function Brand({ tone, tile = 34, fontSize = 20 }: BrandProps) {
  const onDark = tone === 'onDark';
  return (
    <div className={onDark ? 'cp-brand cp-brand--on-dark' : 'cp-brand cp-brand--on-light'}>
      <div
        aria-hidden
        className="cp-brand__tile"
        style={{
          width: tile,
          height: tile,
          background: onDark
            ? 'var(--cp-color-semantic-bg-accent)'
            : 'var(--cp-color-semantic-bg-brand)',
        }}
      >
        {!onDark && (
          <div
            className="cp-brand__pip"
            style={{ width: Math.round(tile * 0.35), height: Math.round(tile * 0.35) }}
          />
        )}
      </div>
      <span
        className="cp-brand__word"
        style={{
          fontSize,
          color: onDark
            ? 'var(--cp-color-semantic-text-on-brand)'
            : 'var(--cp-color-semantic-text-primary)',
        }}
      >
        Construct<span className="cp-brand__plus">+</span>
      </span>
    </div>
  );
}
