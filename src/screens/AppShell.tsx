import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NAV } from '../domain/navigation';
import { COMPACT_BREAKPOINT, NARROW_BREAKPOINT, useViewportWidth } from '../hooks/useViewport';
import type { Route } from '../domain/types';

export interface PrimaryAction {
  label: string;
  onClick: () => void;
}

interface AppShellProps {
  route: Route;
  onNavigate: (route: Route) => void;
  onLogout: () => void;
  user: { name: string; role: string; initials: string };
  breadcrumb: string;
  title: string;
  subtitle: string;
  primaryAction?: PrimaryAction;
  children: ReactNode;
}

export function AppShell({
  route,
  onNavigate,
  onLogout,
  user,
  breadcrumb,
  title,
  subtitle,
  primaryAction,
  children,
}: AppShellProps) {
  const width = useViewportWidth();
  const narrow = width < NARROW_BREAKPOINT;
  const compact = width < COMPACT_BREAKPOINT;

  const [collapsed, setCollapsed] = useState(() => narrow);
  const wasNarrow = useRef(narrow);

  // Entering the narrow breakpoint turns the sidebar into a closed drawer.
  useEffect(() => {
    if (narrow && !wasNarrow.current) setCollapsed(true);
    wasNarrow.current = narrow;
  }, [narrow]);

  function navigate(next: Route) {
    onNavigate(next);
    if (narrow) setCollapsed(true);
  }

  const showAside = !(narrow && collapsed);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cp-canvas)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          height: 'var(--cp-header-h)',
          background: 'var(--cp-navy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label="Alternar menu"
            aria-expanded={!collapsed}
            style={{
              width: 36,
              height: 36,
              flex: 'none',
              border: 'none',
              borderRadius: 'var(--cp-radius)',
              background: 'rgba(255,255,255,0.08)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            }}
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                aria-hidden
                style={{ width: 15, height: 2, background: '#fff', borderRadius: 'var(--cp-radius)' }}
              />
            ))}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div
              aria-hidden
              style={{
                width: 26,
                height: 26,
                flex: 'none',
                borderRadius: 'var(--cp-radius)',
                background: 'var(--cp-accent)',
              }}
            />
            <span style={{ fontSize: 17, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
              Construct<span style={{ color: 'var(--cp-accent)' }}>+</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 'none' }}>
          {!compact && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                lineHeight: 1.3,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{user.name}</span>
              <span style={{ fontSize: 11, color: 'var(--cp-text-faint)' }}>{user.role}</span>
            </div>
          )}
          <div
            aria-hidden
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'var(--cp-navy-light)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {user.initials}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
        {narrow && !collapsed && (
          <div
            className="cp-anim-fade-in"
            onClick={() => setCollapsed(true)}
            style={{
              position: 'fixed',
              inset: 'var(--cp-header-h) 0 0 0',
              background: 'var(--cp-scrim)',
              zIndex: 30,
            }}
          />
        )}

        {showAside && (
          <aside
            className={collapsed ? 'cp-aside cp-aside--collapsed' : 'cp-aside'}
            aria-label="Navegação principal"
            style={{
              position: narrow ? 'fixed' : 'sticky',
              top: 'var(--cp-header-h)',
              left: 0,
              zIndex: 31,
              width: collapsed ? 'var(--cp-aside-w-collapsed)' : 'var(--cp-aside-w)',
              flex: 'none',
              height: 'calc(100vh - var(--cp-header-h))',
              background: 'var(--cp-surface)',
              borderRight: '1px solid var(--cp-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              overflowY: 'auto',
              transition: 'width .18s ease',
            }}
          >
            <nav
              style={{
                padding: '16px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              {NAV.map((group, gi) => (
                <div
                  key={group.label || `group-${gi}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  {group.label && !collapsed && (
                    <p className="cp-nav-group-label">{group.label}</p>
                  )}
                  {group.items.map((item) => {
                    const active =
                      route === item.id ||
                      (route === 'orcamento-edit' && item.id === 'orcamentos');
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={active ? 'cp-nav-item is-active' : 'cp-nav-item'}
                        onClick={() => navigate(item.id)}
                        title={item.label}
                        aria-current={active ? 'page' : undefined}
                      >
                        <span className="cp-nav-item__chip">{item.abbr}</span>
                        <span className="cp-nav-item__label">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>

            <div style={{ padding: 12, borderTop: '1px solid var(--cp-border)' }}>
              <button
                type="button"
                className="cp-nav-item cp-nav-item--danger"
                onClick={onLogout}
              >
                <span className="cp-nav-item__chip">SA</span>
                <span className="cp-nav-item__label">Terminar sessão</span>
              </button>
            </div>
          </aside>
        )}

        <main style={{ flex: 1, minWidth: 0, padding: compact ? 16 : 32 }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                className="cp-eyebrow"
                style={{ letterSpacing: '0.06em', marginBottom: 6, fontWeight: 500, fontSize: 12 }}
              >
                {breadcrumb}
              </p>
              <h1 className="cp-page-title">{title}</h1>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: 'var(--cp-text-muted)',
                  marginTop: 8,
                  maxWidth: '62ch',
                  textWrap: 'pretty',
                }}
              >
                {subtitle}
              </p>
            </div>

            {primaryAction && (
              <button
                type="button"
                className="cp-btn cp-btn--accent cp-btn--glow"
                style={{ flex: 'none' }}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </button>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
