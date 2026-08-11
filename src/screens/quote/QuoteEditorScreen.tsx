import { useState } from 'react';
import {
  ambienteTotal,
  byId,
  isLowStock,
  lineTotal,
  quoteGross,
  quoteLineCount,
  quoteVat,
} from '../../domain/selectors';
import { eur, num } from '../../lib/format';
import { uid } from '../../lib/id';
import type {
  Ambiente,
  Artigo,
  DataState,
  LinhaOrcamento,
  Orcamento,
} from '../../domain/types';

interface QuoteEditorScreenProps {
  quote: Orcamento;
  data: DataState;
  onChange: (quote: Orcamento) => void;
  /** Resolves once the quote is stored; the caller navigates away on success. */
  onSave: () => Promise<void>;
  onCancel: () => void;
}

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

  const removeAmbiente = (index: number) =>
    patch({ ambientes: quote.ambientes.filter((_, i) => i !== index) });

  const addAmbiente = () =>
    patch({ ambientes: [...quote.ambientes, { id: uid('e'), nome: 'Novo ambiente', linhas: [] }] });

  const addLinha = (ai: number) => {
    const first = artigos[0];
    if (!first) return;
    patchAmbiente(ai, {
      linhas: [
        ...quote.ambientes[ai].linhas,
        { id: uid('l'), itemId: first.id, qtd: 1, preco: first.precoUnit, nota: '' },
      ],
    });
  };

  const removeLinha = (ai: number, li: number) =>
    patchAmbiente(ai, { linhas: quote.ambientes[ai].linhas.filter((_, i) => i !== li) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} aria-label="Editor de orçamento">
      <section className="cp-card" style={{ padding: 24 }}>
        <h2 className="cp-section-title" style={{ marginBottom: 20 }}>
          Dados do orçamento
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}
        >
          <div>
            <label className="cp-label" htmlFor="q-cliente">
              Cliente
            </label>
            <select
              id="q-cliente"
              className="cp-select"
              value={quote.clienteId}
              onChange={(e) => patch({ clienteId: e.target.value })}
            >
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="cp-label" htmlFor="q-emissao">
              Data de emissão
            </label>
            <input
              id="q-emissao"
              className="cp-input"
              type="date"
              value={quote.dataEmissao}
              onChange={(e) => patch({ dataEmissao: e.target.value })}
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="q-validade">
              Data de validade
            </label>
            <input
              id="q-validade"
              className="cp-input"
              type="date"
              value={quote.dataValidade}
              onChange={(e) => patch({ dataValidade: e.target.value })}
            />
          </div>
          <div>
            <label className="cp-label" htmlFor="q-obra">
              Referência da obra
            </label>
            <input
              id="q-obra"
              className="cp-input"
              type="text"
              value={quote.obra}
              onChange={(e) => patch({ obra: e.target.value })}
              placeholder="Ex.: Reabilitação Rua do Carmo, 14"
            />
          </div>
        </div>
      </section>

      {quote.ambientes.map((ambiente, ai) => (
        <section key={ambiente.id} className="cp-card cp-card--clip">
          <div className="cp-card__header" style={{ background: 'var(--cp-surface-alt)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 240 }}>
              <span className="cp-eyebrow" style={{ letterSpacing: '0.06em', fontWeight: 500 }}>
                Ambiente
              </span>
              <input
                className="cp-input"
                type="text"
                aria-label="Nome do ambiente"
                value={ambiente.nome}
                onChange={(e) => patchAmbiente(ai, { nome: e.target.value })}
                style={{ flex: 1, minWidth: 0, padding: '8px 14px', fontWeight: 600 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--cp-navy)' }}>
                {eur(ambienteTotal(ambiente))}
              </span>
              <button
                type="button"
                className="cp-btn cp-btn--danger-outline cp-btn--sm"
                onClick={() => removeAmbiente(ai)}
              >
                Remover ambiente
              </button>
            </div>
          </div>

          <div className="cp-scroll-x">
            <table className="cp-table cp-table--compact" style={{ minWidth: 820 }}>
              <thead>
                <tr>
                  <th scope="col" style={{ textAlign: 'left' }}>
                    Artigo do catálogo
                  </th>
                  <th scope="col" style={{ textAlign: 'left', width: 110 }}>
                    Quantidade
                  </th>
                  <th scope="col" style={{ textAlign: 'left', width: 130 }}>
                    Preço unitário
                  </th>
                  <th scope="col" style={{ textAlign: 'left' }}>
                    Nota
                  </th>
                  <th scope="col" style={{ textAlign: 'right', width: 120 }}>
                    Total
                  </th>
                  <th style={{ width: 52 }}>
                    <span className="cp-visually-hidden">Remover</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ambiente.linhas.map((linha, li) => {
                  const artigo = byId(data.catalogo, linha.itemId);
                  return (
                    <tr key={linha.id}>
                      <td>
                        <select
                          className="cp-select cp-input--sm"
                          aria-label="Artigo do catálogo"
                          value={linha.itemId}
                          onChange={(e) => {
                            const next = byId(data.catalogo, e.target.value);
                            patchLinha(ai, li, {
                              itemId: e.target.value,
                              preco: next ? next.precoUnit : 0,
                            });
                          }}
                        >
                          {artigos.map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.nome}
                            </option>
                          ))}
                        </select>
                        <p className="cp-help">{artigoMeta(artigo)}</p>
                      </td>
                      <td>
                        <input
                          className="cp-input cp-input--sm cp-input--numeric"
                          aria-label="Quantidade"
                          type="number"
                          step="0.01"
                          min="0"
                          value={linha.qtd}
                          onChange={(e) => patchLinha(ai, li, { qtd: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="cp-input cp-input--sm cp-input--numeric"
                          aria-label="Preço unitário"
                          type="number"
                          step="0.01"
                          min="0"
                          value={linha.preco}
                          onChange={(e) => patchLinha(ai, li, { preco: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          className="cp-input cp-input--sm"
                          aria-label="Nota"
                          type="text"
                          value={linha.nota}
                          onChange={(e) => patchLinha(ai, li, { nota: e.target.value })}
                          placeholder="Opcional"
                        />
                      </td>
                      <td
                        style={{
                          textAlign: 'right',
                          fontSize: 14,
                          fontWeight: 600,
                          color: 'var(--cp-navy)',
                        }}
                      >
                        {eur(lineTotal(linha.qtd, linha.preco))}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="cp-btn cp-btn--subtle cp-btn--icon"
                          style={{ color: 'var(--cp-danger)', fontWeight: 600, fontSize: 15 }}
                          aria-label="Remover linha"
                          onClick={() => removeLinha(ai, li)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--cp-border-subtle)' }}>
            <button
              type="button"
              className="cp-btn cp-btn--dashed cp-btn--sm"
              onClick={() => addLinha(ai)}
              disabled={artigos.length === 0}
            >
              + Adicionar artigo
            </button>
          </div>
        </section>
      ))}

      <div
        className="cp-card"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
        }}
      >
        <button type="button" className="cp-btn cp-btn--dashed" onClick={addAmbiente}>
          + Novo ambiente
        </button>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <Total label="Artigos" value={String(quoteLineCount(quote))} />
          <Total label="IVA (23%)" value={eur(quoteVat(quote))} />
          <div
            style={{
              textAlign: 'right',
              paddingLeft: 32,
              borderLeft: '1px solid var(--cp-border)',
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--cp-text-muted)' }}>Total com IVA</p>
            <p
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: 'var(--cp-accent-active)',
                letterSpacing: '-0.02em',
                marginTop: 2,
              }}
            >
              {eur(quoteGross(quote))}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="cp-btn cp-btn--outline"
          style={{ padding: '12px 22px' }}
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="cp-btn cp-btn--accent cp-btn--glow"
          style={{ padding: '12px 22px' }}
          onClick={submit}
          disabled={saving}
        >
          {saving ? 'A guardar…' : 'Guardar orçamento'}
        </button>
      </div>
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <p style={{ fontSize: 12, color: 'var(--cp-text-muted)' }}>{label}</p>
      <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--cp-navy)', marginTop: 2 }}>
        {value}
      </p>
    </div>
  );
}

function artigoMeta(artigo: Artigo | null): string {
  if (!artigo) return '';
  const low = isLowStock(artigo) ? ' (abaixo do mínimo)' : '';
  return `${artigo.sku} · ${artigo.unidade} · stock ${num(artigo.stock)}${low}`;
}
