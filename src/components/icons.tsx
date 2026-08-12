/**
 * Ícones lineares simples, no estilo que o design system prescreve.
 *
 * O `@constructpluseu/react` não exporta ícones, por isso ficam aqui. Usam
 * `currentColor`, portanto herdam a cor de quem os contém, e são `aria-hidden`
 * — quem os usa dá o nome acessível no botão.
 */

interface IconProps {
  size?: number;
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
});

/** Sol — acende o tema claro. */
export function SunIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.4v2.2M12 19.4v2.2M2.4 12h2.2M19.4 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
    </svg>
  );
}

/** Lua — acende o tema escuro. */
export function MoonIcon({ size = 18 }: IconProps) {
  return (
    <svg {...base(size)}>
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z" />
    </svg>
  );
}
