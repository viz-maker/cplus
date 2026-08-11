import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Avatar, Button, Header, SideNav } from '@constructpluseu/react';
import { NAV } from '../domain/navigation';
import { COMPACT_BREAKPOINT, NARROW_BREAKPOINT, useViewportWidth } from '../hooks/useViewport';
import { useTheme } from '../hooks/useTheme';
import type { SideNavItem } from '@constructpluseu/react';
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

/** Groups with a label become expandable parents; the unlabelled group is flattened. */
const NAV_ITEMS: SideNavItem[] = NAV.flatMap((group): SideNavItem[] => {
  const leaves = group.items.map((item) => ({
    id: item.id,
    label: item.label,
    href: `#${item.id}`,
  }));
  if (!group.label) return leaves;
  return [
    {
      id: `grupo-${group.label.toLowerCase()}`,
      label: group.label,
      href: `#${group.items[0].id}`,
      children: leaves,
    },
  ];
});

const GROUP_OF: Record<string, string> = Object.fromEntries(
  NAV.filter((g) => g.label).flatMap((g) =>
    g.items.map((i) => [i.id, `grupo-${g.label.toLowerCase()}`]),
  ),
);

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
  const { theme, toggle } = useTheme();

  const [navOpen, setNavOpen] = useState(!narrow);
  const wasNarrow = useRef(narrow);

  // Entering the narrow breakpoint turns the sidebar into a closed drawer.
  useEffect(() => {
    if (narrow && !wasNarrow.current) setNavOpen(false);
    wasNarrow.current = narrow;
  }, [narrow]);

  const activeId = route === 'orcamento-edit' ? 'orcamentos' : route;
  const [expandedIds, setExpandedIds] = useState<string[]>(() =>
    GROUP_OF[activeId] ? [GROUP_OF[activeId]] : [],
  );

  // Keep the group containing the active route open.
  useEffect(() => {
    const group = GROUP_OF[activeId];
    if (group) setExpandedIds((ids) => (ids.includes(group) ? ids : [...ids, group]));
  }, [activeId]);

  /**
   * `SideNav` is link-driven and exposes no `onSelect`, so navigation is caught
   * here from the anchor it renders. Switching the app to real Next routes
   * (`/agenda`, `/catalogo`, …) would remove this adapter — see
   * docs/migracao-design-system.md.
   */
  function interceptNavClick(event: MouseEvent<HTMLDivElement>) {
    const anchor = (event.target as HTMLElement).closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute('href')?.slice(1);
    if (!id) return;
    event.preventDefault();
    onNavigate(id as Route);
    if (narrow) setNavOpen(false);
  }

  return (
    <div className="cp-app">
      <Header brand="Construct+" navOpen={navOpen} onMenuToggle={() => setNavOpen((o) => !o)}>
        <div className="cp-app__header-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? 'Claro' : 'Escuro'}
          </Button>
          {!compact && (
            <span className="cp-app__user">
              <strong>{user.name}</strong>
              <small>{user.role}</small>
            </span>
          )}
          <Avatar name={user.name} size="sm" />
          <Button variant="ghost" size="sm" onClick={onLogout}>
            Terminar sessão
          </Button>
        </div>
      </Header>

      <div className="cp-app__body">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div className="cp-app__nav" onClick={interceptNavClick}>
          <SideNav
            label="Navegação principal"
            items={NAV_ITEMS}
            activeId={activeId}
            expandedIds={expandedIds}
            onExpandedChange={setExpandedIds}
            open={navOpen}
          />
        </div>

        <main className="cp-app__main">
          <div className="cp-page-header">
            <div className="cp-page-header__text">
              <p className="cp-eyebrow">{breadcrumb}</p>
              <h1 className="cp-heading-lg">{title}</h1>
              <p className="cp-body cp-muted cp-measure">{subtitle}</p>
            </div>

            {primaryAction && (
              <Button variant="accent" onClick={primaryAction.onClick}>
                {primaryAction.label}
              </Button>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
