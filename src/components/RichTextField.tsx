import { useEffect, useRef } from 'react';

interface ToolbarButton {
  label: string;
  title: string;
  command: string;
  weight: number;
}

const TOOLBAR: ToolbarButton[] = [
  { label: 'B', title: 'Negrito', command: 'bold', weight: 700 },
  { label: 'I', title: 'Itálico', command: 'italic', weight: 400 },
  { label: '• Lista', title: 'Lista com marcas', command: 'insertUnorderedList', weight: 500 },
  { label: '1. Lista', title: 'Lista numerada', command: 'insertOrderedList', weight: 500 },
];

interface RichTextFieldProps {
  label: string;
  /** HTML. Seeded into the editor on mount only — the field is uncontrolled after that. */
  value: string;
  onChange: (html: string) => void;
}

/**
 * Minimal rich-text field for marcação notes.
 *
 * `document.execCommand` is deprecated but is still the only cross-browser way to
 * apply formatting to a `contenteditable` without pulling in an editor library.
 * Swap this component out if the notes ever need more than bold/italic/lists.
 */
export function RichTextField({ label, value, onChange }: RichTextFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Seed once; re-seeding on every render would fight the caret.
  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyCommand(command: string) {
    document.execCommand(command);
    if (editorRef.current) onChange(editorRef.current.innerHTML);
  }

  return (
    <div>
      <span className="cp-label">{label}</span>
      <div
        style={{
          border: '1px solid var(--cp-border)',
          borderRadius: 'var(--cp-radius)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 4,
            padding: 8,
            borderBottom: '1px solid var(--cp-border)',
            background: 'var(--cp-surface-alt)',
          }}
        >
          {TOOLBAR.map((b) => (
            <button
              key={b.command}
              type="button"
              title={b.title}
              aria-label={b.title}
              // mousedown + preventDefault keeps the text selection while the command runs
              onMouseDown={(e) => {
                e.preventDefault();
                applyCommand(b.command);
              }}
              style={{
                minWidth: 32,
                height: 32,
                padding: '0 10px',
                whiteSpace: 'nowrap',
                border: '1px solid var(--cp-border)',
                borderRadius: 'var(--cp-radius)',
                background: 'var(--cp-surface)',
                color: 'var(--cp-navy)',
                fontSize: 13,
                fontWeight: b.weight,
                cursor: 'pointer',
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          style={{
            minHeight: 120,
            padding: '14px 16px',
            fontSize: 14,
            lineHeight: 1.6,
            color: 'var(--cp-navy)',
            background: 'var(--cp-surface)',
          }}
        />
      </div>
    </div>
  );
}
