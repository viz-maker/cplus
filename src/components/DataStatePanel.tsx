import { Button, Card, InlineNotification, Skeleton } from '@constructpluseu/react';

interface DataStatePanelProps {
  isLoading: boolean;
  error: Error | undefined;
  onRetry: () => void;
}

/** Stands in for the page content while `/api/bootstrap` is in flight or failed. */
export function DataStatePanel({ isLoading, error, onRetry }: DataStatePanelProps) {
  if (error) {
    return (
      <Card>
        <InlineNotification
          status="danger"
          title="Não foi possível carregar os dados"
          description={`${error.message} Verifique a ligação e tente novamente.`}
        />
        <div className="cp-stack-end">
          <Button variant="primary" onClick={onRetry}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card aria-busy={isLoading}>
      <span className="cp-visually-hidden">A carregar dados…</span>
      <div className="cp-skeleton-stack" aria-hidden>
        {[72, 56, 56, 56, 56].map((height, i) => (
          <Skeleton key={i} variant="rect" height={height} />
        ))}
      </div>
    </Card>
  );
}
