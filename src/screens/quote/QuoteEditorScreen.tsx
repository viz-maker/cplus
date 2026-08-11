import { useState } from 'react';
import { Button, Card, DatePicker, NumberInput, Select, TextInput } from '@constructpluseu/react';
import {
  ambienteTotal,
  byId,
  isLowStock,
  lineTotal,
  quoteGross,
  quoteLineCount,
  quoteVat,
} from '../../domain/selectors';
import { eur, num, toNum } from '../../lib/format';
import { uid } from '../../lib/id';
import type { Ambiente, Artigo, DataState, LinhaOrcamento, Orcamento } from '../../domain/types';

interface QuoteEditorScreenProps {
  quote: Orcamento;
  data: DataState;
  onChange: (quote: Orcamento) => void;
  /** Resolves once the quote is stored; the caller navigates away on success. */
  onSave: () => Promise<void>;
  onCancel: () => void;
}

/**
 * Per-ambiente line editing. The design system's `DataTable` sorts and selects
 * but does not edit in place, so these tables stay hand-built — the fields
 * inside them are design-system components.
 */
export function QuoteEditorScreen({
  quote,
  data,
  onChange,
  onSave,
  onCancel,
}: QuoteEditorScreenProps) {
  const [saving, setSaving] = useState(false);
  const clientes = data.parceiros.filter((p) => p.tipos.includes('Cliente'));
  const artigos = data.catalogo.filter((i) => i.ativo);
  const artigoOptions = artigos.map((a) => ({ value: a.id, label: a.nome }));

  async function submit() {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  }

  const patch = (p: Partial<Orcamento>) => onChange({ ...quote, ...p });

  const patchAmbiente = (index: number, p: Partial<Ambiente>) =>
    patch({ ambientes: quote.ambientes.map((a, i) => (i === index ? { ...a, ...p } : a)) });

  const patchLinha = (ai: number, li: number, p: Partial<LinhaOrcamento>) =>
    patchAmbiente(ai, {
      linhas: quote.ambientes[ai].linhas.map((l, i) => (i === li ? { ...l, ...p } : l)),
    });

  const addLinha = (ai: number) => {
    const first = artigos[0];
    if (!first) return;
    patchAmbiente(ai, {
      linhas: [
        ...quote.ambientes[ai].linhas,
        { id: uid('l'), itemId: first.id, qtd: 1, preco: toNum(first.precoUnit), nota: '' },
      ],
    });
  };

  return (
    <div className="cp-stack-lg" aria-label="Editor de orçamento">
      <Card title="Dados do orçamento">
        <div className="cp-field-grid">
          <Select
            label="Cliente"
            options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
            value={quote.clienteId}
            onChange={(e) => patch({ clienteId: e.target.value })}
          />
          <DatePicker
            label="Data de emissão"
            value={quote.dataEmissao || null}
            onChange={(v) => patch({ dataEmissao: v ?? '' })}
          />
          <DatePicker
            label="Data de validade"
            value={quote.dataValidade || null}
            onChange={(v) => patch({ dataValidade: v ?? '' })}
          />
          <TextInput
            label="Referência da obra"
            value={quote.obra}
            onChange={(e) => patch({ obra: e.target.value })}
            placeholder="Ex.: Reabilitação Rua do Carmo, 14"
          />
        </div>
      </Card>

      {quote.ambientes.map((ambiente, ai) => (
        <Card
          key={ambiente.id}
          title={
            <TextInput
              aria-label="Nome do ambiente"
              value={ambiente.nome}
              onChange={(e) => patchAmbiente(ai, { nome: e.target.value })}
            />
          }
          headerAction={
            <span className="cp-amb-actions">
              <strong>{eur(ambienteTotal(ambiente))}</strong>
              <Button
                variant="danger"
                size="sm"
                onClick={() => patch({ ambientes: quote.ambientes.filter((_, i) => i !== ai) })}
              >
                Remover ambiente
              </Button>
            </span>
          }
          footer={
            <Button variant="secondary" size="sm" onClick={() => addLinha(ai)} disabled={!artigos.length}>
              + Adicionar artigo
            </Button>
          }
        >
          <div className="cp-scroll-x">
            <table className="cp-lines">
              <thead>
                <tr>
                  <th scope="col">Artigo do catálogo</th>
                  <th scope="col">Quantidade</th>
                  <th scope="col">Preço unitário</th>
                  <th scope="col">Nota</th>
                  <th scope="col" className="cp-lines__end">
                    Total
                  </th>
                  <th scope="col">
                    <span className="cp-visually-hidden">Remover</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ambiente.linhas.map((linha, li) => (
                  <tr key={linha.id}>
                    <td>
                      <Select
                        aria-label="Artigo do catálogo"
                        size="sm"
                        options={artigoOptions}
                        value={linha.itemId}
                        onChange={(e) => {
                          const next = byId(data.catalogo, e.target.value);
                          patchLinha(ai, li, {
                            itemId: e.target.value,
                            preco: next ? toNum(next.precoUnit) : 0,
                          });
                        }}
                      />
                      <p className="cp-help">{artigoMeta(byId(data.catalogo, linha.itemId))}</p>
                    </td>
                    <td>
                      <NumberInput
                        aria-label="Quantidade"
                        size="sm"
                        step={0.01}
                        min={0}
                        value={toNum(linha.qtd)}
                        onChange={(v) => patchLinha(ai, li, { qtd: v })}
                      />
                    </td>
                    <td>
                      <NumberInput
                        aria-label="Preço unitário"
                        size="sm"
                        step={0.01}
                        min={0}
                        value={toNum(linha.preco)}
                        onChange={(v) => patchLinha(ai, li, { preco: v })}
                      />
                    </td>
                    <td>
                      <TextInput
                        aria-label="Nota"
                        size="sm"
                        value={linha.nota}
                        onChange={(e) => patchLinha(ai, li, { nota: e.target.value })}
                        placeholder="Opcional"
                      />
                    </td>
                    <td className="cp-lines__end cp-strong">
                      {eur(lineTotal(linha.qtd, linha.preco))}
                    </td>
                    <td className="cp-lines__end">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remover linha"
                        onClick={() =>
                          patchAmbiente(ai, {
                            linhas: ambiente.linhas.filter((_, i) => i !== li),
                          })
                        }
                      >
                        ×
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ))}

      <Card>
        <div className="cp-quote-totals">
          <Button
            variant="secondary"
            onClick={() =>
              patch({
                ambientes: [
                  ...quote.ambientes,
                  { id: uid('e'), nome: 'Novo ambiente', linhas: [] },
                ],
              })
            }
          >
            + Novo ambiente
          </Button>

          <div className="cp-quote-totals__figures">
            <Total label="Artigos" value={String(quoteLineCount(quote))} />
            <Total label="IVA (23%)" value={eur(quoteVat(quote))} />
            <div className="cp-quote-total-grand">
              <p className="cp-body cp-muted">Total com IVA</p>
              <p>{eur(quoteGross(quote))}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="cp-stack-end">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="accent" onClick={submit} loading={saving}>
          Guardar orçamento
        </Button>
      </div>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="cp-quote-total">
      <p className="cp-body cp-muted">{label}</p>
      <p className="cp-strong">{value}</p>
    </div>
  );
}

function artigoMeta(artigo: Artigo | null): string {
  if (!artigo) return '';
  const low = isLowStock(artigo) ? ' (abaixo do mínimo)' : '';
  return `${artigo.sku} · ${artigo.unidade} · stock ${num(artigo.stock)}${low}`;
}
