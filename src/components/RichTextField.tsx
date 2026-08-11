import { useEffect, useRef } from 'react';
import { Button } from '@constructpluseu/react';

interface ToolbarButton {
  label: string;
  title: string;
  command: string;
}

const TOOLBAR: ToolbarButton[] = [
  { label: 'B', title: 'Negrito', command: 'bold' },
  { label: 'I', title: 'Itálico', command: 'italic' },
  { label: '• Lista', title: 'Lista com marcas', command: 'insertUnorderedList' },
  { label: '1. Lista', title: 'Lista numerada', command: 'insertOrderedList' },
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
 * The design system has no rich-text component, so this stays hand-built — but
 * it is styled entirely with design-system tokens so it follows both themes.
 *
 * `document.execCommand` is deprecated but is still the only cross-browser way
 * to apply formatting to a `contenteditable` without an editor library.
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
      <span className="cp-field-label">{label}</span>
      <div className="cp-richtext">
        <div className="cp-richtext__toolbar">
          {TOOLBAR.map((b) => (
            <Button
              key={b.command}
              variant="secondary"
              size="sm"
              title={b.title}
              aria-label={b.title}
              // mousedown + preventDefault keeps the text selection while the command runs
              onMouseDown={(e) => {
                e.preventDefault();
                applyCommand(b.command);
              }}
            >
              {b.label}
            </Button>
          ))}
        </div>

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label={label}
          className="cp-richtext__editor"
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
        />
      </div>
    </div>
  );
}
