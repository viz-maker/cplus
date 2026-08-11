import { useState } from 'react';
import {
  Button,
  Combobox,
  FileUploader,
  NumberInput,
  Select,
  TextInput,
  Textarea,
  Toggle,
} from '@constructpluseu/react';
import { FieldGroup, Modal } from '../components/Modal';
import { grupoOfCategoria, subgrupoOfCategoria } from '../domain/selectors';
import { UNIDADES } from '../domain/types';
import { toNum } from '../lib/format';
import type { Artigo, DataState, Parceiro, Unidade } from '../domain/types';

const UNIDADE_OPTIONS = UNIDADES.map((u) => ({ value: u, label: u }));

interface ItemModalProps {
  /** `null` for a new article. */
  record: Artigo | null;
  data: DataState;
  onClose: () => void;
  /** Resolves once the record is stored; the caller closes the modal on success. */
  onSave: (record: Artigo) => Promise<void>;
  onDelete: (record: Artigo) => void;
  /** Creates a supplier inline and returns it, so it can be selected immediately. */
  onCreateSupplier: (nome: string) => Promise<Parceiro>;
}

const blank = (categoriaId: string): Artigo => ({
  id: '',
  nome: '',
  categoriaId,
  sku: '',
  codigoBarras: '',
  ncm: '',
  unidade: 'un',
  stock: 0,
  stockMin: 0,
  precoUnit: 0,
  markup: 0,
  custoMedio: 0,
  fornecedorId: '',
  ativo: true,
  descricao: '',
  notas: '',
  imagem: '',
});

export function ItemModal({
  record,
  data,
  onClose,
  onSave,
  onDelete,
  onCreateSupplier,
}: ItemModalProps) {
  const [draft, setDraft] = useState<Artigo>(() => record ?? blank(data.categorias[0]?.id ?? ''));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const patch = (p: Partial<Artigo>) => {
    setDraft((d) => ({ ...d, ...p }));
    setError('');
  };

  const grupo = grupoOfCategoria(data, draft.categoriaId);
  const subgrupo = subgrupoOfCategoria(data, draft.categoriaId);
  const fornecedores = data.parceiros.filter((p) => p.tipos.includes('Fornecedor'));

  async function save() {
    if (!draft.nome.trim()) {
      setError('O nome do artigo é obrigatório.');
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={record ? 'Editar artigo' : 'Adicionar artigo'}
      subtitle="Grupo e SubGrupo são preenchidos automaticamente a partir da categoria."
      size="lg"
      onClose={onClose}
      destructive={
        record && (
          <Button variant="danger" onClick={() => onDelete(record)} disabled={saving}>
            Eliminar
          </Button>
        )
      }
      actions={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button variant="accent" onClick={save} loading={saving}>
            Guardar artigo
          </Button>
        </>
      }
    >
      <FieldGroup title="Identificação">
        <div className="cp-field-grid">
          <div className="cp-field-grid__full">
            <TextInput
              label="Nome do artigo *"
              value={draft.nome}
              onChange={(e) => patch({ nome: e.target.value })}
              placeholder="Ex.: Cimento Portland CEM II 42,5R 25 kg"
              errorText={error || undefined}
            />
          </div>

          <Select
            label="Categoria *"
            options={data.categorias.map((c) => ({ value: c.id, label: c.nome }))}
            value={draft.categoriaId}
            onChange={(e) => patch({ categoriaId: e.target.value })}
          />
          <TextInput label="Grupo (automático)" readOnly value={grupo?.nome ?? '—'} />
          <TextInput label="SubGrupo (automático)" readOnly value={subgrupo?.nome ?? '—'} />

          <TextInput
            label="SKU"
            value={draft.sku}
            onChange={(e) => patch({ sku: e.target.value })}
          />
          <TextInput
            label="Código de barras"
            inputMode="numeric"
            value={draft.codigoBarras}
            onChange={(e) => patch({ codigoBarras: e.target.value })}
          />
          <TextInput
            label="NCM"
            value={draft.ncm}
            onChange={(e) => patch({ ncm: e.target.value })}
          />
          <Select
            label="Unidade"
            options={UNIDADE_OPTIONS}
            value={draft.unidade}
            onChange={(e) => patch({ unidade: e.target.value as Unidade })}
          />
        </div>
      </FieldGroup>

      <FieldGroup title="Stock e preços">
        <div className="cp-field-grid">
          <NumberInput
            label="Stock atual"
            step={0.01}
            value={toNum(draft.stock)}
            onChange={(v) => patch({ stock: v })}
          />
          <NumberInput
            label="Stock mínimo"
            step={0.01}
            value={toNum(draft.stockMin)}
            onChange={(v) => patch({ stockMin: v })}
            helperText="Abaixo deste valor o artigo é assinalado nos orçamentos."
          />
          <NumberInput
            label="Preço unitário (€)"
            step={0.01}
            value={toNum(draft.precoUnit)}
            onChange={(v) => patch({ precoUnit: v })}
          />
          <NumberInput
            label="Markup (%)"
            step={0.1}
            value={toNum(draft.markup)}
            onChange={(v) => patch({ markup: v })}
          />
          <NumberInput
            label="Custo médio (€)"
            step={0.01}
            value={toNum(draft.custoMedio)}
            onChange={(v) => patch({ custoMedio: v })}
          />
        </div>
      </FieldGroup>

      <div className="cp-two-col">
        <FieldGroup title="Fornecedor preferencial">
          <Combobox
            options={fornecedores.map((p) => ({ value: p.id, label: p.nome }))}
            value={draft.fornecedorId ? [draft.fornecedorId] : []}
            onChange={(v) => patch({ fornecedorId: v[0] ?? '' })}
            placeholder="Procurar fornecedor…"
          />
          <div className="cp-stack-start">
            <Button
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={async () => {
                const created = await onCreateSupplier('Novo fornecedor');
                patch({ fornecedorId: created.id });
              }}
            >
              + Adicionar novo fornecedor
            </Button>
          </div>
        </FieldGroup>

        <FieldGroup title="Estado">
          <Toggle
            label={draft.ativo ? 'Artigo ativo' : 'Artigo inativo'}
            checked={draft.ativo}
            onChange={() => patch({ ativo: !draft.ativo })}
          />
          <p className="cp-help">Artigos inativos não aparecem em orçamentos.</p>
        </FieldGroup>
      </div>

      <FieldGroup title="Imagem do artigo">
        <FileUploader
          files={files}
          accept="image/*"
          helperText={
            draft.imagem
              ? `Imagem atual: ${draft.imagem}`
              : 'PNG ou JPG · mínimo 512×512 píxeis'
          }
          onChange={(next) => {
            setFiles(next);
            patch({ imagem: next[0]?.name ?? '' });
          }}
        />
      </FieldGroup>

      <div className="cp-two-col">
        <Textarea
          label="Descrição detalhada"
          rows={4}
          value={draft.descricao}
          onChange={(e) => patch({ descricao: e.target.value })}
          placeholder="Composição, aplicação, normas aplicáveis…"
        />
        <Textarea
          label="Notas internas"
          rows={4}
          value={draft.notas}
          onChange={(e) => patch({ notas: e.target.value })}
          placeholder="Visível apenas para a equipa interna."
        />
      </div>
    </Modal>
  );
}
